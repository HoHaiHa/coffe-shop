import React, { useState } from "react";
import { Typography, List, Spin, Form, Button, Modal, message } from "antd";
import { UserOutlined, LoadingOutlined, EditOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiMail,
  FiGift,
  FiAlertCircle,
  FiPhone,
  FiKey,
  FiUser,
  FiChevronRight,
} from "react-icons/fi";
import { toast } from "react-toastify";
import PasswordInput from "../components/validateInputForm/PasswordInput";
import { TbInfoSquare } from "react-icons/tb";
import fetchWithAuth from "../helps/fetchWithAuth";
import summaryApi from "../common";
import Wishlist from "../components/profile/wishlist";
import Address from "../components/profile/address";
import Info from "../components/profile/InforProfile";
import OrderHistory from "../components/profile/orderHistory";
import ProfileSection from "../components/profile/ProfileSection";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/userSlice";
import { PasswordLoginInput } from "../components/validateInputForm";

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("personalInfo");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user = useSelector((state) => state.user.user, (prev, next) => prev === next);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm] = Form.useForm();

  const dispatch = useDispatch();

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <LoadingOutlined className="text-amber-600 text-3xl" />
        </motion.div>
      </div>
    );
  }

  const showEditInfoModal = () => {
    setIsModalVisible(true);
  };

  const handleSave = async (updatedData) => {
    const fetchUpdateProfile = async (data) => {
      setLoading(true);
      const response = await fetchWithAuth(summaryApi.updateProfile.url, {
        method: summaryApi.updateProfile.method,
        body: JSON.stringify({
          Name: data.name,
          Phone: data.phone
        }),
      });
      const updateRespData = await response.json();
      if (updateRespData.respCode === "000") {
        return updateRespData.data;
      } else {
        console.log("Loi fetchUpdateProfile:", updateRespData);
        return null;
      }
    }

    const respData = await fetchUpdateProfile(updatedData);

    if (respData) {
      dispatch(setUser(respData));
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    try {
      // Validate form fields before proceeding
      const values = await passwordForm.validateFields();
      const { oldPassword, newPassword, confirmPassword } = values;

      // Kiểm tra mật khẩu mới và xác nhận mật khẩu
      if (newPassword === confirmPassword) {
        const changePasswordResponse = await fetchWithAuth(
          summaryApi.updatePasswordWithOldPassword.url,
          {
            method: summaryApi.updatePasswordWithOldPassword.method,
            body: JSON.stringify({
              old_password: oldPassword,
              new_password: newPassword,
              confirm_password: confirmPassword
            }),
          }
        );

        const changePassResult = await changePasswordResponse.json();

        if (changePassResult.respCode === "000") {
          toast.success(changePassResult.data);
          setShowPasswordModal(false);
          passwordForm.resetFields();
        } else {
          toast.error(changePassResult.data || "Đổi mật khẩu thất bại");
        }
      } else {
        toast.error("Xác nhận mật khẩu không đúng");
      }
    } catch (error) {
      if (error.errorFields) {
        error.errorFields.forEach((field) => {
          toast.error(`Trường ${field.name[0]} không hợp lệ`);
        });
      } else {
        toast.error("Đã xảy ra lỗi khi xử lý yêu cầu");
      }
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "personalInfo":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-end mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-4 py-2 rounded-lg shadow-lg
                  hover:from-amber-700 hover:to-amber-900 transition-all duration-300"
                onClick={() => setShowPasswordModal(true)}
              >
                Thay đổi mật khẩu
              </motion.button>
            </div>

            <motion.section 
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <motion.h3 
                    className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent"
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                  >
                    Thông tin tài khoản
                  </motion.h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-amber-600 hover:text-amber-700 flex items-center gap-2"
                    onClick={() => showEditInfoModal()}
                  >
                    <EditOutlined />
                    <span>Chỉnh sửa thông tin</span>
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-sm flex items-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FiUser className="text-2xl text-amber-600 mr-4" />
                    <div>
                      <Text className="text-gray-500 text-sm">Tên</Text>
                      <Text className="block text-lg font-medium">{user.name}</Text>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-sm flex items-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FiMail className="text-2xl text-amber-600 mr-4" />
                    <div>
                      <Text className="text-gray-500 text-sm">Email</Text>
                      <Text className="block text-lg font-medium">{user.email}</Text>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-sm flex items-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FiPhone className="text-2xl text-amber-600 mr-4" />
                    <div>
                      <Text className="text-gray-500 text-sm">Số điện thoại</Text>
                      <Text className="block text-lg font-medium">{user.phone}</Text>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-sm flex items-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FiKey className="text-2xl text-amber-600 mr-4" />
                    <div>
                      <Text className="text-gray-500 text-sm">Mật khẩu</Text>
                      <Text className="block text-lg font-medium">•••••••••••••••••••••</Text>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            <motion.section 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Wishlist />
            </motion.section>

            <Modal
              open={showPasswordModal}
              title={
                <div className="text-xl font-bold bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent">
                  Thay đổi mật khẩu
                </div>
              }
              onCancel={() => setShowPasswordModal(false)}
              onOk={handlePasswordSave}
              okText="Lưu thay đổi"
              cancelText="Hủy"
              okButtonProps={{
                className: "bg-gradient-to-r from-amber-600 to-amber-800 border-none hover:from-amber-700 hover:to-amber-900"
              }}
            >
              <Form form={passwordForm} layout="vertical" className="mt-4">
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="oldPassword"
                  rules={[{ required: true }]}
                >
                  <PasswordLoginInput
                    placeholder="Nhập mật khẩu hiện tại"
                    name="oldPassword"
                    setErrors={(value) => passwordForm.setFields([{ name: "oldPassword" }])}
                    onChange={(e) => passwordForm.setFieldValue("oldPassword", e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
                >
                  <PasswordInput
                    placeholder="Nhập mật khẩu mới"
                    name="newPassword"
                    setErrors={(value) => passwordForm.setFields([{ name: "newPassword" }])}
                    onChange={(e) => passwordForm.setFieldValue("newPassword", e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                      },
                    }),
                  ]}
                >
                  <PasswordLoginInput
                    placeholder="Xác nhận mật khẩu"
                    name="confirmPassword"
                    setErrors={(value) => passwordForm.setFields([{ name: "confirmPassword" }])}
                    onChange={(e) => passwordForm.setFieldValue("confirmPassword", e.target.value)}
                  />
                </Form.Item>
              </Form>
            </Modal>
          </motion.div>
        );
      case "addresses":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Address />
          </motion.div>
        );
      case "communications":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Title level={3} className="bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent">
              Liên hệ và chính sách
            </Title>
            <p className="text-gray-600">Thay đổi cài đặt thông báo của bạn tại đây.</p>
          </motion.div>
        );
      case "orderHistory":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <OrderHistory />
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center text-gray-500 py-8"
          >
            Không tìm thấy nội dung.
          </motion.div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.aside 
          className="lg:col-span-1"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <ProfileSection />
              
              <motion.div 
                className="mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent">
                  Quản lý tài khoản
                </h3>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    { key: "personalInfo", title: "Thông tin", icon: <UserOutlined className="text-xl" /> },
                    { key: "addresses", title: "Địa chỉ", icon: <FiHome className="text-xl" /> },
                  ]}
                  renderItem={(item) => (
                    <motion.div
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <List.Item
                        onClick={() => setSelectedMenu(item.key)}
                        className={`cursor-pointer my-2 p-3 rounded-xl transition-all duration-300 flex items-center justify-between
                          ${selectedMenu === item.key 
                            ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800" 
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={selectedMenu === item.key ? "text-amber-600" : "text-gray-400"}>
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <FiChevronRight className={`transition-transform ${selectedMenu === item.key ? "transform rotate-90" : ""}`} />
                      </List.Item>
                    </motion.div>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent">
                  Đơn hàng
                </h3>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    { key: "orderHistory", title: "Lịch sử mua hàng", icon: <FiGift className="text-xl" /> },
                  ]}
                  renderItem={(item) => (
                    <motion.div
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <List.Item
                        onClick={() => setSelectedMenu(item.key)}
                        className={`cursor-pointer p-3 rounded-xl transition-all duration-300 flex items-center justify-between
                          ${selectedMenu === item.key 
                            ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800" 
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={selectedMenu === item.key ? "text-amber-600" : "text-gray-400"}>
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <FiChevronRight className={`transition-transform ${selectedMenu === item.key ? "transform rotate-90" : ""}`} />
                      </List.Item>
                    </motion.div>
                  )}
                />
              </motion.div>
            </div>
          </div>
        </motion.aside>

        <motion.section 
          className="lg:col-span-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </motion.section>
      </div>

      <Info
        visible={isModalVisible}
        data={user}
        onClose={handleClose}
        onSave={handleSave}
      />
    </motion.div>
  );
};

export default Profile;
