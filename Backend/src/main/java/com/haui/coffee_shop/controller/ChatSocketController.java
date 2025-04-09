package com.haui.coffee_shop.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.GsonUtil;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.payload.request.ChatMessageRequest;
import com.haui.coffee_shop.payload.response.ChatMessageResponse;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.service.ChatService;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatSocketController {
    public final ChatService chatService;
    public final MessageBuilder messageBuilder;
    public final SimpMessageSendingOperations simpMessageSendingOperations;
    @MessageMapping("/chat/{conversationId}")
    @SendTo("/topic/conversation/{conversationId}")
    public String sendMessage(
            @DestinationVariable long conversationId,
            ChatMessageRequest message) {
        try {
            RespMessage conversationResponse = chatService.updateMessage(message, conversationId);
            String response = GsonUtil.getInstance().toJson(conversationResponse);
            simpMessageSendingOperations.convertAndSend("/topic/admin" , response);
            return response;
        } catch (CoffeeShopException exception) {
            RespMessage respMessage = messageBuilder.buildFailureMessage(exception.getCode(), exception.getObjects(), exception.getMessage());
            return GsonUtil.getInstance().toJson(respMessage);

        } catch (Exception e) {
            RespMessage respMessage = messageBuilder.buildFailureMessage(Constant.SYSTEM_ERROR, null, e.getMessage());
            return GsonUtil.getInstance().toJson(respMessage);
        }
    }

}
