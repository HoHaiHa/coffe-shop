package com.haui.coffee_shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.haui.coffee_shop.model.ForgotPassword;
import com.haui.coffee_shop.model.User;

import java.util.Date;
import java.util.Optional;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, Long> {
    Optional<ForgotPassword> findByOtpAndUser(Integer otp , User user);
    Optional<ForgotPassword> findByUser(User user);

    @Transactional
    @Modifying
    void deleteByExpirationTimeBefore(Date expirationTime);

    @Transactional
    @Modifying
    void deleteByUser(User user);
}
