package com.localpick.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "post")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false, length = 10)
    private PostType type;

    @Column(nullable = false, length = 3000)
    private String content;

    @Column(name = "view_count", nullable = false)
    private int viewCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PostStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<PostImage> images = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "post_tag",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Hashtag> tags = new LinkedHashSet<>();

    public Post(Member member, Store store, PostType type, String content) {
        this.member = member;
        this.store = store;
        this.type = type;
        this.content = content;
        this.status = PostStatus.OPEN;
    }

    public void addImage(String imageUrl) {
        images.add(new PostImage(this, imageUrl, images.size() + 1));
    }

    public void updateContent(String content) {
        this.content = content;
    }

    public void replaceTags(Set<Hashtag> newTags) {
        tags.clear();
        tags.addAll(newTags);
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public void changeStatus(PostStatus status) {
        this.status = status;
    }

    public boolean isWrittenBy(Long memberId) {
        return member.getId().equals(memberId);
    }
}
