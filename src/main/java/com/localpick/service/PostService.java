package com.localpick.service;

import com.localpick.domain.*;
import com.localpick.dto.PostDto.*;
import com.localpick.global.ApiException;
import com.localpick.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private static final int PAGE_SIZE = 10;

    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final HashtagRepository hashtagRepository;
    private final EventService eventService;

    /** tab: all | follow | local | event */
    public PageResponse<PostResponse> feed(String tab, String region, int page, Long viewerId) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), PAGE_SIZE);
        Page<Post> result = switch (tab == null ? "all" : tab) {
            case "follow" -> {
                if (viewerId == null) {
                    yield Page.empty(pageable);
                }
                yield postRepository.findFollowingFeed(PostStatus.OPEN, viewerId, pageable);
            }
            case "local" -> postRepository.findRegionFeed(PostStatus.OPEN, region == null ? "" : region, pageable);
            case "event" -> postRepository.findByStatusAndTypeOrderByIdDesc(PostStatus.OPEN, PostType.EVENT, pageable);
            default -> postRepository.findByStatusOrderByIdDesc(PostStatus.OPEN, pageable);
        };
        List<PostResponse> items = result.getContent().stream().map(p -> toResponse(p, viewerId)).toList();
        return new PageResponse<>(items, result.getNumber(), result.hasNext());
    }

    @Transactional
    public PostResponse detail(Long postId, Long viewerId) {
        Post post = getPost(postId);
        if (post.getStatus() == PostStatus.BLIND && !post.isWrittenBy(viewerIdOrZero(viewerId))) {
            throw ApiException.notFound("게시글");
        }
        post.increaseViewCount();
        return toResponse(post, viewerId);
    }

    @Transactional
    public PostResponse create(Long memberId, PostRequest req) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> ApiException.notFound("회원"));
        Store store = null;
        if (req.type() != PostType.NORMAL) {
            if (!member.isOwner()) {
                throw ApiException.badRequest("홍보·이벤트 글은 사장님 회원만 작성할 수 있습니다.");
            }
            if (req.storeId() == null) {
                throw ApiException.badRequest("홍보할 가게를 선택해 주세요.");
            }
            store = storeRepository.findById(req.storeId()).orElseThrow(() -> ApiException.notFound("가게"));
            if (!store.isOwnedBy(memberId)) {
                throw ApiException.forbidden();
            }
            if (!store.isApproved()) {
                throw ApiException.badRequest("관리자 승인 후 홍보 글을 올릴 수 있습니다.");
            }
        }
        if (req.type() == PostType.EVENT && req.event() == null) {
            throw ApiException.badRequest("쿠폰 이벤트 정보를 입력해 주세요.");
        }

        Post post = new Post(member, store, req.type(), req.content());
        if (req.imageUrls() != null) {
            req.imageUrls().stream().limit(5).forEach(post::addImage);
        }
        post.replaceTags(resolveTags(req.tags()));
        postRepository.save(post);

        if (req.type() == PostType.EVENT) {
            eventService.create(store, req.event());
        }
        return toResponse(post, memberId);
    }

    @Transactional
    public PostResponse update(Long memberId, Long postId, PostUpdateRequest req) {
        Post post = getPost(postId);
        if (!post.isWrittenBy(memberId)) {
            throw ApiException.forbidden();
        }
        post.updateContent(req.content());
        post.replaceTags(resolveTags(req.tags()));
        return toResponse(post, memberId);
    }

    @Transactional
    public void delete(Long memberId, Long postId) {
        Post post = getPost(postId);
        Member member = memberRepository.findById(memberId).orElseThrow(() -> ApiException.notFound("회원"));
        if (!post.isWrittenBy(memberId) && !member.isAdmin()) {
            throw ApiException.forbidden();
        }
        postLikeRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    @Transactional
    public LikeResponse toggleLike(Long memberId, Long postId) {
        Post post = getPost(postId);
        boolean liked = postLikeRepository.findByPostIdAndMemberId(postId, memberId)
                .map(like -> {
                    postLikeRepository.delete(like);
                    return false;
                })
                .orElseGet(() -> {
                    postLikeRepository.save(new PostLike(post, memberRepository.getReferenceById(memberId)));
                    return true;
                });
        postLikeRepository.flush();
        return new LikeResponse(liked, postLikeRepository.countByPostId(postId));
    }

    public List<PostResponse> byStore(Long storeId, Long viewerId) {
        return postRepository.findByStoreIdAndStatusOrderByIdDesc(storeId, PostStatus.OPEN)
                .stream().map(p -> toResponse(p, viewerId)).toList();
    }

    public List<PostResponse> byMember(Long memberId) {
        return postRepository.findByMemberIdOrderByIdDesc(memberId)
                .stream().map(p -> toResponse(p, memberId)).toList();
    }

    public List<PostResponse> search(String q, Long viewerId) {
        String keyword = normalizeTag(q);
        if (keyword.isEmpty()) {
            return List.of();
        }
        return postRepository.search(PostStatus.OPEN, keyword).stream().map(p -> toResponse(p, viewerId)).toList();
    }

    public List<PostResponse> byTag(String tag, Long viewerId) {
        return postRepository.findByTag(PostStatus.OPEN, normalizeTag(tag))
                .stream().map(p -> toResponse(p, viewerId)).toList();
    }

    public List<String> popularTags() {
        return postRepository.findPopularTagNames(PostStatus.OPEN, PageRequest.of(0, 8));
    }

    /** 관리자용: 블라인드 포함 전체 최신 글 */
    public List<PostResponse> recentForAdmin() {
        return postRepository.findAll(PageRequest.of(0, 50, org.springframework.data.domain.Sort.by("id").descending()))
                .stream().map(p -> toResponse(p, null)).toList();
    }

    @Transactional
    public PostResponse changeStatus(Long postId, PostStatus status) {
        Post post = getPost(postId);
        post.changeStatus(status);
        return toResponse(post, null);
    }

    Post getPost(Long postId) {
        return postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("게시글"));
    }

    private Set<Hashtag> resolveTags(List<String> names) {
        Set<Hashtag> tags = new LinkedHashSet<>();
        if (names == null) {
            return tags;
        }
        names.stream().map(this::normalizeTag).filter(n -> !n.isEmpty()).distinct().limit(10)
                .forEach(n -> tags.add(hashtagRepository.findByName(n)
                        .orElseGet(() -> hashtagRepository.save(new Hashtag(n)))));
        return tags;
    }

    private String normalizeTag(String raw) {
        if (raw == null) {
            return "";
        }
        String t = raw.trim();
        while (t.startsWith("#")) {
            t = t.substring(1);
        }
        return t.length() > 50 ? t.substring(0, 50) : t;
    }

    private long viewerIdOrZero(Long viewerId) {
        return viewerId == null ? 0L : viewerId;
    }

    private PostResponse toResponse(Post p, Long viewerId) {
        Store s = p.getStore();
        boolean liked = viewerId != null && postLikeRepository.existsByPostIdAndMemberId(p.getId(), viewerId);
        return new PostResponse(p.getId(), p.getType(), p.getStatus(), p.getContent(), p.getViewCount(),
                p.getCreatedAt(),
                p.getMember().getId(), p.getMember().getNickname(),
                s == null ? null : s.getId(), s == null ? null : s.getName(),
                p.getImages().stream().map(PostImage::getImageUrl).toList(),
                p.getTags().stream().map(Hashtag::getName).toList(),
                postLikeRepository.countByPostId(p.getId()),
                commentRepository.countByPostId(p.getId()),
                liked, viewerId != null && p.isWrittenBy(viewerId));
    }
}
