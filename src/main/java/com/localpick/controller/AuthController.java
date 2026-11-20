package com.localpick.controller;

import com.localpick.domain.Member;
import com.localpick.dto.AuthDto.*;
import com.localpick.global.LoginSession;
import com.localpick.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<MemberResponse> signup(@Valid @RequestBody SignupRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(req));
    }

    @PostMapping("/login")
    public MemberResponse login(@Valid @RequestBody LoginRequest req, HttpServletRequest request) {
        Member member = authService.login(req);
        HttpSession old = request.getSession(false);
        if (old != null) {
            old.invalidate();
        }
        LoginSession.login(request.getSession(true), member.getId());
        return MemberResponse.from(member);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    /** 로그인하지 않았으면 204 No Content */
    @GetMapping("/me")
    public ResponseEntity<MemberResponse> me(HttpSession session) {
        Long id = LoginSession.optional(session);
        if (id == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(authService.me(id));
    }

    @PutMapping("/me")
    public MemberResponse updateProfile(@Valid @RequestBody ProfileRequest req, HttpSession session) {
        return authService.updateProfile(LoginSession.require(session), req);
    }
}
