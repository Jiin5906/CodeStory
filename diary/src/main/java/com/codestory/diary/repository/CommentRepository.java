package com.codestory.diary.repository;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.codestory.diary.entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByDiaryIdOrderByCreatedAtDesc(Long diaryId);
    int countByDiaryId(Long diaryId);

    // N+1 문제 해결: 여러 diaryId에 대한 댓글 개수를 한 번에 조회
    @Query("SELECT c.diary.id AS diaryId, COUNT(c) AS commentCount " +
           "FROM Comment c WHERE c.diary.id IN :diaryIds " +
           "GROUP BY c.diary.id")
    List<Map<String, Object>> countByDiaryIds(@Param("diaryIds") List<Long> diaryIds);
}
