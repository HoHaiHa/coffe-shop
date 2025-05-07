package com.haui.coffee_shop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.GsonUtil;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.payload.request.ChangePasswordDTO;
import com.haui.coffee_shop.payload.request.LoginRequest;
import com.haui.coffee_shop.payload.request.RegisterRequest;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.service.AuthService;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {
    public final AuthService authService;
    public final MessageBuilder messageBuilder;

    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        try {
            RespMessage response = authService.login(loginRequest);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage resp = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            RespMessage resp = messageBuilder.buildFailureMessage(Constant.UNDEFINED, null, e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> register(@RequestBody RegisterRequest registerRequest) {
        try {
            RespMessage response = authService.register(registerRequest);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.OK);
        } catch (CoffeeShopException e){
            RespMessage response = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            RespMessage response = messageBuilder.buildFailureMessage(Constant.UNDEFINED, null, e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/user-details", method = RequestMethod.GET)
    public ResponseEntity<String> getAccount() {
        try {
            RespMessage response = authService.getProfileByToken();
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage response = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(value = "/password", method = RequestMethod.POST)
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        try {
            RespMessage response = authService.changePassword(changePasswordDTO);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage response = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            RespMessage response = messageBuilder.buildFailureMessage(Constant.UNDEFINED, null, e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(response), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RespMessage> refreshAccessToken(@RequestHeader("Authorization") String refreshToken) {
        RespMessage response = authService.refreshAccessToken(refreshToken);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
