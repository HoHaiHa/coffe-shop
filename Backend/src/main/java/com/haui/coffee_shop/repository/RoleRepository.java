package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.haui.coffee_shop.common.enums.RoleEnum;
import com.haui.coffee_shop.model.Role;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    boolean existsByName(RoleEnum name);

    Optional<Role> findByName(RoleEnum name);

    Optional<Role> getRoleByName(RoleEnum name);
}
