package com.codestory.diary.repository;

import com.codestory.diary.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional; // 이거 필수!

public interface DiaryRepository extends JpaRepository<Diary, Long> {

    // [수정] Service에서 Optional로 받고 있으므로 반환 타입을 Optional<Diary>로 변경해야 함
    Optional<Diary> findByUserIdAndDate(Long userId, java.time.LocalDate date);

    // [추가] ApiController에서 찾고 있는 메서드 (누락되어서 에러 발생함)
    List<Diary> findAllByUserIdOrderByDateDesc(Long userId);

    // [유지] 인스타그램 피드용 (공개된 일기만 최신순)
    List<Diary> findByIsPublicTrueOrderByCreatedAtDesc();

    // 특정 날짜에 작성한 일기 수 (코인 보상 중복 방지용)
    int countByUserIdAndDate(Long userId, java.time.LocalDate date);

    // 사용자의 가장 최근 일기 1건 조회 (일기 기반 대화 시스템용)
    Optional<Diary> findTopByUserIdOrderByDateDesc(Long userId);
}