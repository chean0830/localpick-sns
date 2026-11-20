package com.localpick.controller;

import com.localpick.dto.EventDto.EventResponse;
import com.localpick.dto.PostDto.PostResponse;
import com.localpick.dto.StoreDto.*;
import com.localpick.global.LoginSession;
import com.localpick.service.EventService;
import com.localpick.service.PostService;
import com.localpick.service.StoreService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final PostService postService;
    private final EventService eventService;

    @GetMapping
    public List<StoreSummary> list(@RequestParam(required = false) String q) {
        return storeService.search(q);
    }

    @GetMapping("/mine")
    public List<StoreSummary> mine(HttpSession session) {
        return storeService.myStores(LoginSession.require(session));
    }

    @GetMapping("/following")
    public List<StoreSummary> following(HttpSession session) {
        return storeService.followingStores(LoginSession.require(session));
    }

    @PostMapping
    public ResponseEntity<StoreSummary> create(@Valid @RequestBody StoreRequest req, HttpSession session) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.create(LoginSession.require(session), req));
    }

    @GetMapping("/{storeId}")
    public StoreDetail detail(@PathVariable Long storeId, HttpSession session) {
        return storeService.detail(storeId, LoginSession.optional(session));
    }

    @PutMapping("/{storeId}")
    public StoreSummary update(@PathVariable Long storeId, @Valid @RequestBody StoreRequest req, HttpSession session) {
        return storeService.update(LoginSession.require(session), storeId, req);
    }

    @PostMapping("/{storeId}/follow")
    public FollowResponse follow(@PathVariable Long storeId, HttpSession session) {
        return storeService.toggleFollow(LoginSession.require(session), storeId);
    }

    @GetMapping("/{storeId}/posts")
    public List<PostResponse> posts(@PathVariable Long storeId, HttpSession session) {
        return postService.byStore(storeId, LoginSession.optional(session));
    }

    @GetMapping("/{storeId}/events")
    public List<EventResponse> events(@PathVariable Long storeId, HttpSession session) {
        return eventService.byStore(storeId, LoginSession.optional(session));
    }

    @GetMapping("/{storeId}/stats")
    public StoreStats stats(@PathVariable Long storeId, HttpSession session) {
        return storeService.stats(LoginSession.require(session), storeId);
    }
}
