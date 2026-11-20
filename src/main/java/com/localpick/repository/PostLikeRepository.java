package com.localpick.repository;

import com.localpick.domain.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostIdAndMemberId(Long postId, Long memberId);

    boolean existsByPostIdAndMemberId(Long postId, Long memberId);

    long countByPostId(Long postId);

    @Query("select count(l) from PostLike l where l.post.store.id = :storeId")
    long countByStoreId(@Param("storeId") Long storeId);

    void deleteByPostId(Long postId);
}
