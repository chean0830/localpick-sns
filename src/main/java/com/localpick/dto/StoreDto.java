package com.localpick.dto;

import com.localpick.domain.Store;
import com.localpick.domain.StoreStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StoreDto {

    public record StoreRequest(
            @NotBlank(message = "가게명을 입력해 주세요.") @Size(max = 50) String name,
            @NotBlank(message = "업종을 입력해 주세요.") @Size(max = 20) String category,
            @NotBlank(message = "주소를 입력해 주세요.") @Size(max = 200) String address,
            @NotBlank(message = "동네를 입력해 주세요.") @Size(max = 30) String region,
            @Size(max = 50) String openHours,
            @Size(max = 2000) String intro) {
    }

    public record StoreSummary(Long id, String name, String category, String region, StoreStatus status) {
        public static StoreSummary from(Store s) {
            return new StoreSummary(s.getId(), s.getName(), s.getCategory(), s.getRegion(), s.getStatus());
        }
    }

    public record StoreDetail(Long id, String name, String category, String address, String region,
                              String openHours, String intro, StoreStatus status,
                              Long ownerId, String ownerNickname,
                              long postCount, long followerCount, long eventCount,
                              boolean following, boolean mine) {
    }

    public record FollowResponse(boolean following, long followerCount) {
    }

    public record StoreStats(long postCount, long totalViews, long totalLikes, long followerCount,
                             long couponIssued, long couponUsed, double couponUseRate) {
    }

    public record StatusRequest(StoreStatus status) {
    }
}
