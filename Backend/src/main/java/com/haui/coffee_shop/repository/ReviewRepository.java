package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.haui.coffee_shop.model.Review;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT rv FROM Review rv WHERE rv.orderItem.productItem.product.id = :productId AND rv.status = 'ACTIVE'")
    List<Review> findByProductId(@Param("productId") Long productId);

    @Query("SELECT rv FROM Review rv WHERE rv.orderItem.order.id = :orderId")
    List<Review> findByOrderId( Long orderId);


}
