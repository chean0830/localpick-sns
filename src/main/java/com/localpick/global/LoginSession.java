package com.localpick.global;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;

/** 세션에 로그인한 회원 id를 저장/조회하는 도우미 */
public final class LoginSession {

    public static final String KEY = "LOGIN_MEMBER_ID";

    private LoginSession() {
    }

    public static Long optional(HttpSession session) {
        return session == null ? null : (Long) session.getAttribute(KEY);
    }

    public static Long require(HttpSession session) {
        Long id = optional(session);
        if (id == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return id;
    }

    public static void login(HttpSession session, Long memberId) {
        session.setAttribute(KEY, memberId);
    }
}
