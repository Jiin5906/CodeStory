package com.codestory.diary.repository;

import com.codestory.diary.entity.Likes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LikesRepository extends JpaRepository<Likes, Long> {
    int countByDiaryId(Long diaryId);
    Optional<Likes> findByUserIpAndDiaryId(String userIp, Long diaryId);
    void deleteByUserIpAndDiaryId(String userIp, Long diaryId);
}
