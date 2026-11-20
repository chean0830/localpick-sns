package com.localpick.repository;

import com.localpick.domain.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByMemberIdAndStoreId(Long memberId, Long storeId);

    boolean existsByMemberIdAndStoreId(Long memberId, Long storeId);

    long countByStoreId(Long storeId);

    List<Follow> findByMemberIdOrderByIdDesc(Long memberId);
}
