package com.localpick.service;

import com.localpick.domain.Comment;
import com.localpick.domain.Member;
import com.localpick.domain.Post;
import com.localpick.dto.PostDto.CommentRequest;
import com.localpick.dto.PostDto.CommentResponse;
import com.localpick.global.ApiException;
import com.localpick.repository.CommentRepository;
import com.localpick.repository.MemberRepository;
import com.localpick.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;

    public List<CommentResponse> list(Long postId, Long viewerId) {
        return commentRepository.findByPostIdOrderByIdAsc(postId).stream()
                .map(c -> toResponse(c, viewerId)).toList();
    }

    @Transactional
    public CommentResponse create(Long memberId, Long postId, CommentRequest req) {
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("게시글"));
        Member member = memberRepository.findById(memberId).orElseThrow(() -> ApiException.notFound("회원"));
        Comment comment = commentRepository.save(new Comment(post, member, req.content()));
        return toResponse(comment, memberId);
    }

    @Transactional
    public void delete(Long memberId, Long commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> ApiException.notFound("댓글"));
        if (!comment.getMember().getId().equals(memberId)) {
            throw ApiException.forbidden();
        }
        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment c, Long viewerId) {
        return new CommentResponse(c.getId(), c.getContent(), c.getCreatedAt(),
                c.getMember().getId(), c.getMember().getNickname(),
                viewerId != null && c.getMember().getId().equals(viewerId));
    }
}
