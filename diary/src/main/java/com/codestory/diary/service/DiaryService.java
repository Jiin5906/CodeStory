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

        // RAG: 벡터 유사도 기반 과거 기억 검색
        String userId = String.valueOf(request.getUserId());
        String currentDiaryText = request.getContent();
        List<String> relatedMemories = memoryService.findRelatedMemories(userId, currentDiaryText);

        // 과거 기억 컨텍스트 생성
        StringBuilder memoryContext = new StringBuilder();
        if (!relatedMemories.isEmpty()) {
            memoryContext.append("\n\n## 당신이 기억하는 과거의 비슷한 순간들:\n");
            for (int i = 0; i < relatedMemories.size(); i++) {
                String memory = relatedMemories.get(i);
                memoryContext.append(String.format("%d. %s\n",
                        i + 1,
                        memory.length() > 80 ? memory.substring(0, 80) + "..." : memory
                ));
            }
            memoryContext.append("\n위 기억들을 바탕으로, 사용자가 과거에 비슷한 경험을 했다는 것을 자연스럽게 언급하며 공감해주세요.\n");
            memoryContext.append("(예: \"저번에도 이런 일 있었죠?\", \"그때도 힘들어하셨는데...\", \"예전에도 이야기했던 것처럼...\")\n");
        }

        String systemPrompt = """
            # Role
            당신은 사용자의 감정을 공감하는 따뜻한 AI 친구 '몽글이'입니다.
            사용자의 과거 일기와 경험을 기억하고 있으며, 그것을 자연스럽게 언급하며 공감합니다.

            # 핵심 제약 조건 (절대 준수)
            - **답변 길이: 반드시 최대 2줄 이내로 작성**
            - 구구절절한 설명 금지, 핵심적인 위로와 공감만 전달
            - 말투: 부드럽고 다정한 '해요체'
            - 한 문장은 짧고 간결하게 (20자 이내 권장)
            - 과거 기억이 있다면 자연스럽게 언급하며 "오래 알아온 친구처럼" 말하기

            # 예시
            - 좋은 예 (기억 없음): "오늘 많이 힘드셨네요. 충분히 쉬어가세요."
            - 좋은 예 (기억 있음): "저번에도 이런 일 있었죠? 이번에도 잘 이겨낼 거예요."
            - 나쁜 예: "오늘 정말 많이 힘드셨을 것 같아요. 그런 날도 있는 거니까 너무 자책하지 마시고 충분히 쉬면서 마음을 추스르는 시간을 가져보세요."
            """;

        String userMessage = String.format(
                "오늘의 일기:\n- 내용: %s\n- 기분: %d점\n- 태그: %s%s",
                request.getContent(),
                request.getMood(),
                request.getTags(),
                memoryContext.toString()
        );

        String aiReply = aiService.getMultimodalResponse(systemPrompt, userMessage, imageFile);

        // RAG: 현재 일기를 벡터 DB에 저장 (장기 기억 형성)
        try {
            memoryService.saveMemory(userId, currentDiaryText);
        } catch (Exception e) {
            System.err.println("Failed to save memory to Pinecone: " + e.getMessage());
            // 메모리 저장 실패해도 일기 작성은 계속 진행
        }

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

        // Neo4j 그래프 데이터베이스에 일기 저장 (감정 관계 그래프 생성)
        try {
            graphService.saveDiaryToGraph(request.getContent());
            System.out.println("✅ Neo4j에 일기 저장 완료: " + saved.getId());
        } catch (Exception e) {
            System.err.println("❌ Neo4j 저장 실패 (일기 작성은 정상 완료): " + e.getMessage());
            e.printStackTrace();
            // Neo4j 저장 실패해도 일기 작성은 계속 진행
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
