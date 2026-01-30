package com.codestory.diary.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.codestory.diary.dto.CommentDto;
import com.codestory.diary.dto.DiaryDto;
import com.codestory.diary.dto.DiaryRequestDto;
import com.codestory.diary.entity.Comment;
import com.codestory.diary.entity.Diary;
import com.codestory.diary.entity.Likes;
import com.codestory.diary.entity.Member;
import com.codestory.diary.neo4j.GraphService;
import com.codestory.diary.repository.CommentRepository;
import com.codestory.diary.repository.DiaryRepository;
import com.codestory.diary.repository.LikesRepository;
import com.codestory.diary.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final MemberRepository memberRepository;
    private final CommentRepository commentRepository;
    private final LikesRepository likesRepository;
    private final AiService aiService;
    private final MemoryService memoryService;
    private final GraphService graphService;
    private final PiiMaskingService piiMaskingService;
    private final ChatService chatService; // ✨ 대화 히스토리 관리 및 LLM 검수 강화
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @Transactional
    public DiaryDto createDiaryWithImage(DiaryRequestDto request, MultipartFile imageFile) {
        String savedImageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.write(path, imageFile.getBytes());
                savedImageUrl = "/images/" + fileName;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ✨ 강화된 AI 응답 생성: ChatService를 활용하여 대화 히스토리 참고 + LLM 검수
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        String currentDiaryText = request.getContent();

        // ChatService를 통해 대화 히스토리를 참고한 AI 응답 생성
        // (내부적으로 RAG, PII 마스킹, 대화 저장 모두 처리됨)
        com.codestory.diary.dto.ChatResponseDto aiReplyDto = chatService.chat(request.getUserId(), currentDiaryText);
        String aiReply = aiReplyDto.getContent();

        // ✨ 벡터 DB 저장은 ChatService 내부에서 이미 처리되므로 중복 저장 불필요

        Diary newDiary = Diary.builder()
                .userId(request.getUserId())
                .date(request.getDate())
                .title(request.getTitle())
                .content(request.getContent())
                .emoji(request.getEmoji())
                .mood(request.getMood())
                .tension(request.getTension())
                .fun(request.getFun())
                .tags(request.getTags())
                .aiResponse(aiReply)
                .imageUrl(savedImageUrl)
                .isPublic(request.getIsPublic() != null && request.getIsPublic())
                .isAnonymous(request.getIsAnonymous() != null && request.getIsAnonymous())
                .build();

        Diary saved = diaryRepository.save(newDiary);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Neo4j 그래프 데이터베이스에 일기 저장 (감정 관계 그래프 생성)
        // ✨ ChatService에서 이미 PII 마스킹 처리됨
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        try {
            // ✨ Fire-and-Forget 비동기 호출: 그래프 저장이 끝날 때까지 사용자 기다리지 않음
            String maskedContent = piiMaskingService.maskContent(currentDiaryText);
            graphService.saveDiaryToGraphAsync(request.getUserId(), maskedContent);
            System.out.println("🚀 Neo4j 그래프 저장 비동기 시작 (User ID: " + request.getUserId() + ", Diary ID: " + saved.getId() + ")");
        } catch (Exception e) {
            System.err.println("❌ Neo4j 저장 실패 (일기 작성은 정상 완료): " + e.getMessage());
            e.printStackTrace();
        }

        return convertToDto(saved);
    }

    @Transactional
    public void deleteDiary(Long diaryId) {
        diaryRepository.deleteById(diaryId);
    }

    @Transactional
    public DiaryDto toggleShareStatus(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기가 존재하지 않습니다."));

        boolean newStatus = !diary.isPublic();

        // 엔티티 업데이트
        diary.update(diary.getTitle(), diary.getContent(), diary.getEmoji(), diary.getMood(), diary.getTension(),
                diary.getFun(), diary.getTags(), diary.getAiResponse(), diary.getImageUrl(), newStatus, diary.isAnonymous());

        // [중요] DB 저장 필수
        diaryRepository.save(diary);

        return convertToDto(diary);
    }

    @Transactional(readOnly = true)
    public List<DiaryDto> getPublicFeed() {
        List<Diary> diaries = diaryRepository.findByIsPublicTrueOrderByCreatedAtDesc();

        // N+1 문제 해결: 모든 diary의 좋아요/댓글 개수를 한 번에 조회
        return convertToDtoWithCounts(diaries);
    }

    // N+1 문제 해결: 일괄 조회 후 매핑
    private List<DiaryDto> convertToDtoWithCounts(List<Diary> diaries) {
        if (diaries.isEmpty()) {
            return List.of();
        }

        List<Long> diaryIds = diaries.stream().map(Diary::getId).collect(Collectors.toList());

        // 좋아요 개수 일괄 조회
        Map<Long, Long> likeCountMap = likesRepository.countByDiaryIds(diaryIds).stream()
                .collect(Collectors.toMap(
                    m -> ((Number) m.get("diaryId")).longValue(),
                    m -> ((Number) m.get("likeCount")).longValue()
                ));

        // 댓글 개수 일괄 조회
        Map<Long, Long> commentCountMap = commentRepository.countByDiaryIds(diaryIds).stream()
                .collect(Collectors.toMap(
                    m -> ((Number) m.get("diaryId")).longValue(),
                    m -> ((Number) m.get("commentCount")).longValue()
                ));

        // DTO 변환 시 미리 조회한 Map에서 개수를 가져옴
        return diaries.stream()
                .map(diary -> convertToDtoWithPreloadedCounts(diary, likeCountMap, commentCountMap))
                .collect(Collectors.toList());
    }

    private DiaryDto convertToDtoWithPreloadedCounts(Diary diary, Map<Long, Long> likeCountMap, Map<Long, Long> commentCountMap) {
        String authorNickname = "익명";
        if (!diary.isAnonymous()) {
            authorNickname = memberRepository.findById(diary.getUserId())
                    .map(Member::getNickname)
                    .orElse("익명");
        }

        int likeCount = likeCountMap.getOrDefault(diary.getId(), 0L).intValue();
        int commentCount = commentCountMap.getOrDefault(diary.getId(), 0L).intValue();

        return DiaryDto.builder()
                .id(diary.getId())
                .userId(diary.getUserId())
                .date(diary.getDate())
                .createdAt(diary.getCreatedAt())
                .title(diary.getTitle())
                .content(diary.getContent())
                .emoji(diary.getEmoji())
                .mood(diary.getMood())
                .tension(diary.getTension())
                .fun(diary.getFun())
                .tags(diary.getTags())
                .aiResponse(diary.getAiResponse())
                .imageUrl(diary.getImageUrl())
                .shared(diary.isPublic())
                .anonymous(diary.isAnonymous())
                .nickname(authorNickname)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .build();
    }

    @Transactional(readOnly = true)
    public DiaryDto getDiaryDetail(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기가 존재하지 않습니다."));
        return convertToDtoWithDetails(diary);
    }

    @Transactional
    public CommentDto addComment(Long diaryId, String content, String author) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기가 존재하지 않습니다."));

        Comment comment = Comment.builder()
                .content(content)
                .author(author)
                .diary(diary)
                .build();

        Comment saved = commentRepository.save(comment);

        return CommentDto.builder()
                .id(saved.getId())
                .content(saved.getContent())
                .author(saved.getAuthor())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public boolean toggleLike(Long diaryId, String userIp) {
        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기가 존재하지 않습니다."));

        var existingLike = likesRepository.findByUserIpAndDiaryId(userIp, diaryId);

        if (existingLike.isPresent()) {
            likesRepository.deleteByUserIpAndDiaryId(userIp, diaryId);
            return false; // unliked
        } else {
            Likes like = Likes.builder()
                    .userIp(userIp)
                    .diary(diary)
                    .build();
            likesRepository.save(like);
            return true; // liked
        }
    }

    private DiaryDto convertToDto(Diary diary) {
        String authorNickname = "익명";
        if (!diary.isAnonymous()) {
            authorNickname = memberRepository.findById(diary.getUserId())
                    .map(Member::getNickname)
                    .orElse("익명");
        }

        // 좋아요 개수와 댓글 개수 조회
        int likeCount = likesRepository.countByDiaryId(diary.getId());
        int commentCount = commentRepository.countByDiaryId(diary.getId());

        return DiaryDto.builder()
                .id(diary.getId())
                .userId(diary.getUserId())
                .date(diary.getDate())
                .createdAt(diary.getCreatedAt())
                .title(diary.getTitle())
                .content(diary.getContent())
                .emoji(diary.getEmoji())
                .mood(diary.getMood())
                .tension(diary.getTension())
                .fun(diary.getFun())
                .tags(diary.getTags())
                .aiResponse(diary.getAiResponse())
                .imageUrl(diary.getImageUrl())
                .shared(diary.isPublic())
                .anonymous(diary.isAnonymous())
                .nickname(authorNickname)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .build();
    }

    private DiaryDto convertToDtoWithDetails(Diary diary) {
        DiaryDto dto = convertToDto(diary);

        // 댓글 목록 추가
        List<CommentDto> comments = commentRepository.findByDiaryIdOrderByCreatedAtDesc(diary.getId())
                .stream()
                .map(c -> CommentDto.builder()
                .id(c.getId())
                .content(c.getContent())
                .author(c.getAuthor())
                .createdAt(c.getCreatedAt())
                .build())
                .collect(Collectors.toList());

        dto.setComments(comments);

        return dto;
    }
}
