package com.localpick.repository;

import com.localpick.domain.Store;
import com.localpick.domain.StoreStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByOwnerIdOrderByIdDesc(Long ownerId);

    List<Store> findByStatusOrderByIdAsc(StoreStatus status);

    @Query("select s from Store s where s.status = :status and " +
            "(s.name like concat('%', :q, '%') or s.category like concat('%', :q, '%') " +
            "or s.region like concat('%', :q, '%')) order by s.id desc")
    List<Store> search(@Param("status") StoreStatus status, @Param("q") String q);
}
