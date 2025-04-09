package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.haui.coffee_shop.model.ShippingAddress;
import com.haui.coffee_shop.model.User;

import java.util.List;
import java.util.Optional;

public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {

    Optional<List<ShippingAddress>> findByUser(User user);
}
