package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.haui.coffee_shop.model.Brand;
import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findByName(String name);
    
    @Query("SELECT b FROM Brand b WHERE b.status = 'ACTIVE'")
    List<Brand> getAll();
}