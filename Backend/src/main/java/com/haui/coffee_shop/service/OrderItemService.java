package com.haui.coffee_shop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.model.OrderItem;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.repository.OrderItemRepository;

import java.util.List;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private MessageBuilder messageBuilder;

    public RespMessage getAllOrderItems() {
        List<OrderItem> orderItems = orderItemRepository.findAll();
        return messageBuilder.buildSuccessMessage(orderItems);
    }
}
