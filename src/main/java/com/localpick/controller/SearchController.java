package com.localpick.controller;

import com.localpick.dto.PostDto.PostResponse;
import com.localpick.dto.StoreDto.StoreSummary;
import com.localpick.global.LoginSession;
import com.localpick.service.PostService;
import com.localpick.service.StoreService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final StoreService storeService;
    private final PostService postService;

    public record SearchResponse(List<StoreSummary> stores, List<PostResponse> posts) {
    }

    /** q: 키워드(가게명·업종·동네·본문·해시태그), tag: 해시태그 전용 검색 */
    @GetMapping
    public SearchResponse search(@RequestParam(required = false) String q,
                                 @RequestParam(required = false) String tag,
                                 HttpSession session) {
        Long viewer = LoginSession.optional(session);
        if (tag != null && !tag.isBlank()) {
            return new SearchResponse(List.of(), postService.byTag(tag, viewer));
        }
        if (q == null || q.isBlank()) {
            return new SearchResponse(List.of(), List.of());
        }
        return new SearchResponse(storeService.search(q), postService.search(q, viewer));
    }
}
