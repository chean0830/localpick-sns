package com.localpick.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "event")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id")
    private Store store;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 200)
    private String benefit;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "coupon_qty", nullable = false)
    private int couponQty;

    public Event(Store store, String title, String benefit,
                 LocalDate startDate, LocalDate endDate, int couponQty) {
        this.store = store;
        this.title = title;
        this.benefit = benefit;
        this.startDate = startDate;
        this.endDate = endDate;
        this.couponQty = couponQty;
    }

    public boolean isOngoing(LocalDate today) {
        return !today.isBefore(startDate) && !today.isAfter(endDate);
    }
}
