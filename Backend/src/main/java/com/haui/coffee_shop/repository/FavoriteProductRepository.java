package com.haui.coffee_shop.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.haui.coffee_shop.model.FavoriteProduct;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteProductRepository extends JpaRepository<FavoriteProduct, Long> {
    List<FavoriteProduct> findByUserId(Long userId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    Optional<FavoriteProduct> findByUserIdAndProductId(Long userId, Long productId);
}
