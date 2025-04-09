package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.haui.coffee_shop.model.TypeProduct;

import java.util.Optional;

@Repository
public interface TypeProductRepository extends JpaRepository<TypeProduct, Long> {
    Optional<TypeProduct> findByName(String name);
}
