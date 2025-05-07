package com.haui.coffee_shop.exception;

import lombok.Getter;

@Getter
public class CoffeeShopException extends RuntimeException {
    private String code;
    private Object[] objects;

    public CoffeeShopException(String code, Object[] objects, String msg) {
        super(msg);
        this.code = code;
        this.objects = objects;
    }

    public CoffeeShopException(String string) {
        //TODO Auto-generated constructor stub
    }
}
