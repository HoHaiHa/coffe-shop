import React, { useEffect, useState } from "react";
import {
  Descriptions,
  Table,
  Modal,
  Button,
  Rate,
  Input,
  message,
  Tag,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import fetchWithAuth from "../../helps/fetchWithAuth";
import summaryApi from "../../common";
import image1 from "../../assets/img/empty.jpg";
import { FiPackage, FiMapPin, FiPhone, FiUser, FiDollarSign } from "react-icons/fi";

const OrderDetails = ({ orderId, onClose }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const resp = await fetchWithAuth(
          `${summaryApi.getOrderDetails.url}/${orderId}`,
          { method: "GET" }
        );
        const data = await resp.json();
        if (data.respCode === "000") {
          setOrderDetail(data.data);
        } else {
          console.error("Failed to fetch order details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleRateProduct = (record) => {
    setCurrentProduct(record);
    setRating(0);
    setComment("");
    setIsReviewModalVisible(true);
  };

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      message.error("Vui lòng đánh giá sản phẩm trước khi gửi nhận xét");
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth(summaryApi.addReview.url, {
        method: summaryApi.addReview.method,
        body: JSON.stringify({
          OrderItemId: currentProduct.orderItemId,
          Rating: rating,
          Comment: comment,
        }),
      });
      const data = await response.json();
      if (data.respCode === "000") {
        message.success("Đánh giá sản phẩm thành công");

        setOrderDetail((prevOrderDetail) => {
          const updatedOrderItems = prevOrderDetail.orderItems.map((item) =>
            item.orderItemId === currentProduct.orderItemId
              ? { ...item, isReviewed: true }
              : item
          );
          return { ...prevOrderDetail, orderItems: updatedOrderItems };
        });

        setIsReviewModalVisible(false);
      } else {
        message.error("Có lỗi khi gửi đánh giá");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error("Có lỗi khi gửi đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => (
        <span className="text-gray-600">{index + 1}</span>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <img
            src={record.productImage || image1}
            alt={record.productName}
            className="w-12 h-12 rounded-lg object-cover border border-gray-100"
          />
          <div>
            <div className="font-medium text-gray-800">{record.productName}</div>
            <div className="text-sm text-gray-500">{record.productType}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="text-gray-700">{amount}</span>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="text-gray-700">{price.toLocaleString()}đ</span>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      render: (discount) => (
        <span className="text-red-500">-{discount}%</span>
      ),
    },
    {
      title: "Đánh giá",
      key: "review",
      render: (_, record) =>
        orderDetail.orderStatus === "Completed" ? (
          record.isReviewed ? (
            <Tag color="success" className="px-3 py-1 flex items-center space-x-1 w-fit">
              <span>Đã đánh giá</span>
            </Tag>
          ) : (
            <Button
              type="primary"
              onClick={() => handleRateProduct(record)}
              className="bg-gradient-to-r from-amber-500 to-amber-700 border-none hover:from-amber-600 hover:to-amber-800"
            >
              Đánh giá
            </Button>
          )
        ) : (
          <Tag color="default" className="px-3 py-1">
            Chưa thể đánh giá
          </Tag>
        ),
    },
  ];

  console.log(orderDetail)
  return (
    <Modal
      title={
        <div className="text-xl font-semibold text-gray-800">
          Chi tiết đơn hàng #{orderId}
        </div>
      }
      open={!!orderId}
      onCancel={onClose}
      footer={[
        <Button 
          key="close" 
          onClick={onClose}
          className="px-6"
        >
          Đóng
        </Button>,
      ]}
      width={900}
      centered
      className="custom-modal"
    >
      <AnimatePresence>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : orderDetail ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center space-x-2">
                  <FiUser className="text-amber-500" />
                  <span>Thông tin người nhận</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="flex items-center space-x-2">
                    <span className="text-gray-500">Họ tên:</span>
                    <span className="font-medium">{orderDetail.shippingAddress.receiverName}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span className="font-medium">{orderDetail.shippingAddress.receiverPhone}</span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span className="text-gray-500">Địa chỉ:</span>
                    <span className="font-medium">{orderDetail.shippingAddress.location}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center space-x-2">
                  <FiPackage className="text-amber-500" />
                  <span>Thông tin đơn hàng</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="flex items-center space-x-2">
                    <span className="text-gray-500">Trạng thái:</span>
                    <Tag color={orderDetail.orderStatus === "Completed" ? "success" : "processing"}>
                      {orderDetail.orderStatus}
                    </Tag>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-gray-500">Phương thức thanh toán:</span>
                    <Tag color="blue">{orderDetail.paymentMethod}</Tag>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-gray-500">Tổng tiền:</span>
                    <span className="font-medium text-amber-600">
                      {orderDetail.total?.toLocaleString()}đ
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center space-x-2">
                <FiDollarSign className="text-amber-500" />
                <span>Chi tiết sản phẩm</span>
              </h3>
              <Table
                columns={columns}
                dataSource={orderDetail.orderItems}
                rowKey="orderItemId"
                pagination={false}
                className="custom-table"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal
        title={
          <div className="text-lg font-semibold text-gray-800">
            Đánh giá sản phẩm
          </div>
        }
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsReviewModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmitReview}
            loading={loading}
            className="bg-gradient-to-r from-amber-500 to-amber-700 border-none hover:from-amber-600 hover:to-amber-800"
          >
            Gửi đánh giá
          </Button>,
        ]}
        width={500}
        centered
        className="custom-modal"
      >
        <div className="space-y-6 py-4">
          <div className="text-center">
            <h4 className="text-base font-medium text-gray-700 mb-2">Chất lượng sản phẩm</h4>
            <Rate
              value={rating}
              onChange={handleRatingChange}
              className="text-2xl text-amber-500"
            />
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-700 mb-2">Nhận xét của bạn</h4>
            <Input.TextArea
              rows={4}
              value={comment}
              onChange={handleCommentChange}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              className="resize-none"
            />
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-modal .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
        }
        
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 12px;
        }
        
        .custom-modal .ant-modal-body {
          padding: 0 24px 24px;
        }
        
        .custom-modal .ant-modal-footer {
          border-top: none;
          padding: 0 24px 24px;
        }
        
        .custom-table .ant-table {
          background: transparent;
        }
        
        .custom-table .ant-table-thead > tr > th {
          background: #f8fafc;
          border-bottom: none;
          font-weight: 600;
          color: #1f2937;
        }
        
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #fef3c7 !important;
        }
      `}</style>
    </Modal>
  );
};

export default OrderDetails;
