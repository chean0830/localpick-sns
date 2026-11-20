package com.localpick.controller;

import com.localpick.domain.PostStatus;
import com.localpick.dto.PostDto.PostResponse;
import com.localpick.dto.StoreDto.StatusRequest;
import com.localpick.dto.StoreDto.StoreSummary;
import com.localpick.global.LoginSession;
import com.localpick.service.AuthService;
import com.localpick.service.PostService;
import com.localpick.service.StoreService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService authService;
    private final StoreService storeService;
    private final PostService postService;

    public record PostStatusRequest(PostStatus status) {
    }

    @GetMapping("/stores/pending")
    public List<StoreSummary> pendingStores(HttpSession session) {
        admin(session);
        return storeService.pending();
    }

    @PatchMapping("/stores/{storeId}/status")
    public StoreSummary changeStoreStatus(@PathVariable Long storeId, @RequestBody StatusRequest req, HttpSession session) {
        admin(session);
        return storeService.changeStatus(storeId, req.status());
    }

    @GetMapping("/posts")
    public List<PostResponse> posts(HttpSession session) {
        admin(session);
        return postService.recentForAdmin();
    }

    @PatchMapping("/posts/{postId}/status")
    public PostResponse changePostStatus(@PathVariable Long postId, @RequestBody PostStatusRequest req, HttpSession session) {
        admin(session);
        return postService.changeStatus(postId, req.status());
    }

    private void admin(HttpSession session) {
        authService.requireAdmin(LoginSession.require(session));
    }
}
