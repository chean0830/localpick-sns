# 로컬픽 LocalPick

> 동네 가게와 단골을 잇는 **홍보·마케팅 SNS**
> 프로젝트3 · 1팀

소상공인 사장님이 가게 계정을 만들어 신메뉴·소식·쿠폰 이벤트를 직접 올리고, 동네 주민은 가게를 팔로우(단골 등록)해 우리 동네 소식과 혜택을 한곳에서 받아보는 웹 SNS입니다.

## 주요 기능

- **회원**: 일반회원 / 사장님 회원 가입, 세션 로그인, 프로필 수정
- **가게**: 가게 등록(관리자 승인), 가게 프로필, 팔로우
- **피드**: 전체 · 팔로우 · 우리동네 · 이벤트 탭, 사진(최대 5장)·해시태그 게시글
- **소통**: 좋아요, 댓글
- **마케팅**: 기간·수량 한정 쿠폰 이벤트, 쿠폰함·사용 처리, 사장님 홍보 통계(조회수·좋아요·쿠폰 사용률)
- **검색**: 가게명·업종·동네·본문·해시태그 통합 검색
- **관리자**: 가게 승인/반려, 게시글 블라인드

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| Backend | Java 17, Spring Boot 3.3, Spring Data JPA, Bean Validation, spring-security-crypto(BCrypt) |
| Database | H2 (local), MySQL 8 (mysql 프로필) |
| Frontend | **React 19 + Vite** (`frontend/`), 1차 버전 HTML/CSS/Vanilla JS (`src/main/resources/static`) |
| 협업 | Git, GitHub (Git Flow 기반 브랜치 전략, Pull Request) |

## 실행 방법

```bash
# JDK 17 이상 필요
./gradlew bootRun          # Windows: gradlew.bat bootRun
```

브라우저에서 http://localhost:8080 접속. local 프로필은 H2 메모리 DB와 샘플 데이터로 실행됩니다.

| 계정 | 이메일 | 비밀번호 |
|---|---|---|
| 일반회원 | user@localpick.kr | user1234 |
| 사장님 | owner@localpick.kr | owner1234 |
| 관리자 | admin@localpick.kr | admin1234 |

### React 프론트엔드 (개발 서버)

```bash
# 백엔드(8080)를 먼저 실행한 뒤
cd frontend
npm install
npm run dev                # http://localhost:5173  (/api 요청은 8080으로 프록시)
```

MySQL로 실행하려면 `localpick` DB를 만든 뒤 `./gradlew bootRun --args='--spring.profiles.active=mysql'`.

## 프로젝트 구조

```
src/main/java/com/localpick
├─ domain/        엔티티 (Member, Store, Post, Event, Coupon …)
├─ repository/    Spring Data JPA 리포지토리
├─ service/       비즈니스 로직
├─ controller/    REST API (/api/**)
├─ dto/           요청·응답 DTO (record)
└─ global/        예외 처리, 세션, 설정, 샘플 데이터
src/main/resources/static   프론트엔드 (HTML/CSS/JS)
frontend/src                React 앱 (pages · components · hooks · context · lib)
docs/                       기획 문서 (요구사항, ERD, 화면 설계, 결과보고서)
```

## 주요 API

| Method | URL | 설명 |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout` | 회원가입 · 로그인 · 로그아웃 |
| GET | `/api/posts?tab=all\|follow\|local\|event&region=&page=` | 메인 피드 |
| POST | `/api/posts` | 게시글 작성 (EVENT 유형은 쿠폰 이벤트 함께 생성) |
| POST | `/api/posts/{id}/like` | 좋아요 토글 |
| GET/POST | `/api/posts/{id}/comments` | 댓글 조회 · 작성 |
| POST | `/api/stores`, `/api/stores/{id}/follow` | 가게 등록 · 팔로우 토글 |
| GET | `/api/stores/{id}/stats` | 홍보 통계 (사장님) |
| GET | `/api/events` · POST `/api/events/{id}/coupons` | 진행 중 이벤트 · 쿠폰 받기 |
| GET | `/api/search?q=` / `?tag=` | 통합 검색 |
| PATCH | `/api/admin/stores/{id}/status`, `/api/admin/posts/{id}/status` | 관리자 승인 · 블라인드 |

## 브랜치 전략

```
main      ← 배포(제출) 브랜치
develop   ← 기능 통합 브랜치
feature/docs      기획 문서 (요구사항·ERD·화면설계)
feature/backend   REST API · DB
feature/frontend  화면 (HTML/CSS/JS)
fix/*             버그 수정
```

기능 브랜치에서 작업 → `develop`으로 Pull Request → 리뷰 후 병합 → 릴리스 시 `main`으로 병합합니다.

## 2차 개선 (REST · React)

- **REST 전환**: 게시글 컨트롤러를 MVC → `@RestController`로 전환 ([정리 문서](docs/rest-migration.md))
- **React UI/UX**: 무한 스크롤 + 스켈레톤 로딩, 낙관적 좋아요·팔로우, 글쓰기 드래그 앤 드롭·실시간 검증·미리보기
- **한계 개선**: 쿠폰 동시 발급 시 수량 초과 → 비관적 락 + 유니크 제약
- **확장 기능**: 사장님 홍보 대시보드 (쿠폰 사용률, 조회수 TOP3, 이벤트별 발급 현황)

## 문서

- [요구사항·기능 정의서](docs/requirements.md)
- [ERD·테이블 정의서](docs/erd.md)
- [화면 설계·사이트맵](docs/screens-sitemap.md)
- [REST 전환 정리](docs/rest-migration.md)
- [결과보고서 (pptx)](docs/1팀_팀명_결과보고서.pptx)
