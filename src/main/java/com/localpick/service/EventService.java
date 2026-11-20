package com.localpick.service;

import com.localpick.domain.*;
import com.localpick.dto.EventDto.*;
import com.localpick.global.ApiException;
import com.localpick.repository.CouponRepository;
import com.localpick.repository.EventRepository;
import com.localpick.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final CouponRepository couponRepository;
    private final MemberRepository memberRepository;

    /** 이벤트 게시글 작성 시 PostService에서 호출 */
    @Transactional
    public Event create(Store store, EventRequest req) {
        if (req.endDate().isBefore(req.startDate())) {
            throw ApiException.badRequest("종료일은 시작일 이후여야 합니다.");
        }
        return eventRepository.save(new Event(store, req.title(), req.benefit(),
                req.startDate(), req.endDate(), req.couponQty()));
    }

    public List<EventResponse> ongoing(Long viewerId) {
        return eventRepository.findOngoing(LocalDate.now()).stream()
                .map(e -> toResponse(e, viewerId)).toList();
    }

    public List<EventResponse> byStore(Long storeId, Long viewerId) {
        return eventRepository.findByStoreIdOrderByIdDesc(storeId).stream()
                .map(e -> toResponse(e, viewerId)).toList();
    }

    @Transactional
    public CouponResponse download(Long memberId, Long eventId) {
        // 비관적 락: 같은 이벤트에 대한 발급 요청은 한 번에 하나씩 처리된다.
        Event event = eventRepository.findByIdForUpdate(eventId).orElseThrow(() -> ApiException.notFound("이벤트"));
        if (!event.isOngoing(LocalDate.now())) {
            throw ApiException.badRequest("진행 중인 이벤트가 아닙니다.");
        }
        if (couponRepository.existsByEventIdAndMemberId(eventId, memberId)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 받은 쿠폰입니다.");
        }
        if (couponRepository.countByEventId(eventId) >= event.getCouponQty()) {
            throw ApiException.badRequest("쿠폰이 모두 소진되었습니다.");
        }
        Member member = memberRepository.getReferenceById(memberId);
        try {
            // (event_id, member_id) 유니크 제약이 중복 발급을 DB 차원에서 한 번 더 막는다.
            return toCoupon(couponRepository.saveAndFlush(new Coupon(event, member)));
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 받은 쿠폰입니다.");
        }
    }

    @Transactional
    public List<CouponResponse> myCoupons(Long memberId) {
        LocalDate today = LocalDate.now();
        return couponRepository.findByMemberIdOrderByIdDesc(memberId).stream()
                .peek(c -> c.expireIfNeeded(today))
                .map(this::toCoupon).toList();
    }

    @Transactional
    public CouponResponse use(Long memberId, Long couponId) {
        Coupon coupon = couponRepository.findById(couponId).orElseThrow(() -> ApiException.notFound("쿠폰"));
        if (!coupon.getMember().getId().equals(memberId)) {
            throw ApiException.forbidden();
        }
        coupon.expireIfNeeded(LocalDate.now());
        if (coupon.getStatus() != CouponStatus.UNUSED) {
            throw ApiException.badRequest("사용할 수 없는 쿠폰입니다.");
        }
        coupon.use();
        return toCoupon(coupon);
    }

    private EventResponse toResponse(Event e, Long viewerId) {
        long issued = couponRepository.countByEventId(e.getId());
        boolean downloaded = viewerId != null && couponRepository.existsByEventIdAndMemberId(e.getId(), viewerId);
        return new EventResponse(e.getId(), e.getStore().getId(), e.getStore().getName(), e.getTitle(),
                e.getBenefit(), e.getStartDate(), e.getEndDate(), e.getCouponQty(),
                issued, Math.max(0, e.getCouponQty() - issued), downloaded);
    }

    private CouponResponse toCoupon(Coupon c) {
        Event e = c.getEvent();
        return new CouponResponse(c.getId(), e.getId(), e.getTitle(), e.getStore().getName(), e.getBenefit(),
                e.getEndDate(), c.getStatus(), c.getIssuedAt(), c.getUsedAt());
    }
}
