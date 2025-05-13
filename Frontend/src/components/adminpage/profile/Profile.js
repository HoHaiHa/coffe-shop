import React, { useState } from "react";
import { Typography, List, Spin, Form, Button, Modal } from "antd";
import { UserOutlined, LoadingOutlined, EditOutlined } from "@ant-design/icons";
import {
  FiMail,
  FiPhone,
  FiKey,
  FiUser,
  FiHome
} from "react-icons/fi";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";
import { setUser } from "../../../store/userSlice";
import PasswordInput from "../../validateInputForm/PasswordInput";
import ProfileSection from "../../profile/ProfileSection";
import Info from "../../profile/InforProfile";
import ShippingAddress from "../../profile/address";

const { Title, Text } = Typography;

const AdminProfile = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("personalInfo");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user = useSelector((state) => state.user.user, (prev, next) => prev === next);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm] = Form.useForm();

  if (loading || !user) {
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    return (
      <>
        <div className="flex justify-center h-screen mt-3">
          <Spin indicator={antIcon} />
        </div>
      </>
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
      window.location.reload();
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
          <div>
            <div >
              <Button
                type="primary"
                className="mr-6 mt-2 float-right"
                onClick={() => setShowPasswordModal(true)}
              >
                Đổi mật khẩu
              </Button>
            </div>
            {/* Right Content */}
            <section className="lg:col-span-3 space-y-6">
              {/* Account Info */}

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex mt-4 items-center justify-between">
                  <Title level={3}>Thông tin tài khoản</Title>
                  <Button type="link" icon={<EditOutlined />} className="text-gray-500"
                    onClick={() => showEditInfoModal()}
                  >
                    Chỉnh sửa
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-gray-100 rounded-lg flex items-center">
                    <FiUser className="mr-4 text-xl" />
                    <div>
                      <Text className="block">Tên</Text>
                      <Text>{user.name}</Text>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg flex items-center">
                    <FiMail className="mr-4 text-xl" />
                    <div>
                      <Text className="block">Email</Text>
                      <Text>{user.email}</Text>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg flex items-center">
                    <FiPhone className="mr-4 text-xl" />
                    <div>
                      <Text className="block">Số điện thoại</Text>
                      <Text>{user.phone}</Text>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-100 rounded-lg flex items-center">
                    <FiKey className="mr-4 text-xl" />
                    <div>
                      <Text className="block">Mật khẩu</Text>
                      <Text>•••••••••••••••••••••</Text>
                    </div>
                  </div>

                </div>
              </div>
            </section>
            {/* Modal for changing password */}
            <Modal
              open={showPasswordModal}
              title="Change Password"
              onCancel={() => setShowPasswordModal(false)}
              onOk={handlePasswordSave}
              okText="Save"
            >
              <Form form={passwordForm} layout="vertical">
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="oldPassword"
                  rules={[
                    { required: true},
                  ]}
                >
                  <PasswordInput
                    placeholder="Nhập mật khẩu hiện tại"
                    name="oldPassword"
                    setErrors={(value) => passwordForm.setFields([{ name: "oldPassword" }])}
                    onChange={(e) => passwordForm.setFieldValue("oldPassword", e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  ]}
                >
                  <PasswordInput
                    placeholder="Nhập mật khẩu mới"
                    name="newPassword"
                    setErrors={(value) => passwordForm.setFields([{ name: "newPassword"}])}
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
                  <PasswordInput
                    placeholder="Xác nhận mật khẩu"
                    name="confirmPassword"
                    setErrors={(value) => passwordForm.setFields([{ name: "confirmPassword" }])}
                    onChange={(e) => passwordForm.setFieldValue("confirmPassword", e.target.value)}
                  />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        );
      case "addresses":
        return (
          <>
            <ShippingAddress />
          </>
        );
      case "communications":
        return (
          <div>
            <Title level={3}>Liên lạc và quyền riêng tư</Title>
            <p>Điều chỉnh tùy chọn liên lạc của bạn tại đây.</p>
          </div>
        );
      default:
        return <div>Nội dung không tìm thấy</div>;
    }
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
        <ProfileSection />
        <Title level={5}>Quản lý tài khoản</Title>
        <List
          itemLayout="horizontal"
          dataSource={[
            { key: "personalInfo", title: "Thông tin người dùng", icon: <UserOutlined className="text-2xl " /> },
            { key: "addresses", title: "Địa chỉ", icon: <FiHome className="text-2xl " /> },

          ]}
          renderItem={(item) => (
            <List.Item
              onClick={() => setSelectedMenu(item.key)}
              className={`cursor-pointer my-2 p-2 rounded-lg transition-all duration-300 ${selectedMenu === item.key ? "bg-gray-200" : "bg-white"}`}
            >
              <List.Item.Meta avatar={<div className="pl-2">{item.icon}</div>} title={item.title} />
            </List.Item>
          )}
          className="mb-6"
        />
      </aside>


      {/* Right Content */}
      <section className="lg:col-span-3 space-y-6 lg:ml-6 rounded-lg">
        {renderContent()}
      </section>
      <Info
        visible={isModalVisible}
        data={user}
        onClose={handleClose}
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminProfile;
