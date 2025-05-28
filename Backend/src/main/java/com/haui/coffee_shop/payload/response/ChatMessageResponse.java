package com.haui.coffee_shop.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ChatMessageResponse {
    @JsonProperty("id")
    private long id;
    @JsonProperty("senderId")
    private long senderId;
    @JsonProperty("senderName")
    private String senderEmail;
    @JsonProperty("senderRole")
    private String senderRole;
    @JsonProperty("content")
    private String content;
}
