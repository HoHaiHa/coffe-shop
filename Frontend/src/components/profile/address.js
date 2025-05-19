import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Modal,
  Input,
  message,
  Popconfirm,
  Pagination,
  Radio,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import summaryApi from "../../common";
import { useDispatch, useSelector } from "react-redux";
import fetchWithAuth from "../../helps/fetchWithAuth";
import {
  addAddress,
  deleteAddress,
  setAddresses,
  toggleSelectedAddress,
  updateAddress,
} from "../../store/shippingAddressSlice ";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiPhone, FiMapPin } from "react-icons/fi";
import { FiAlertCircle } from "react-icons/fi";

const ShippingAddress = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state?.user?.user);
  const addresses = useSelector((state) => state?.shippingAddresses?.addresses);
  const selectedAddressId = addresses.find((addr) => addr.selected)?.id || null;
  const dispatch = useDispatch();

  const validatePhone = (value) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value);
  };
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize] = useState(2);
  const currentAddresses = useMemo(() => {
    const indexOfLastAddress = currentPage * pageSize;
    const indexOfFirstAddress = indexOfLastAddress - pageSize;
    return addresses.slice(indexOfFirstAddress, indexOfLastAddress);
  }, [currentPage, pageSize, addresses]);

  const location = useLocation();
  const isProfilePage = location.pathname === "/profile";

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(summaryApi.getAddressByUser.url, {
          method: summaryApi.getAddressByUser.method,
        });
        const responseData = await response.json();

        if (responseData.respCode === "000" && responseData.data) {
          const addresses = responseData.data;
          dispatch(setAddresses(addresses));
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [dispatch]);

  const handleAddingAddress = () => {
    setEditingAddress({});
    setErrors({});
    setIsModalVisible(true);
  };

  const showModal = (address) => {
    setEditingAddress(address);
    setErrors({});
    setIsModalVisible(true);
  };

  const handleSaveAddress = async () => {
    const { receiverName, receiverPhone, location } = editingAddress;
    const newErrors = {};

    if (!receiverName) newErrors.receiverName = "Người nhận không được để trống";
    if (!receiverPhone) newErrors.receiverPhone = "Số điện thoại người nhận không được để trống";
    if (!location) newErrors.location = "Ví trí không được để trống";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const fetchUpdateAddress = async (requestMethod) => {
        setLoading(true);
        try {
          const response = await fetchWithAuth(
            summaryApi.updateShippingAddress.url,
            {
              method: requestMethod,
              body: JSON.stringify({
                id: editingAddress.id,
                receiver_name: editingAddress.receiverName,
                receiver_phone: editingAddress.receiverPhone,
                location: editingAddress.location,
                user_id: user.id,
                status: "ACTIVE",
              }),
            }
          );
          const responseData = await response.json();
          if (responseData.respCode === "000") {
            return responseData.data;
          } else {
            message.error("Xử lý địa chỉ thất bại.", responseData);
          }
        } catch (error) {
          message.error("Có lỗi khi xử lý địa chỉ:", error);
        } finally {
          setLoading(false);
        }
      };

      if (editingAddress.id) {
        const updatedAddress = await fetchUpdateAddress(
          summaryApi.updateShippingAddress.method
        );
        if (updatedAddress) {
          dispatch(updateAddress(updatedAddress));
          message.success("Cập nhật địa chỉ thành công!");
        }
      } else {
        const newAddress = await fetchUpdateAddress(
          summaryApi.addShippingAddress.method
        );
        if (newAddress) {
          dispatch(addAddress(newAddress));
          message.success("Thêm địa chỉ thành công!");
        }
      }

      setIsModalVisible(false);
      setEditingAddress({});
      setErrors({});
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      message.error("Lưu địa chỉ thất bại");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingAddress({});
    setErrors({});
  };

  const handleDeleteAddress = (id) => {
    const fetchDeleteAddress = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          summaryApi.deleteShippingAddress.url + id,
          {
            method: summaryApi.deleteShippingAddress.method,
          }
        );
        const responseData = await response.json();
        if (responseData.respCode === "000") {
          const totalPages = Math.ceil(addAddress.length / pageSize);
          if (currentPage > totalPages) {
            setCurrentPage(Math.max(1, totalPages));
          }
          dispatch(deleteAddress(responseData.data));
          message.success("Xóa địa chỉ thành công!");
        } else {
          console.error("Failed to process address:", responseData);
        }
      } catch (error) {
        console.error("Error deleting address:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeleteAddress();
  };

  const handleSelectAddress = (id) => {
    dispatch(toggleSelectedAddress(id));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Danh sách địa chỉ</h2>
            <p className="text-sm text-gray-500 mt-1">
              {addresses.length !== 0
                ? isProfilePage
                  ? "Quản lý địa chỉ giao hàng của bạn"
                  : "Chọn địa chỉ để nhận sản phẩm"
                : "Bạn chưa có địa chỉ nào, hãy thêm địa chỉ mới"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-full
                     hover:from-amber-600 hover:to-amber-800 transition-all duration-300
                     shadow-md hover:shadow-lg flex items-center space-x-2"
            onClick={handleAddingAddress}
          >
            <PlusOutlined />
            <span>Thêm địa chỉ</span>
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingOutlined style={{ fontSize: 48 }} className="text-amber-500" spin />
          </div>
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {currentAddresses.map((address) => (
              <motion.div
                key={address.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
                className="p-6 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300
                         bg-gradient-to-r from-amber-50/50 to-transparent"
              >
                <div className="flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0">
                  <div className="flex-1">
                    {!isProfilePage && (
                      <Radio.Group
                        onChange={() => handleSelectAddress(address.id)}
                        value={selectedAddressId}
                        className="mb-4"
                      >
                        <Radio value={address.id} />
                      </Radio.Group>
                    )}
                    <div className="space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                        <p className="flex items-center space-x-2">
                          <span className="text-gray-500">Người nhận:</span>
                          <span className="font-medium">{address.receiverName}</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <span className="text-gray-500">Điện thoại:</span>
                          <span className="font-medium">{address.receiverPhone}</span>
                        </p>
                      </div>
                      <p className="flex items-start space-x-2">
                        <span className="text-gray-500">Địa chỉ:</span>
                        <span className="font-medium flex-1">{address.location}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 self-end md:self-start">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => showModal(address)}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      Sửa
                    </Button>
                    <Popconfirm
                      title="Xóa địa chỉ này?"
                      description="Bạn có chắc chắn muốn xóa địa chỉ này?"
                      onConfirm={() => handleDeleteAddress(address.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{
                        className: 'bg-red-500 hover:bg-red-600'
                      }}
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {addresses.length > pageSize && (
          <div className="mt-6 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={addresses.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              className="custom-pagination"
            />
          </div>
        )}
      </motion.div>

      <Modal
        title={
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent flex items-center gap-3"
          >
            <span>{editingAddress.id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</span>
          </motion.div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <div className="flex flex_row">
            <Button 
            key="back" 
            onClick={handleCancel}
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
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleSaveAddress}
              className="px-6 bg-gradient-to-r from-amber-500 to-amber-700 border-none hover:from-amber-600 hover:to-amber-800 
                       shadow-md hover:shadow-lg transition-all duration-300"
            >
              {editingAddress.id ? "Lưu thay đổi" : "Thêm địa chỉ"}
            </Button>
          </motion.div>
          </div>
        ]}
        className="custom-modal"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                <FiUser className="text-amber-500" />
                Người nhận
              </label>
              <Input
                placeholder="Nhập tên người nhận"
                value={editingAddress.receiverName}
                onChange={(e) =>
                  setEditingAddress({
                    ...editingAddress,
                    receiverName: e.target.value,
                  })
                }
                className={`rounded-xl border-2 ${
                  errors.receiverName 
                    ? 'border-red-200 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-100 focus:border-amber-500 focus:ring-amber-500/20'
                } py-2 px-4 transition-all duration-300 hover:border-amber-200`}
              />
              {errors.receiverName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 flex items-center gap-1"
                >
                  <FiAlertCircle />
                  {errors.receiverName}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                <FiPhone className="text-amber-500" />
                Số điện thoại
              </label>
              <Input
                placeholder="Nhập số điện thoại"
                value={editingAddress.receiverPhone}
                onChange={(e) =>
                  setEditingAddress({
                    ...editingAddress,
                    receiverPhone: e.target.value,
                  })
                }
                className={`rounded-xl border-2 ${
                  errors.receiverPhone 
                    ? 'border-red-200 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-100 focus:border-amber-500 focus:ring-amber-500/20'
                } py-2 px-4 transition-all duration-300 hover:border-amber-200`}
              />
              {errors.receiverPhone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 flex items-center gap-1"
                >
                  <FiAlertCircle />
                  {errors.receiverPhone}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                <FiMapPin className="text-amber-500" />
                Địa chỉ
              </label>
              <Input.TextArea
                placeholder="Nhập địa chỉ chi tiết"
                value={editingAddress.location}
                onChange={(e) =>
                  setEditingAddress({
                    ...editingAddress,
                    location: e.target.value,
                  })
                }
                className={`rounded-xl border-2 ${
                  errors.location 
                    ? 'border-red-200 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-100 focus:border-amber-500 focus:ring-amber-500/20'
                } py-2 px-4 transition-all duration-300 hover:border-amber-200`}
                rows={4}
              />
              {errors.location && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 flex items-center gap-1"
                >
                  <FiAlertCircle />
                  {errors.location}
                </motion.p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </Modal>

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
        .custom-modal .ant-input-focused,
        .custom-modal .ant-input-textarea-focused {
          border-color: #f59e0b;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
        }

        .custom-modal .ant-input:hover,
        .custom-modal .ant-input-textarea:hover {
          border-color: #fbbf24;
        }

        .custom-modal .ant-input-textarea {
          resize: none;
        }
      `}</style>
    </div>
  );
};

export default ShippingAddress;
