import React, { useState, useEffect, useRef } from "react";
import { MessageOutlined, CloseOutlined, SendOutlined } from "@ant-design/icons";
import { Input, Button, Spin } from "antd";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import fetchWithAuth from "../../helps/fetchWithAuth";
import summaryApi from "../../common/index";

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state?.user?.user);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setIsChatOpen(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user && isChatOpen) {
      navigate("/login");
    }
  });

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithAuth(
          summaryApi.getConversationOfUser.url + user?.id,
          {
            method: summaryApi.getConversationOfUser.method,
          }
        );
        const data = await response.json();
        if (data.respCode === "000") {
          const conversationData = data.data;
          if (!conversationData) {
            console.log(" error conversationData is null");
          } else {
            setConversation(conversationData);
          }
        } else {
          console.error("Error fetching conversation list:", data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user && isChatOpen) fetchConversation();
  }, [user, isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      const socketFactory = () => new SockJS(`${process.env.REACT_APP_BACKEND_URL}ws`);
      stompClient.current = Stomp.over(socketFactory);
      stompClient.current.connect(
        {},
        () => {
          console.log("Connected to WebSocket");
          stompClient.current.subscribe(
            `/topic/conversation/${conversation?.id}`,
            (data) => {
              const response = JSON.parse(data.body);
              if (response.respCode === "000") {
                const conv = response.data;
                setConversation(conv);
              }
            }
          );
        },
        (error) => console.error("WebSocket connection error:", error)
      );
    }
    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, [conversation, isChatOpen, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [conversation]);

  const handleSendMessage = () => {
    if (message.trim() && stompClient.current) {
      const chatMessage = {
        senderId: user.id,
        content: message,
        conversationId: conversation.id,
      };
      stompClient.current.send(
        `/app/chat/${conversation.id}`,
        {},
        JSON.stringify(chatMessage)
      );
      setMessage("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 bg-[#596ecd] hover:bg-[#596ecd]/90 text-white rounded-full flex items-center justify-center 
                     shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
        >
          <MessageOutlined className="text-2xl" />
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && user && (
        <div className="bg-white rounded-2xl shadow-2xl w-[340px] sm:w-[380px] overflow-hidden">
          {/* Header */}
          <div className="bg-[#596ecd] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Hỗ trợ khách hàng</h3>
              <p className="text-xs text-white/80">Hacafe luôn sẵn sàng hỗ trợ bạn</p>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <CloseOutlined className="text-lg" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-[400px] p-4 overflow-y-auto bg-gray-50">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" />
              </div>
            ) : (
              <div className="space-y-3">
                {conversation?.messageList?.map((msg) => (
                  <div
                    key={msg?.id}
                    className={`flex ${
                      msg.senderId === user.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.senderId === user.id
                          ? "bg-[#596ecd] text-white"
                          : "bg-white shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <Input.TextArea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="flex-1 resize-none rounded-xl"
              />
              <Button
                type="primary"
                onClick={handleSendMessage}
                className="bg-[#596ecd] hover:bg-[#596ecd]/90 flex items-center justify-center"
                icon={<SendOutlined />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget; 