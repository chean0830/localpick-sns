package com.localpick.repository;

import com.localpick.domain.Post;
import com.localpick.domain.PostStatus;
import com.localpick.domain.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByStatusOrderByIdDesc(PostStatus status, Pageable pageable);

    Page<Post> findByStatusAndTypeOrderByIdDesc(PostStatus status, PostType type, Pageable pageable);

    /** 팔로우한 가게의 게시글 */
    @Query(value = "select p from Post p where p.status = :status and p.store.id in " +
            "(select f.store.id from Follow f where f.member.id = :memberId) order by p.id desc",
            countQuery = "select count(p) from Post p where p.status = :status and p.store.id in " +
                    "(select f.store.id from Follow f where f.member.id = :memberId)")
    Page<Post> findFollowingFeed(@Param("status") PostStatus status,
                                 @Param("memberId") Long memberId, Pageable pageable);

    /** 우리동네(가게 지역) 게시글 */
    @Query(value = "select p from Post p join p.store s where p.status = :status and s.region = :region order by p.id desc",
            countQuery = "select count(p) from Post p join p.store s where p.status = :status and s.region = :region")
    Page<Post> findRegionFeed(@Param("status") PostStatus status,
                              @Param("region") String region, Pageable pageable);

    List<Post> findByStoreIdAndStatusOrderByIdDesc(Long storeId, PostStatus status);

    List<Post> findByMemberIdOrderByIdDesc(Long memberId);

    @Query("select distinct p from Post p left join p.tags t where p.status = :status and " +
            "(p.content like concat('%', :q, '%') or t.name = :q) order by p.id desc")
    List<Post> search(@Param("status") PostStatus status, @Param("q") String q);

    @Query("select p from Post p join p.tags t where p.status = :status and t.name = :tag order by p.id desc")
    List<Post> findByTag(@Param("status") PostStatus status, @Param("tag") String tag);

    long countByStoreId(Long storeId);

    List<Post> findTop3ByStoreIdAndStatusOrderByViewCountDesc(Long storeId, PostStatus status);

    @Query("select coalesce(sum(p.viewCount), 0) from Post p where p.store.id = :storeId")
    long sumViewCountByStoreId(@Param("storeId") Long storeId);

    @Query("select t.name from Post p join p.tags t where p.status = :status group by t.name order by count(p) desc")
    List<String> findPopularTagNames(@Param("status") PostStatus status, Pageable pageable);
}
