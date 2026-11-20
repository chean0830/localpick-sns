package com.localpick.service;

import com.localpick.domain.Member;
import com.localpick.domain.Role;
import com.localpick.dto.AuthDto.*;
import com.localpick.global.ApiException;
import com.localpick.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MemberResponse signup(SignupRequest req) {
        if (req.role() == Role.ADMIN) {
            throw ApiException.badRequest("관리자 계정은 가입할 수 없습니다.");
        }
        if (memberRepository.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }
        Member member = new Member(req.email(), passwordEncoder.encode(req.password()), req.nickname(), req.role());
        return MemberResponse.from(memberRepository.save(member));
    }

    public Member login(LoginRequest req) {
        Member member = memberRepository.findByEmail(req.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(req.password(), member.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return member;
    }

    public MemberResponse me(Long memberId) {
        return MemberResponse.from(getMember(memberId));
    }

    @Transactional
    public MemberResponse updateProfile(Long memberId, ProfileRequest req) {
        Member member = getMember(memberId);
        member.updateProfile(req.nickname(), req.profileImg());
        return MemberResponse.from(member);
    }

    public void requireAdmin(Long memberId) {
        if (!getMember(memberId).isAdmin()) {
            throw ApiException.forbidden();
        }
    }

    Member getMember(Long memberId) {
        return memberRepository.findById(memberId).orElseThrow(() -> ApiException.notFound("회원"));
    }
}
