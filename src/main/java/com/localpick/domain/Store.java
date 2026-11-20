package com.localpick.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "store")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    private Member owner;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 20)
    private String category;

    @Column(nullable = false, length = 200)
    private String address;

    @Column(nullable = false, length = 30)
    private String region;

    @Column(name = "open_hours", length = 50)
    private String openHours;

    @Column(length = 2000)
    private String intro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StoreStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Store(Member owner, String name, String category, String address,
                 String region, String openHours, String intro) {
        this.owner = owner;
        this.name = name;
        this.category = category;
        this.address = address;
        this.region = region;
        this.openHours = openHours;
        this.intro = intro;
        this.status = StoreStatus.WAIT;
    }

    public void update(String name, String category, String address,
                       String region, String openHours, String intro) {
        this.name = name;
        this.category = category;
        this.address = address;
        this.region = region;
        this.openHours = openHours;
        this.intro = intro;
    }

    public void changeStatus(StoreStatus status) {
        this.status = status;
    }

    public boolean isOwnedBy(Long memberId) {
        return owner.getId().equals(memberId);
    }

    public boolean isApproved() {
        return status == StoreStatus.OK;
    }
}
