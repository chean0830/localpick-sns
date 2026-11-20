package com.localpick.global;

import com.localpick.domain.*;
import com.localpick.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;

/**
 * local 프로필에서 시연용 샘플 데이터를 넣는다.
 * 관리자 admin@localpick.kr / admin1234
 * 사장님 owner@localpick.kr / owner1234
 * 일반회원 user@localpick.kr / user1234
 */
@Component
@Profile("local")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final PostRepository postRepository;
    private final HashtagRepository hashtagRepository;
    private final FollowRepository followRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (memberRepository.count() > 0) {
            return;
        }
        memberRepository.save(new Member("admin@localpick.kr", encoder.encode("admin1234"), "관리자", Role.ADMIN));
        Member owner = memberRepository.save(new Member("owner@localpick.kr", encoder.encode("owner1234"), "달빛빵집 사장님", Role.OWNER));
        Member owner2 = memberRepository.save(new Member("owner2@localpick.kr", encoder.encode("owner1234"), "골목커피 사장님", Role.OWNER));
        Member user = memberRepository.save(new Member("user@localpick.kr", encoder.encode("user1234"), "망원동주민", Role.USER));

        Store bakery = approved(new Store(owner, "달빛빵집", "베이커리", "서울 마포구 망원로 12", "망원동",
                "08:00~21:00", "매일 아침 직접 굽는 동네 빵집입니다. 소금빵이 대표 메뉴예요."));
        Store cafe = approved(new Store(owner2, "골목커피", "카페", "서울 마포구 포은로 34", "망원동",
                "10:00~22:00", "골목 안쪽 조용한 로스터리 카페"));
        storeRepository.save(new Store(owner2, "연남분식", "분식", "서울 마포구 동교로 56", "연남동",
                "11:00~20:00", "승인 대기 중인 샘플 가게"));

        Hashtag newMenu = tag("신메뉴");
        Hashtag mangwon = tag("망원동");
        Hashtag open = tag("오픈이벤트");
        Hashtag coffee = tag("핸드드립");

        Post p1 = post(owner, bakery, PostType.PROMO, "이번 주 신메뉴 쑥 소금빵이 나왔어요! 하루 50개 한정입니다 🥐",
                "/img/sample-bread.svg", Set.of(newMenu, mangwon));
        Post p2 = post(owner, bakery, PostType.EVENT, "오픈 2주년 기념! 쿠폰 받고 전 메뉴 20% 할인 받아 가세요.",
                "/img/sample-event.svg", Set.of(open, mangwon));
        post(owner2, cafe, PostType.PROMO, "에티오피아 원두 새로 들어왔습니다. 산미 좋아하시는 분들 추천해요.",
                "/img/sample-coffee.svg", Set.of(coffee, newMenu));
        post(user, null, PostType.NORMAL, "망원동 이사 왔어요. 동네 맛집 추천 부탁드립니다!", null, Set.of(mangwon));

        LocalDate today = LocalDate.now();
        eventRepository.save(new Event(bakery, "오픈 2주년 20% 할인", "전 메뉴 20% 할인", today.minusDays(1), today.plusDays(13), 100));
        eventRepository.save(new Event(cafe, "음료 1+1", "아메리카노 1+1", today, today.plusDays(6), 30));

        followRepository.save(new Follow(user, bakery));
        postLikeRepository.save(new PostLike(p1, user));
        commentRepository.save(new Comment(p1, user, "내일 아침에 사러 갈게요!"));
        commentRepository.save(new Comment(p2, user, "쿠폰 받았습니다 :)"));
    }

    private Store approved(Store store) {
        store.changeStatus(StoreStatus.OK);
        return storeRepository.save(store);
    }

    private Hashtag tag(String name) {
        return hashtagRepository.save(new Hashtag(name));
    }

    private Post post(Member m, Store s, PostType type, String content, String image, Set<Hashtag> tags) {
        Post post = new Post(m, s, type, content);
        if (image != null) {
            post.addImage(image);
        }
        post.replaceTags(tags);
        return postRepository.save(post);
    }
}
