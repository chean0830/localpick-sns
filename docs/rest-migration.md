# REST 아키텍처 전환 — 게시글 컨트롤러

대표 컨트롤러인 **게시글(Post) 컨트롤러**를 화면(View)을 반환하는 MVC 방식에서 JSON을 주고받는 REST 방식으로 바꿨다.
화면은 React(`frontend/`)가 그리고, 서버는 데이터와 상태 코드만 책임진다.

## 전환 전 — MVC 컨트롤러 (Thymeleaf 뷰 반환)

```java
@Controller
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostViewController {

    private final PostService postService;

    @GetMapping
    public String list(@RequestParam(defaultValue = "all") String tab,
                       @RequestParam(defaultValue = "0") int page,
                       HttpSession session, Model model) {
        model.addAttribute("feed", postService.feed(tab, null, page, LoginSession.optional(session)));
        return "post/list";                          // 서버가 HTML 렌더링
    }

    @GetMapping("/{postId}")
    public String detail(@PathVariable Long postId, HttpSession session, Model model) {
        model.addAttribute("post", postService.detail(postId, LoginSession.optional(session)));
        return "post/detail";
    }

    @PostMapping
    public String create(@ModelAttribute PostForm form, HttpSession session) {
        Long id = postService.create(LoginSession.require(session), form.toRequest()).id();
        return "redirect:/posts/" + id;              // 성공 = 리다이렉트
    }

    @PostMapping("/{postId}/delete")                 // HTML form은 GET/POST만 가능
    public String delete(@PathVariable Long postId, HttpSession session) {
        postService.delete(LoginSession.require(session), postId);
        return "redirect:/posts";
    }
}
```

## 전환 후 — REST 컨트롤러 (`PostController.java`)

```java
@RestController                                       // 모든 메서드 반환값 = JSON 응답 본문
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {

    @GetMapping("/posts")                             // GET 목록
    public PageResponse<PostResponse> feed(@RequestParam(defaultValue = "all") String tab, ...) { ... }

    @GetMapping("/posts/{postId}")                    // GET 단건
    public PostResponse detail(@PathVariable Long postId, HttpSession session) { ... }

    @PostMapping("/posts")                            // POST 생성 → 201 Created
    public ResponseEntity<PostResponse> create(@Valid @RequestBody PostRequest req, HttpSession session) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(LoginSession.require(session), req));
    }

    @PutMapping("/posts/{postId}")                    // PUT 수정
    public PostResponse update(...) { ... }

    @DeleteMapping("/posts/{postId}")                 // DELETE 삭제 → 204 No Content
    public ResponseEntity<Void> delete(@PathVariable Long postId, HttpSession session) {
        postService.delete(LoginSession.require(session), postId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/like")              // 하위 리소스: 좋아요
    public LikeResponse like(...) { ... }
}
```

## 바뀐 점

| 항목 | MVC (전) | REST (후) |
|---|---|---|
| 어노테이션 | `@Controller` + 뷰 이름 반환 | `@RestController` (JSON 반환) |
| URL | 동사 포함 `/posts/{id}/delete` | 자원 중심 `/api/posts/{id}` + HTTP 메서드 |
| 입력 | `@ModelAttribute` 폼 데이터 | `@Valid @RequestBody` JSON DTO(record) |
| 결과 | `redirect:` / 템플릿 | 상태 코드 201·204·400·401·403·404·409 |
| 오류 | 에러 페이지 | `GlobalExceptionHandler`가 `{"message": "..."}` JSON |
| 화면 | 서버(Thymeleaf) | 클라이언트(React) — 웹·앱이 같은 API 재사용 |
