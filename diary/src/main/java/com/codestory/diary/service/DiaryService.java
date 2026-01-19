package com.codestory.diary.service;

import com.codestory.diary.dto.DiaryDto;
import com.codestory.diary.dto.DiaryRequestDto;
import com.codestory.diary.entity.Diary;
import com.codestory.diary.entity.Member;
import com.codestory.diary.repository.DiaryRepository;
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
        diary.update(diary.getContent(), diary.getEmoji(), diary.getMood(), diary.getTension(),
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

    private DiaryDto convertToDto(Diary diary) {
        // Get author nickname
        String authorNickname = "익명"; // Default to anonymous
        if (!diary.isAnonymous()) {
            // Only fetch nickname if not anonymous
            authorNickname = memberRepository.findById(diary.getUserId())
                    .map(Member::getNickname)
                    .orElse("익명");
        }

        return DiaryDto.builder()
                .id(diary.getId())
                .userId(diary.getUserId())
                .date(diary.getDate())
                .content(diary.getContent())
                .emoji(diary.getEmoji())
                .mood(diary.getMood())
                .tension(diary.getTension())
                .fun(diary.getFun())
                .tags(diary.getTags())
                .aiResponse(diary.getAiResponse())
                .imageUrl(diary.getImageUrl())
                // [핵심] 엔티티의 isPublic 값을 DTO의 shared에 담습니다.
                .shared(diary.isPublic())
                .anonymous(diary.isAnonymous())
                .nickname(authorNickname)
                .build();
    }
}