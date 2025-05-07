package com.haui.coffee_shop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.GsonUtil;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.payload.request.ShippingAddressRequest;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.service.ShippingAddressService;

@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class ShippingAddressController {
    private final ShippingAddressService shippingAddressService;
    private final MessageBuilder messageBuilder;
    @RequestMapping(value = "",method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<String> getShippingAddress() {
        try {
            RespMessage resp = shippingAddressService.getShippingAddress();
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

    @RequestMapping(value = "",method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> addShippingAddress(@RequestBody ShippingAddressRequest shippingAddressRequest) {
        try {
            RespMessage resp = shippingAddressService.addShippingAddress(shippingAddressRequest);
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

    @RequestMapping(value = "",method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<String> updateShippingAddress(@RequestBody ShippingAddressRequest shippingAddressRequest) {
        try {
            RespMessage resp = shippingAddressService.updateShippingAddress(shippingAddressRequest);
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

    @RequestMapping(value = "/{id}",method = RequestMethod.DELETE)
    public ResponseEntity<String> deleteShippingAddress(@PathVariable Long id) {
        try {
            RespMessage resp = shippingAddressService.deleteShippingAddress(id);
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
