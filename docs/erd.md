# ERD · 테이블 정의서

```mermaid
erDiagram
    MEMBER ||--o{ STORE : owns
    MEMBER ||--o{ POST : writes
    MEMBER ||--o{ COMMENT : writes
    MEMBER ||--o{ LIKES : presses
    MEMBER ||--o{ FOLLOW : follows
    MEMBER ||--o{ COUPON : downloads
    STORE ||--o{ FOLLOW : "followed by"
    STORE ||--o{ POST : promotes
    STORE ||--o{ EVENT : hosts
    EVENT ||--o{ COUPON : issues
    POST ||--o{ POST_IMAGE : has
    POST ||--o{ COMMENT : has
    POST ||--o{ LIKES : has
    POST ||--o{ POST_TAG : tagged
    HASHTAG ||--o{ POST_TAG : tagged

    MEMBER { bigint member_id PK; varchar email UK; varchar password; varchar nickname; varchar role; varchar profile_img; datetime created_at }
    STORE { bigint store_id PK; bigint owner_id FK; varchar name; varchar category; varchar address; varchar region; varchar open_hours; varchar intro; varchar status; datetime created_at }
    POST { bigint post_id PK; bigint member_id FK; bigint store_id FK; varchar post_type; varchar content; int view_count; varchar status; datetime created_at }
    POST_IMAGE { bigint image_id PK; bigint post_id FK; varchar image_url; int sort_order }
    COMMENT { bigint comment_id PK; bigint post_id FK; bigint member_id FK; varchar content; datetime created_at }
    LIKES { bigint like_id PK; bigint post_id FK; bigint member_id FK; datetime created_at }
    FOLLOW { bigint follow_id PK; bigint member_id FK; bigint store_id FK; datetime created_at }
    EVENT { bigint event_id PK; bigint store_id FK; varchar title; varchar benefit; date start_date; date end_date; int coupon_qty }
    COUPON { bigint coupon_id PK; bigint event_id FK; bigint member_id FK; varchar status; datetime issued_at; datetime used_at }
    HASHTAG { bigint tag_id PK; varchar name UK }
    POST_TAG { bigint post_id PK; bigint tag_id PK }
```

## 테이블 정의서

### MEMBER (회원)
| 컬럼명 | 타입 | 키 | NULL | 설명 |
|---|---|---|---|---|
| member_id | BIGINT | PK | N | 회원 번호(자동 증가) |
| email | VARCHAR(100) | UK | N | 로그인 이메일 |
| password | VARCHAR(255) | | N | BCrypt 암호화 |
| nickname | VARCHAR(30) | | N | 닉네임 |
| role | VARCHAR(10) | | N | USER / OWNER / ADMIN |
| profile_img | VARCHAR(255) | | Y | 프로필 이미지 경로 |
| created_at | DATETIME | | N | 가입일시 |

### STORE (가게)
| 컬럼명 | 타입 | 키 | NULL | 설명 |
|---|---|---|---|---|
| store_id | BIGINT | PK | N | 가게 번호 |
| owner_id | BIGINT | FK | N | 사장님(MEMBER) |
| name | VARCHAR(50) | | N | 가게명 |
| category | VARCHAR(20) | | N | 업종 |
| address | VARCHAR(200) | | N | 도로명 주소 |
| region | VARCHAR(30) | | N | 동네(행정동) |
| open_hours | VARCHAR(50) | | Y | 영업시간 |
| intro | VARCHAR(2000) | | Y | 가게 소개 |
| status | VARCHAR(10) | | N | WAIT / OK / REJECT |
| created_at | DATETIME | | N | 등록일시 |

### POST (게시글)
| 컬럼명 | 타입 | 키 | NULL | 설명 |
|---|---|---|---|---|
| post_id | BIGINT | PK | N | 게시글 번호 |
| member_id | BIGINT | FK | N | 작성자 |
| store_id | BIGINT | FK | Y | 홍보 가게(일반글은 NULL) |
| post_type | VARCHAR(10) | | N | NORMAL / PROMO / EVENT |
| content | VARCHAR(3000) | | N | 본문 |
| view_count | INT | | N | 조회수 |
| status | VARCHAR(10) | | N | OPEN / BLIND |
| created_at | DATETIME | | N | 작성일시 |

### POST_IMAGE / COMMENT / LIKES / FOLLOW
| 테이블 | 컬럼 |
|---|---|
| POST_IMAGE | image_id(PK), post_id(FK), image_url, sort_order |
| COMMENT | comment_id(PK), post_id(FK), member_id(FK), content(500), created_at |
| LIKES | like_id(PK), post_id(FK), member_id(FK), created_at — (post_id, member_id) UK |
| FOLLOW | follow_id(PK), member_id(FK), store_id(FK), created_at — (member_id, store_id) UK |

### EVENT / COUPON / HASHTAG / POST_TAG
| 테이블 | 컬럼 |
|---|---|
| EVENT | event_id(PK), store_id(FK), title(100), benefit(200), start_date, end_date, coupon_qty |
| COUPON | coupon_id(PK), event_id(FK), member_id(FK), status(UNUSED/USED/EXPIRED), issued_at, used_at — (event_id, member_id) UK |
| HASHTAG | tag_id(PK), name(50, UK) |
| POST_TAG | post_id(PK, FK), tag_id(PK, FK) |
