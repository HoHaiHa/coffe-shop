import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiPhone, FiCheck, FiX } from "react-icons/fi";

const Info = ({ visible, data, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSave(values);
      message.success({
        content: "Cập nhật thông tin thành công!",
        className: "custom-message-success",
        icon: <FiCheck className="text-green-500 text-xl" />
      });
      onClose();
    } catch (error) {
      console.error("Validation failed:", error);
      message.error({
        content: "Có lỗi xảy ra. Vui lòng thử lại!",
        className: "custom-message-error",
        icon: <FiX className="text-red-500 text-xl" />
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <Modal
          title={
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent"
            >
              Chỉnh sửa thông tin cá nhân
            </motion.div>
          }
          open={visible}
          onCancel={onClose}
          footer={[
            <div className="flex flex-row">
              <Button
                key="back"
                onClick={onClose}
                className="px-6 hover:bg-gray-50 transition-all duration-300"
              >
                Hủy
              </Button>,
              <motion.div
                key="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleSubmit}
                  className="px-6 bg-gradient-to-r from-amber-500 to-amber-700 border-none hover:from-amber-600 hover:to-amber-800 
                         shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Lưu thay đổi
                </Button>
              </motion.div>,
            </div>
          ]}
          className="custom-modal"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: data?.name || "",
                phone: data?.phone || "",
              }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Form.Item
                  name="name"
                  label={
                    <span className="text-gray-700 flex items-center space-x-2 text-base">
                      <FiUser className="text-amber-500" />
                      <span>Họ và tên</span>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập họ và tên",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập họ và tên của bạn"
                    className="rounded-xl border-2 border-gray-100 focus:border-amber-500 focus:ring-amber-500/20
                             py-2 px-4 transition-all duration-300 hover:border-amber-200"
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Form.Item
                  name="phone"
                  label={
                    <span className="text-gray-700 flex items-center space-x-2 text-base">
                      <FiPhone className="text-amber-500" />
                      <span>Số điện thoại</span>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại",
                    },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập số điện thoại của bạn"
                    className="rounded-xl border-2 border-gray-100 focus:border-amber-500 focus:ring-amber-500/20
                             py-2 px-4 transition-all duration-300 hover:border-amber-200"
                  />
                </Form.Item>
              </motion.div>
            </Form>
          </motion.div>

          <style jsx global>{`
            .custom-modal .ant-modal-content {
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
              border: 1px solid rgba(245, 158, 11, 0.1);
            }
            
            .custom-modal .ant-modal-header {
              border-bottom: 1px solid rgba(245, 158, 11, 0.1);
              padding: 24px 24px 12px;
              background: linear-gradient(to bottom, rgba(245, 158, 11, 0.05), transparent);
            }
            
            .custom-modal .ant-modal-body {
              padding: 24px;
              background: white;
            }
            
            .custom-modal .ant-modal-footer {
              border-top: 1px solid rgba(245, 158, 11, 0.1);
              padding: 12px 24px;
              background: linear-gradient(to top, rgba(245, 158, 11, 0.05), transparent);
            }
            
            .custom-modal .ant-input:focus,
            .custom-modal .ant-input-focused {
              border-color: #f59e0b;
              box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
            }
            
            .custom-modal .ant-form-item-label > label {
              font-weight: 500;
              font-size: 0.95rem;
            }

            .custom-modal .ant-form-item-explain-error {
              font-size: 0.875rem;
              color: #ef4444;
              margin-top: 4px;
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .custom-message-success,
            .custom-message-error {
              border-radius: 12px;
              padding: 12px 16px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .custom-message-success {
              background: linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
              border: 1px solid rgba(34, 197, 94, 0.2);
            }

            .custom-message-error {
              background: linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
              border: 1px solid rgba(239, 68, 68, 0.2);
            }
          `}</style>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default Info;
