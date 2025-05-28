package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.haui.coffee_shop.common.enums.OrderStatus;
import com.haui.coffee_shop.model.Order;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT od FROM Order od WHERE od.shippingAddress.id = :shippingAddressId")
    Optional<Order> findByShippingAddressId(@Param("shippingAddressId") Long shippingAddressId);

    @Query("SELECT od FROM Order od WHERE od.shippingAddress.user.id = :userId")
    List<Order> findByUserId(@Param("userId") Long userId);


    @Query("SELECT od FROM Order od WHERE od.status = :orderStatus")
    List<Order> findByStatus(@Param("orderStatus") OrderStatus orderStatus );
    
    @Query("SELECT od FROM Order od WHERE "
            + "(:startDate IS NULL OR od.orderDate >= :startDate) AND "
            + "(:endDate IS NULL OR od.orderDate <= :endDate)")
       List<Order> findAllFilterOrderDate(
           @Param("startDate") Date startDate,
           @Param("endDate") Date endDate);
}
