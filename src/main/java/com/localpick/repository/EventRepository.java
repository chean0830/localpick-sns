package com.localpick.repository;

import com.localpick.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStoreIdOrderByIdDesc(Long storeId);

    long countByStoreId(Long storeId);

    @Query("select e from Event e where e.startDate <= :today and e.endDate >= :today order by e.endDate asc")
    List<Event> findOngoing(@Param("today") LocalDate today);
}
