package com.codestory.diary.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
                if (!uploadDir.exists()) uploadDir.mkdirs();
                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.write(path, imageFile.getBytes());
                savedImageUrl = "/images/" + fileName;
            } catch (IOException e) { e.printStackTrace(); }
        }

        String systemPrompt = """
            # Role
            당신은 사용자의 하루를 경청하고 깊이 공감해주는 따뜻한 감성을 가진 'Cozy Diary'의 AI 친구입니다.
            # Tone & Manner
            - 말투: 부드럽고 다정한 '해요체'를 사용하세요.
            - 길이: 3~4문장 내외로 간결하지만 진심이 느껴지게 작성하세요.
            """;

        String userMessage = String.format(
            "오늘의 일기:\n- 내용: %s\n- 기분: %d점\n- 태그: %s",
            request.getContent(), request.getMood(), request.getTags()
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

        return DiaryDto.builder()
                .id(diary.getId())
                .userId(diary.getUserId())
                .date(diary.getDate())
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

        // 좋아요 개수 추가
        int likeCount = likesRepository.countByDiaryId(diary.getId());

        dto.setComments(comments);
        dto.setLikeCount(likeCount);

        return dto;
    }
}