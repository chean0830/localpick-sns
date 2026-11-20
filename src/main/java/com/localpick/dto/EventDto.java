package com.localpick.dto;

import com.localpick.domain.CouponStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class EventDto {

    public record EventRequest(
            @NotBlank(message = "이벤트명을 입력해 주세요.") @Size(max = 100) String title,
            @NotBlank(message = "혜택 내용을 입력해 주세요.") @Size(max = 200) String benefit,
            @NotNull(message = "시작일을 입력해 주세요.") LocalDate startDate,
            @NotNull(message = "종료일을 입력해 주세요.") LocalDate endDate,
            @Min(value = 1, message = "쿠폰 수량은 1장 이상이어야 합니다.") int couponQty) {
    }

    public record EventResponse(Long id, Long storeId, String storeName, String title, String benefit,
                                LocalDate startDate, LocalDate endDate,
                                int couponQty, long issued, long remaining, boolean downloaded) {
    }

    public record CouponResponse(Long id, Long eventId, String eventTitle, String storeName, String benefit,
                                 LocalDate endDate, CouponStatus status,
                                 LocalDateTime issuedAt, LocalDateTime usedAt) {
    }
}
