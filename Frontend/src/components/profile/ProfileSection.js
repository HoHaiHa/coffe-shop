import React from "react";
import { Avatar, Typography, Button, Upload, message } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import fetchWithAuth from "../../helps/fetchWithAuth";
import summaryApi from "../../common";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/userSlice";
const { Title, Text } = Typography;

const ProfileSection = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchWithAuth(summaryApi.uploadAvatarProfile.url, {
        method: summaryApi.uploadAvatarProfile.method,
        body: formData,
      });

      const data = await response.json();

      if (data.respCode === "000") {
        message.success("Ảnh đã được tải lên thành công!");
        dispatch(setUser(data.data));
      } else {
        message.error(data.message || "Tải ảnh thất bại.");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải ảnh.");
      console.error(error);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <motion.div 
        className="relative inline-block"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Avatar
          size={120}
          src={user.profile_img !== null ? user.profile_img : null}
          icon={<UserOutlined className="text-4xl" />}
          className="border-4 border-amber-500/20 shadow-lg"
        />

        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
        >
          <Button
            className="absolute bottom-0 right-0 rounded-full w-10 h-10 bg-white hover:bg-amber-50 
                     border-2 border-amber-500/20 hover:border-amber-500/40 
                     text-amber-600 flex items-center justify-center 
                     shadow-md hover:shadow-lg transition-all duration-300"
            icon={<EditOutlined />}
          />
        </Upload>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Title level={3} className="mt-6 mb-2 text-gray-800">
          {user.name}
        </Title>
        {user.name && user.created_at && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-amber-500/40"></div>
            <Text className="text-gray-500">
              Thành viên từ{" "}
              {new Date(user.created_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
            <div className="w-2 h-2 rounded-full bg-amber-500/40"></div>
          </div>
        )}
      </motion.div>
    </motion.section>
  );
};

export default ProfileSection;
