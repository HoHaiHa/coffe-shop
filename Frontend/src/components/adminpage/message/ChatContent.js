import React, { useState, useEffect, useRef } from "react";
import { List, Avatar, Input, Spin, Button, Typography, Pagination } from "antd";
import { LoadingOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useSelector } from "react-redux";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common/index";
import { BellOutlined } from '@ant-design/icons';


const { Text } = Typography;

const ChatContent = () => {
  const [loading, setLoading] = useState(true);
  const [selectedConversationId, setselectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversationList, setConversationList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const user = useSelector((state) => state?.user?.user);
  const currentConversation = conversationList.find(c => c.id === selectedConversationId);


  const fetchAllConversation = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        summaryApi.getAllConversation.url,
        {
          method: summaryApi.getAllConversation.method,
        }
      );
      const data = await response.json();
      if (data.respCode === "000") {
        setConversationList(data.data);
      } else {
        console.error("Error fetching conversation list:", data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllConversation();
  }, []);

  useEffect(() => {
    setLoading(true);
    const socketFactory = () => new SockJS(`${process.env.REACT_APP_BACKEND_URL}ws`);
    stompClient.current = Stomp.over(socketFactory);
    stompClient.current.connect(
      {},
      () => {
        setLoading(false);
        stompClient.current.subscribe("/topic/admin", (data) => {
          const response = JSON.parse(data.body);
          if (response.respCode === "000") {
            const conv = response.data;
            setConversationList((prev) => {
              const index = prev.findIndex((c) => c.id === conv.id);
              if (index === -1) {
                return [...prev, conv];
              }
              return [
                ...prev.slice(0, index),
                conv,
                ...prev.slice(index + 1),
              ];
            });
          } else {
            console.error("Error fetching conversation list:", response);
          }
        });
      },
      (error) => console.error("WebSocket connection error:", error)
    );

    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, []);

  const handleReadMessage = async (conversationId) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.REACT_APP_BACKEND_URL}api/conversation/read/${conversationId}`,
        {
          method: 'PUT',
        }
      );
      const data = await response.json();
      if (data.respCode === "000") {
        setConversationList(prev =>
          prev.map(convo =>
            convo.id === conversationId
              ? {
                ...convo,
                messageList: convo.messageList.map(msg =>
                  msg.senderId !== user.id ? { ...msg, read: true } : msg
                )
              }
              : convo
          )
        );
      } else {
        console.error("Failed to mark as read:", data);
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
    } finally {
      fetchAllConversation()
    }
  };


  const handleSendMessage = (conversationId) => {
    if (newMessage.trim() && selectedConversationId && stompClient.current) {
      const chatMessage = {
        senderId: user.id,
        content: newMessage,
        conversationId: conversationId,
      };
      stompClient.current.send(
        `/app/chat/${conversationId}`,
        {},
        JSON.stringify(chatMessage)
      );
      setNewMessage("");
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [conversationList]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#596ecd' }} spin />} />
      </div>
    );
  }

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

const paginatedData = conversationList
  .sort((a, b) => {
    const aMessages = a.messageList;
    const bMessages = b.messageList;

    const aLastMsg = aMessages.length > 0 
      ? aMessages.reduce((max, msg) => msg.id > max.id ? msg : max, aMessages[0]) 
      : null;
    const bLastMsg = bMessages.length > 0 
      ? bMessages.reduce((max, msg) => msg.id > max.id ? msg : max, bMessages[0]) 
      : null;

    if (!aLastMsg && bLastMsg) return 1;
    if (aLastMsg && !bLastMsg) return -1;
    if (!aLastMsg && !bLastMsg) return 0;

    return bLastMsg.id - aLastMsg.id;
  })
  .slice((currentPage - 1) * pageSize, currentPage * pageSize);


  const getLastMessage = (conversation) => {
    const messages = conversation.messageList || [];
    return messages[messages.length - 1]?.content || '';
  };

  const getUnreadCount = (conversation) => {
    return (conversation.messageList || []).filter(msg => !msg.read && msg.senderId !== user.id).length;
  };

  return (
    <div className="flex -mt-5 h-[calc(100vh-60px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg z-10">
        <div className="p-6 border-b">
          <Text className="text-xl font-semibold text-gray-800">Cuộc trò chuyện</Text>
        </div>
        <div className="overflow-y-auto h-[calc(100%-140px)]">
          <List
            itemLayout="horizontal"
            dataSource={paginatedData}
            className="px-2"
            renderItem={(conversation) => (
              <List.Item
                key={conversation.id}
                className={`relative cursor-pointer rounded-xl transition-all duration-200 my-2 px-4 py-3
                  ${selectedConversationId === conversation.id
                    ? "bg-[#596ecd]/10 border-l-4 border-[#596ecd] shadow-sm"
                    : "hover:bg-gray-50 border-l-4 border-transparent"}
                  ${!conversation.readed && selectedConversationId !== conversation.id
                    ? "bg-yellow-100 border-yellow-400 font-semibold text-black"
                    : "text-gray-700"}
                `}
                onClick={() => {
                  setselectedConversationId(conversation.id);
                  handleReadMessage(conversation.id);
                }}
              >
                <div className="flex items-center w-full p-3">
                  <div className="relative">
                    <Avatar
                      size={48}
                      src={conversation.hostAvatar}
                      icon={<UserOutlined />}
                      className="bg-[#596ecd]/10 text-[#596ecd]"
                    />
                    {!conversation.readed && selectedConversationId !== conversation.id && (
                      <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 flex items-center justify-center w-5 h-5">
                        <BellOutlined className="text-white text-[10px]" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex flex-col flex-1 min-w-0">
                    <Text className="font-medium text-gray-900 block" ellipsis>
                      {conversation.hostName}
                    </Text>
                    <Text className="text-gray-500 text-sm block" ellipsis>
                      {getLastMessage(conversation)}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
        <div className="border-t p-4 bg-white">
          <Pagination
            size="small"
            current={currentPage}
            pageSize={pageSize}
            total={conversationList.length}
            onChange={handlePageChange}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white ml-5 rounded-l-3xl shadow-lg">
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b">
              <div className="flex items-center">
                <Avatar
                  size={40}
                  src={conversationList.find(c => c.id === selectedConversationId)?.hostAvatar}
                  icon={<UserOutlined />}
                  className="bg-[#596ecd]/10 text-[#596ecd]"
                />
                <Text className="ml-3 text-lg font-medium">
                  {conversationList.find(c => c.id === selectedConversationId)?.hostName}
                </Text>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(conversationList.find(c => c.id === selectedConversationId)?.messageList || [])
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === "ROLE_USER" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl ${msg.senderRole === "ROLE_USER"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-[#596ecd] text-white"
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-4">
                <Input.TextArea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="flex-1 rounded-xl border-gray-200 focus:border-[#596ecd] focus:shadow-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(selectedConversationId);
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => handleSendMessage(selectedConversationId)}
                  className="bg-[#596ecd] hover:bg-[#596ecd]/90 rounded-xl h-[40px] px-6"
                >
                  Gửi
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <UserOutlined style={{ fontSize: '48px' }} />
              </div>
              <Text className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContent; 