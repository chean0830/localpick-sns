package com.localpick.repository;

import com.localpick.domain.Coupon;
import com.localpick.domain.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    long countByEventId(Long eventId);

    boolean existsByEventIdAndMemberId(Long eventId, Long memberId);

    List<Coupon> findByMemberIdOrderByIdDesc(Long memberId);

    long countByEventStoreId(Long storeId);

    long countByEventStoreIdAndStatus(Long storeId, CouponStatus status);
}
