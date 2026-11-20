package com.localpick.controller;

import com.localpick.dto.EventDto.CouponResponse;
import com.localpick.dto.EventDto.EventResponse;
import com.localpick.global.LoginSession;
import com.localpick.service.EventService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping("/events")
    public List<EventResponse> ongoing(HttpSession session) {
        return eventService.ongoing(LoginSession.optional(session));
    }

    @PostMapping("/events/{eventId}/coupons")
    public CouponResponse download(@PathVariable Long eventId, HttpSession session) {
        return eventService.download(LoginSession.require(session), eventId);
    }

    @GetMapping("/coupons/mine")
    public List<CouponResponse> myCoupons(HttpSession session) {
        return eventService.myCoupons(LoginSession.require(session));
    }

    @PostMapping("/coupons/{couponId}/use")
    public CouponResponse use(@PathVariable Long couponId, HttpSession session) {
        return eventService.use(LoginSession.require(session), couponId);
    }
}
