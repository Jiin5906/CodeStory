package com.codestory.diary.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "diary")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Diary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDate date;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String aiResponse;

    @Builder.Default
    @Column(nullable = false)
    private boolean isPublic = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean isAnonymous = false;

    @ElementCollection
    @CollectionTable(name = "diary_tags", joinColumns = @JoinColumn(name = "diary_id"))
    @Column(name = "tag")
    private List<String> tags;

    private int tension;
    private int mood;
    private int fun;
    private String emoji;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // [중요] 여기에 boolean isPublic, isAnonymous 파라미터가 있어야 하고, 내부에서 this.isPublic, this.isAnonymous에 대입해야 합니다!
    public void update(String title, String content, String emoji, int mood, int tension, int fun,
            List<String> tags, String aiResponse, String imageUrl, boolean isPublic, boolean isAnonymous) {
        this.title = title;
        this.content = content;
        this.emoji = emoji;
        this.mood = mood;
        this.tension = tension;
        this.fun = fun;
        this.tags = tags;
        this.aiResponse = aiResponse;

        // ★★★ 범인은 여기였습니다! 이 줄이 없으면 DB 값이 절대 안 바뀝니다. ★★★
        this.isPublic = isPublic;
        this.isAnonymous = isAnonymous;

        if (imageUrl != null) {
            this.imageUrl = imageUrl;
        }
    }
}
