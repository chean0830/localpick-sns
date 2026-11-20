package com.localpick.service;

import com.localpick.domain.*;
import com.localpick.dto.StoreDto.*;
import com.localpick.global.ApiException;
import com.localpick.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreService {

    private final StoreRepository storeRepository;
    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final EventRepository eventRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public StoreSummary create(Long ownerId, StoreRequest req) {
        Member owner = memberRepository.findById(ownerId).orElseThrow(() -> ApiException.notFound("회원"));
        if (!owner.isOwner()) {
            throw ApiException.badRequest("사장님 회원만 가게를 등록할 수 있습니다.");
        }
        Store store = new Store(owner, req.name(), req.category(), req.address(),
                req.region(), req.openHours(), req.intro());
        return StoreSummary.from(storeRepository.save(store));
    }

    @Transactional
    public StoreSummary update(Long ownerId, Long storeId, StoreRequest req) {
        Store store = getMyStore(ownerId, storeId);
        store.update(req.name(), req.category(), req.address(), req.region(), req.openHours(), req.intro());
        return StoreSummary.from(store);
    }

    public List<StoreSummary> search(String q) {
        return storeRepository.search(StoreStatus.OK, q == null ? "" : q.trim())
                .stream().map(StoreSummary::from).toList();
    }

    public List<StoreSummary> myStores(Long ownerId) {
        return storeRepository.findByOwnerIdOrderByIdDesc(ownerId)
                .stream().map(StoreSummary::from).toList();
    }

    public StoreDetail detail(Long storeId, Long viewerId) {
        Store store = getStore(storeId);
        boolean mine = viewerId != null && store.isOwnedBy(viewerId);
        if (!store.isApproved() && !mine) {
            throw ApiException.notFound("가게");
        }
        boolean following = viewerId != null && followRepository.existsByMemberIdAndStoreId(viewerId, storeId);
        return new StoreDetail(store.getId(), store.getName(), store.getCategory(), store.getAddress(),
                store.getRegion(), store.getOpenHours(), store.getIntro(), store.getStatus(),
                store.getOwner().getId(), store.getOwner().getNickname(),
                postRepository.countByStoreId(storeId), followRepository.countByStoreId(storeId),
                eventRepository.countByStoreId(storeId), following, mine);
    }

    @Transactional
    public FollowResponse toggleFollow(Long memberId, Long storeId) {
        Store store = getStore(storeId);
        if (!store.isApproved()) {
            throw ApiException.badRequest("승인된 가게만 팔로우할 수 있습니다.");
        }
        boolean following = followRepository.findByMemberIdAndStoreId(memberId, storeId)
                .map(f -> {
                    followRepository.delete(f);
                    return false;
                })
                .orElseGet(() -> {
                    Member member = memberRepository.getReferenceById(memberId);
                    followRepository.save(new Follow(member, store));
                    return true;
                });
        followRepository.flush();
        return new FollowResponse(following, followRepository.countByStoreId(storeId));
    }

    public List<StoreSummary> followingStores(Long memberId) {
        return followRepository.findByMemberIdOrderByIdDesc(memberId).stream()
                .map(f -> StoreSummary.from(f.getStore())).toList();
    }

    /** 사장님 홍보 통계 */
    public StoreStats stats(Long ownerId, Long storeId) {
        getMyStore(ownerId, storeId);
        long issued = couponRepository.countByEventStoreId(storeId);
        long used = couponRepository.countByEventStoreIdAndStatus(storeId, CouponStatus.USED);
        double rate = issued == 0 ? 0 : Math.round(used * 1000.0 / issued) / 10.0;
        List<TopPost> topPosts = postRepository
                .findTop3ByStoreIdAndStatusOrderByViewCountDesc(storeId, PostStatus.OPEN).stream()
                .map(p -> new TopPost(p.getId(), p.getContent(), p.getViewCount(),
                        postLikeRepository.countByPostId(p.getId())))
                .toList();
        return new StoreStats(postRepository.countByStoreId(storeId),
                postRepository.sumViewCountByStoreId(storeId),
                postLikeRepository.countByStoreId(storeId),
                followRepository.countByStoreId(storeId),
                issued, used, rate, topPosts);
    }

    /** 관리자: 승인 대기 가게 */
    public List<StoreSummary> pending() {
        return storeRepository.findByStatusOrderByIdAsc(StoreStatus.WAIT)
                .stream().map(StoreSummary::from).toList();
    }

    @Transactional
    public StoreSummary changeStatus(Long storeId, StoreStatus status) {
        Store store = getStore(storeId);
        store.changeStatus(status);
        return StoreSummary.from(store);
    }

    Store getStore(Long storeId) {
        return storeRepository.findById(storeId).orElseThrow(() -> ApiException.notFound("가게"));
    }

    Store getMyStore(Long ownerId, Long storeId) {
        Store store = getStore(storeId);
        if (!store.isOwnedBy(ownerId)) {
            throw ApiException.forbidden();
        }
        return store;
    }
}
