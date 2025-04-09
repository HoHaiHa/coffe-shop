package com.haui.coffee_shop.controller;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.haui.coffee_shop.common.GsonUtil;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.model.Transaction;
import com.haui.coffee_shop.payload.request.TransactionRequest;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.service.TransactionService;

@Controller
@AllArgsConstructor
@RequestMapping("api/transaction")
public class TransactionController {
    private final TransactionService transactionService;
    private final MessageBuilder messageBuilder;

    @RequestMapping(value = "", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> addTransaction(@RequestBody TransactionRequest transactionRequest) {
        try {
            RespMessage respMessage = transactionService.addTransaction(transactionRequest);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(respMessage), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage respMessage = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(respMessage), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(value = "", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<String> getTransactions(@RequestParam long orderId) {
        try {
            RespMessage respMessage = transactionService.getTransaction(orderId);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(respMessage), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage respMessage = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(respMessage), HttpStatus.BAD_REQUEST);
        }
    }
}
