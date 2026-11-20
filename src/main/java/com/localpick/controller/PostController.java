package com.localpick.controller;

import com.localpick.dto.PostDto.*;
import com.localpick.global.LoginSession;
import com.localpick.service.CommentService;
import com.localpick.service.PostService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final CommentService commentService;

    /** 메인 피드: tab = all | follow | local | event */
    @GetMapping("/posts")
    public PageResponse<PostResponse> feed(@RequestParam(defaultValue = "all") String tab,
                                           @RequestParam(required = false) String region,
                                           @RequestParam(defaultValue = "0") int page,
                                           HttpSession session) {
        return postService.feed(tab, region, page, LoginSession.optional(session));
    }

    @GetMapping("/posts/mine")
    public List<PostResponse> mine(HttpSession session) {
        return postService.byMember(LoginSession.require(session));
    }

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> create(@Valid @RequestBody PostRequest req, HttpSession session) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(LoginSession.require(session), req));
    }

    @GetMapping("/posts/{postId}")
    public PostResponse detail(@PathVariable Long postId, HttpSession session) {
        return postService.detail(postId, LoginSession.optional(session));
    }

    @PutMapping("/posts/{postId}")
    public PostResponse update(@PathVariable Long postId, @Valid @RequestBody PostUpdateRequest req, HttpSession session) {
        return postService.update(LoginSession.require(session), postId, req);
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> delete(@PathVariable Long postId, HttpSession session) {
        postService.delete(LoginSession.require(session), postId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/like")
    public LikeResponse like(@PathVariable Long postId, HttpSession session) {
        return postService.toggleLike(LoginSession.require(session), postId);
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> comments(@PathVariable Long postId, HttpSession session) {
        return commentService.list(postId, LoginSession.optional(session));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long postId,
                                                      @Valid @RequestBody CommentRequest req, HttpSession session) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.create(LoginSession.require(session), postId, req));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, HttpSession session) {
        commentService.delete(LoginSession.require(session), commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tags/popular")
    public List<String> popularTags() {
        return postService.popularTags();
    }
}
