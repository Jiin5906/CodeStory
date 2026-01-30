package com.codestory.diary.repository;

import com.codestory.diary.entity.Likes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface LikesRepository extends JpaRepository<Likes, Long> {
    int countByDiaryId(Long diaryId);
    Optional<Likes> findByUserIpAndDiaryId(String userIp, Long diaryId);
    void deleteByUserIpAndDiaryId(String userIp, Long diaryId);

    // N+1 문제 해결: 여러 diaryId에 대한 좋아요 개수를 한 번에 조회
    @Query("SELECT l.diary.id AS diaryId, COUNT(l) AS likeCount " +
           "FROM Likes l WHERE l.diary.id IN :diaryIds " +
           "GROUP BY l.diary.id")
    List<Map<String, Object>> countByDiaryIds(@Param("diaryIds") List<Long> diaryIds);
}
