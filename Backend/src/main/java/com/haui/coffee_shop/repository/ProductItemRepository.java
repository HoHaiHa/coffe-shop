package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.haui.coffee_shop.model.ProductItem;

import java.util.List;


@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, Long> {

    boolean existsByProductIdAndTypeId(long productId, long typeId);

    List<ProductItem> findByProductId(long productId);
}