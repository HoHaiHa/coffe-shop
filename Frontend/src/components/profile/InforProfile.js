import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";

const Info = ({ visible, data, onClose, onSave }) => {
  const [form] = Form.useForm();


  useEffect(() => {
    if (data) {
      const defaultData = {
        name: data.name || "",
        phone: data.phone || "",
      };
      form.setFieldsValue(defaultData);
    }
  }, [data, form]);

  const handleSave = () => {
    
    form.validateFields()
      .then((values) => {
        onSave(values);
        onClose();
      })
      .catch (() => {
        message.info("Bạn phải nhập đầy đủ thông tin ")
        return;
      })
      
  };

  

  return (
    <>
      <Modal
        open={visible}
        title="Chỉnh sửa thông tin"
        onCancel={onClose}
        onOk={handleSave}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên"
            name="name"
            rules={[
              { required: true, message: "Hãy nhập tên của bạn" },
            ]}
          >
            <Input placeholder="Tên đầy đủ" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Please enter your phone number" },
              {
                pattern: /^\+?[1-9]\d{7,14}$/,
                message: "Số điện thoại không đúng định dạng",
              },
            ]}
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>

        </Form>
      </Modal>

      
    </>
  );
};

export default Info;
