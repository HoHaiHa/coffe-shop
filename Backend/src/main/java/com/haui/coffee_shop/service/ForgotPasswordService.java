package com.haui.coffee_shop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.haui.coffee_shop.repository.ForgotPasswordRepository;

import java.util.Date;

@Service
public class ForgotPasswordService {

    @Autowired
    private ForgotPasswordRepository forgotPasswordRepository;

    // Tác vụ sẽ chạy mỗi 10 phút (600000 ms)
    @Scheduled(fixedRate = 600000)
    public void deleteExpiredForgotPasswords() {
        Date now = new Date();
        forgotPasswordRepository.deleteByExpirationTimeBefore(now);
    }
}
