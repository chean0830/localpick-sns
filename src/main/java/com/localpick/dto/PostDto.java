package com.localpick.dto;

import com.localpick.domain.PostStatus;
import com.localpick.domain.PostType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class PostDto {

    public record PostRequest(
            @NotNull(message = "게시글 유형을 선택해 주세요.") PostType type,
            Long storeId,
            @NotBlank(message = "내용을 입력해 주세요.") @Size(max = 3000) String content,
            @Size(max = 5, message = "사진은 최대 5장까지 올릴 수 있습니다.") List<String> imageUrls,
            List<String> tags,
            @Valid EventDto.EventRequest event) {
    }

    public record PostUpdateRequest(@NotBlank @Size(max = 3000) String content, List<String> tags) {
    }

    public record PostResponse(Long id, PostType type, PostStatus status, String content, int viewCount,
                               LocalDateTime createdAt,
                               Long authorId, String authorNickname,
                               Long storeId, String storeName,
                               List<String> images, List<String> tags,
                               long likeCount, long commentCount,
                               boolean liked, boolean mine) {
    }

    public record LikeResponse(boolean liked, long likeCount) {
    }

    public record CommentRequest(@NotBlank(message = "댓글을 입력해 주세요.") @Size(max = 500) String content) {
    }

    public record CommentResponse(Long id, String content, LocalDateTime createdAt,
                                  Long authorId, String authorNickname, boolean mine) {
    }

    public record PageResponse<T>(List<T> items, int page, boolean hasNext) {
    }
}
