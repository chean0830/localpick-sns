package com.localpick.dto;

import com.localpick.domain.Member;
import com.localpick.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public record SignupRequest(
            @NotBlank(message = "이메일을 입력해 주세요.") @Email(message = "이메일 형식이 아닙니다.") String email,
            @NotBlank(message = "비밀번호를 입력해 주세요.") @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.") String password,
            @NotBlank(message = "닉네임을 입력해 주세요.") @Size(max = 30) String nickname,
            @NotNull(message = "회원 유형을 선택해 주세요.") Role role) {
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {
    }

    public record ProfileRequest(@NotBlank @Size(max = 30) String nickname, String profileImg) {
    }

    public record MemberResponse(Long id, String email, String nickname, Role role, String profileImg) {
        public static MemberResponse from(Member m) {
            return new MemberResponse(m.getId(), m.getEmail(), m.getNickname(), m.getRole(), m.getProfileImg());
        }
    }
}
