package com.haui.coffee_shop.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.GsonUtil;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.payload.request.CartItemRequest;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.service.CartService;

@RestController
@AllArgsConstructor
@PreAuthorize("hasRole('ROLE_USER')")
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;
    public final MessageBuilder messageBuilder;
    @RequestMapping(value = "user/{userId}", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<String> getCartItems(@PathVariable Long userId) {
        try {
            RespMessage resp = cartService.getCartItems(userId);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage resp = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            RespMessage resp = messageBuilder.buildFailureMessage(Constant.UNDEFINED, null, e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @RequestMapping(value = "/item", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> addCartItem(@RequestBody CartItemRequest request) {
        try {
            RespMessage resp = cartService.addCartItem(request);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage resp = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            RespMessage resp = messageBuilder.buildFailureMessage(Constant.UNDEFINED, null, e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/item", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateCartItem(@RequestBody CartItemRequest request) {
        try {
            RespMessage resp = cartService.updateCartItem(request);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage resp = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            RespMessage resp = messageBuilder.buildFailureMessage(Constant.UNDEFINED, null, e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @RequestMapping(value = "/item/{itemId}" , method = RequestMethod.DELETE , produces = "application/json")
    public ResponseEntity<String> deleteCartItem(@PathVariable Long itemId) {
        try {
            RespMessage resp = cartService.deleteCartItem(itemId);
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.OK);
        } catch (CoffeeShopException e) {
            RespMessage resp = messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            RespMessage resp = messageBuilder.buildFailureMessage(Constant.UNDEFINED, null, e.getMessage());
            return new ResponseEntity<>(GsonUtil.getInstance().toJson(resp), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
