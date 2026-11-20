package com.localpick.repository;

import com.localpick.domain.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStoreIdOrderByIdDesc(Long storeId);

    long countByStoreId(Long storeId);

    /** 쿠폰 발급 시 같은 이벤트 행을 잠가 동시에 들어온 요청이 수량을 초과하지 않게 한다. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);

    @Query("select e from Event e where e.startDate <= :today and e.endDate >= :today order by e.endDate asc")
    List<Event> findOngoing(@Param("today") LocalDate today);
}
