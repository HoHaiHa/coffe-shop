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
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Danh sách địa chỉ</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="mb-4">
          {addresses.length !== 0 ? (
            isProfilePage ? (
              <p className="text-sm text-gray-600">
                Quản lý địa chỉ!
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Chọn địa chỉ để nhận sản phẩm
              </p>
            )
          ) : (
            <p> Bạn có muốn thêm địa chỉ mới?</p>
          )}
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddingAddress}
          className="w-full sm:w-auto"
        >
          Thêm địa chỉ nhận hàng
        </Button>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center items-center ">
            <LoadingOutlined style={{ fontSize: 48, color: "red" }} spin />
          </div>
        )}
        {currentAddresses.map((address) => (
          <div
            key={address.id}
            className={`p-4 border rounded-md flex flex-col md:flex-row justify-between items-start `}
          >
             <Radio.Group
                onChange={() => handleSelectAddress(address.id)}
                value={selectedAddressId}
                className="self-start md:self-center"
                style={{ display: isProfilePage ? "none" : "block" }}
              >
                <Radio value={address.id} />
              </Radio.Group>
            <div className="flex-1">
             
              <div className="flex flex-col lg:flex-row items-baseline justify-between">
                <p className="lg:w-[60%] w-full">
                  <span className="font-semibold">Tên: </span>
                  {address.receiverName}
                </p>

                <p className="lg:w-[40%] w-full">
                  <span className="font-semibold">Số điện thoại: </span>
                  {address.receiverPhone}
                </p>
              </div>

              <p>
                <span className="font-semibold">Địa chỉ: </span>
                {address.location}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                type="link"
                icon={<EditOutlined />}
                className="text-gray-500"
                onClick={() => showModal(address)}
              >
                Chỉnh sửa
              </Button>
              <Popconfirm
                title="Xóa địa chỉ này?"
                onConfirm={() => handleDeleteAddress(address.id)}
                okText="OK"
                cancelText="Hủy"
              >
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  className="text-red-500"
                >
                  Xóa
                </Button>
              </Popconfirm>
            </div>
          </div>
        ))}

        {addresses.length > pageSize && (
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={addresses.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        )}
      </div>

      <Modal
        title={editingAddress?.id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        open={isModalVisible}
        onOk={handleSaveAddress}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveAddress}>
            OK
          </Button>,
        ]}
      >
        <h3 className="mt-3 font-semibold ">
          Tên người nhận: <span className="text-red-500">*</span>{" "}
        </h3>
        <Input
          maxLength={60}
          required
          placeholder="Tên người nhận"
          value={editingAddress?.receiverName || ""}
          onChange={(e) => {
            const value = e.target.value;
            setErrors((prevErrors) => ({
              ...prevErrors,
              receiverName: "",
            }));
            setEditingAddress((prev) => ({
              ...prev,
              receiverName: value,
            }));
          }}
          onBlur={(e) => {
            if (e.target.value.trim().length === 0) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                receiverName: "Tên người nhận không được bỏ trống",
              }));
            }
          }}
          className={`${errors.receiverName ? "border-red-500" : ""}`}
        />
        {errors.receiverName && (
          <p className="text-red-500 text-sm">{errors.receiverName}</p>
        )}

        <h3 className="mt-3 font-semibold ">
          Số điện thoại người nhận: <span className="text-red-500">*</span>{" "}
        </h3>
        <Input
          maxLength={12}
          required
          placeholder="Số điện thoại người nhận "
          value={editingAddress?.receiverPhone || ""}
          onChange={(e) => {
            const value = e.target.value;
            setErrors((prevErrors) => ({
              ...prevErrors,
              receiverPhone: "",
            }));
            setEditingAddress((prev) => ({ ...prev, receiverPhone: value }));
          }}
          onBlur={(e) => {
            if (!validatePhone(e.target.value)) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                receiverPhone: "Nhập đúng định dạng số điện thoại",
              }));
            } else {
              setErrors((prevErrors) => ({
                ...prevErrors,
                receiverPhone: "",
              }));
            }
          }}
          className={` ${errors.receiverPhone ? "border-red-500" : ""}`}
        />
        {errors.receiverPhone && (
          <p className="text-red-500 text-sm">{errors.receiverPhone}</p>
        )}

        <h3 className="mt-3 font-semibold ">
          Địa chỉ: <span className="text-red-500">*</span>{" "}
        </h3>
        <Input.TextArea
          maxLength={100}
          placeholder="Địa chỉ(Khu vực và đường)"
          value={editingAddress?.location || ""}
          onChange={(e) => {
            const value = e.target.value;
            setErrors((prevErrors) => ({
              ...prevErrors,
              location: "",
            }));
            setEditingAddress((prev) => ({ ...prev, location: value }));
          }}
          onBlur={(e) => {
            if (e.target.value.trim().length === 0) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                location: "Vị trí không được để trống",
              }));
            }
          }}
          className={` ${errors.location ? "border-red-500" : ""}`}
          style={{ maxHeight: "100px", overflowY: "auto" }}
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location}</p>
        )}
      </Modal>
    </div>
  );
};

export default ShippingAddress;
