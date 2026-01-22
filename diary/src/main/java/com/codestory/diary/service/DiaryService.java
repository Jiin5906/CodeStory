package com.codestory.diary.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
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

        // 과거 일기 최근 5개 조회
        List<Diary> recentDiaries = diaryRepository.findAllByUserIdOrderByDateDesc(request.getUserId())
                .stream()
                .limit(5)
                .collect(Collectors.toList());

        // 과거 일기 컨텍스트 생성
        StringBuilder contextBuilder = new StringBuilder();
        if (!recentDiaries.isEmpty()) {
            contextBuilder.append("\n\n## 사용자의 최근 일기 기록 (참고용):\n");
            for (int i = 0; i < recentDiaries.size(); i++) {
                Diary d = recentDiaries.get(i);
                contextBuilder.append(String.format("%d. [%s] %s\n",
                        i + 1,
                        d.getDate(),
                        d.getContent().length() > 50 ? d.getContent().substring(0, 50) + "..." : d.getContent()
                ));
            }
            contextBuilder.append("\n위 기록을 참고하여 사용자의 성향과 과거 맥락을 반영한 개인화된 답변을 제공하세요.\n");
        }

        String systemPrompt = """
            # Role
            당신은 사용자의 감정을 공감하는 따뜻한 AI 친구 '몽글이'입니다.

            # 핵심 제약 조건 (절대 준수)
            - **답변 길이: 반드시 최대 2줄 이내로 작성**
            - 구구절절한 설명 금지, 핵심적인 위로와 공감만 전달
            - 말투: 부드럽고 다정한 '해요체'
            - 한 문장은 짧고 간결하게 (20자 이내 권장)

            # 예시
            - 좋은 예: "오늘 많이 힘드셨네요. 충분히 쉬어가세요."
            - 나쁜 예: "오늘 정말 많이 힘드셨을 것 같아요. 그런 날도 있는 거니까 너무 자책하지 마시고 충분히 쉬면서 마음을 추스르는 시간을 가져보세요."
            """;

        String userMessage = String.format(
                "오늘의 일기:\n- 내용: %s\n- 기분: %d점\n- 태그: %s%s",
                request.getContent(),
                request.getMood(),
                request.getTags(),
                contextBuilder.toString()
        );

        String aiReply = aiService.getMultimodalResponse(systemPrompt, userMessage, imageFile);

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
        return diaryRepository.findByIsPublicTrueOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
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
