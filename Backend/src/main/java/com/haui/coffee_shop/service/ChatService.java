package com.haui.coffee_shop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.model.ChatMessage;
import com.haui.coffee_shop.model.Conversation;
import com.haui.coffee_shop.model.User;
import com.haui.coffee_shop.payload.request.ChatMessageRequest;
import com.haui.coffee_shop.payload.response.ChatMessageResponse;
import com.haui.coffee_shop.payload.response.ConversationResponse;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.repository.ChatMessageRepository;
import com.haui.coffee_shop.repository.ConversationRepository;
import com.haui.coffee_shop.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageBuilder messageBuilder;

    @Transactional
    public RespMessage updateMessage(ChatMessageRequest message, long conversationId) {
        ChatMessage chatMessage = new ChatMessage();

        Optional<Conversation> conversationOp = conversationRepository.findById(conversationId);
        if (conversationOp.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"conversation Id"}, "conversation id not found");
        }
        Conversation conversation = conversationOp.get();

        conversationRepository.save(conversation);

        chatMessage.setConversation(conversation);

        Optional<User> sender = userRepository.findById(message.getSenderId());
        if (sender.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"sender Id"}, "sender id not found");
        }
        chatMessage.setSender(sender.get());
        chatMessage.setContent(message.getContent());
        if(sender.get().getRole().getName().toString() == "ROLE_USER") {
            conversation.setReaded(false);
        }else {
            conversation.setReaded(true);
        }

        try {
            chatMessageRepository.save(chatMessage);
            ConversationResponse response = getConversationResponse(conversation);
            return messageBuilder.buildSuccessMessage(response);
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{"chat message"}, "save chat message error");
        }
    }

    private ChatMessageResponse convertMessageResponse(ChatMessage chatMessage) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(chatMessage.getId());
        response.setSenderId(chatMessage.getSender().getId());
        response.setContent(chatMessage.getContent());
        response.setSenderEmail(chatMessage.getSender().getEmail());
        response.setSenderRole(chatMessage.getSender().getRole().getName().toString());
        return response;
    }

    private ConversationResponse getConversationResponse(Conversation conversation) {
        ConversationResponse response = new ConversationResponse();
        response.setId(conversation.getId());

        User host = conversation.getHost();
        response.setHostId(host.getId());
        response.setHostName(host.getEmail());
        response.setHostAvatar(host.getProfile_img());

        // Trả về trạng thái isReaded
        response.setReaded(conversation.isReaded());

        List<ChatMessage> messageList = chatMessageRepository.findByConversationId(conversation.getId());
        List<ChatMessageResponse> chatMessageResponseList = new ArrayList<>();
        for (ChatMessage message : messageList) {
            chatMessageResponseList.add(convertMessageResponse(message));
        }
        response.setMessageList(chatMessageResponseList);
        return response;
    }

    public RespMessage getAllConversation() {
        List<Conversation> allConversation = conversationRepository.findByUserIsActive();
        List<ConversationResponse> conversationResponseList = new ArrayList<>();
        for (Conversation conversation : allConversation) {
            ConversationResponse response = getConversationResponse(conversation);
            conversationResponseList.add(response);
        }
        return messageBuilder.buildSuccessMessage(conversationResponseList);
    }

    public RespMessage getConversationById(long id) {
        Optional<Conversation> conversation = conversationRepository.findById(id);
        if (conversation.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"conversation Id"}, "conversation id not found");
        }
        ConversationResponse response = getConversationResponse(conversation.get());
        return messageBuilder.buildSuccessMessage(response);
    }

    public RespMessage getConversationByHostId(long userId) {
        Optional<User> hostOp = userRepository.findById(userId);
        if (hostOp.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"user Id"}, "user id not found");
        }
        Optional<Conversation> conversation = conversationRepository.findByHostId(hostOp.get().getId());
        if (conversation.isEmpty()) {
            return createConversation(userId);
        }
        ConversationResponse response = getConversationResponse(conversation.get());
        return messageBuilder.buildSuccessMessage(response);
    }

    public RespMessage createConversation(long hostId) {
        Optional<User> host = userRepository.findById(hostId);
        if (host.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"user 1 Id"}, "user 1 id not found");
        }

        Conversation conversation = new Conversation();
        conversation.setHost(host.get());
        conversation.setReaded(true); // Mặc định là đã đọc khi tạo mới

        conversationRepository.save(conversation);
        return messageBuilder.buildSuccessMessage(getConversationResponse(conversation));
    }
    
    @Transactional
    public RespMessage markConversationAsRead(long id) {
        try {
            int updatedRows = conversationRepository.markAsReadByHostId(id);
            if (updatedRows == 0) {
                throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"host Id"}, "Conversation not found for host id: " + id);
            }
            return messageBuilder.buildSuccessMessage("Đã đánh dấu là đã đọc");
        } catch (CoffeeShopException e) {
            return messageBuilder.buildFailureMessage(e.getCode(), e.getObjects(), e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return messageBuilder.buildFailureMessage(Constant.SYSTEM_ERROR, null, "Lỗi hệ thống: " + e.getMessage());
        }
    }

}
