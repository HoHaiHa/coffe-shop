package com.haui.coffee_shop.utils;

import lombok.Builder;

@Builder
public record MailBody(String to , String subject, String body) {
}
