package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.haui.coffee_shop.model.Image;
import com.haui.coffee_shop.model.Product;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByProduct(Product product);
    void deleteByProduct(Product product);
    
}
