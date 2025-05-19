import React, { useEffect, useState, useCallback } from "react";
import { Button, Table, Tag, Spin, message, Popconfirm } from "antd";
import { motion } from "framer-motion";
import fetchWithAuth from "../../helps/fetchWithAuth";
import summaryApi from "../../common";
import { LoadingOutlined } from "@ant-design/icons";
import { FiPackage, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import OrderDetails from "./OrderDetails";

const OrderHistory = React.memo(() => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetchWithAuth(summaryApi.getUserOrders.url, {
        method: summaryApi.getUserOrders.method,
      });
      const response = await resp.json();
      if (response.respCode === "000") {
        setOrders(response.data);
      } else {
        console.error("Error fetching orders:", response);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = (orderId, status) => {
    setOrders((prevOrders) =>
      prevOrders.map((item) =>
        item.orderId === orderId ? { ...item, orderStatus: status } : item
      )
    );
  };

  const handleCancelOrder = async (record) => {
    try {
      const response = await fetchWithAuth(
        summaryApi.cancelOrder.url + record.orderId,
        {
          method: summaryApi.cancelOrder.method,
        }
      );
      const result = await response.json();
      if (result.respCode === "000") {
        message.success("Đơn hàng đã được hủy thành công");
        updateOrderStatus(record.orderId, "Cancelled");
      } else {
        message.error(result.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      message.error("Đã xảy ra lỗi khi hủy đơn hàng");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <FiCheckCircle className="text-green-500" />;
      case "Cancelled":
        return <FiXCircle className="text-red-500" />;
      case "Processing":
        return <FiClock className="text-blue-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      case "Processing":
        return "processing";
      default:
        return "default";
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
      title: "Ngày đặt hàng",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => (
        <span className="text-gray-700">
          {new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => (
        <Tag
          icon={getStatusIcon(status)}
          color={getStatusColor(status)}
          className="px-3 py-1 flex items-center space-x-1 w-fit"
        >
          <span>{status}</span>
        </Tag>
      ),
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => (
        <Tag color="blue" className="px-3 py-1">
          {method}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="primary"
            onClick={() => handleViewDetails(record.orderId)}
            className="bg-gradient-to-r from-amber-500 to-amber-700 border-none hover:from-amber-600 hover:to-amber-800"
          >
            Xem chi tiết
          </Button>

          {record.orderStatus === "Processing" && (
            <Popconfirm
              title="Hủy đơn hàng"
              description="Bạn có chắc chắn muốn hủy đơn hàng này?"
              onConfirm={() => handleCancelOrder(record)}
              okText="Hủy đơn"
              cancelText="Đóng"
              okButtonProps={{
                className: "bg-red-500 hover:bg-red-600",
              }}
            >
              <Button danger>Hủy đơn hàng</Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Lịch sử đơn hàng</h2>
        <p className="text-gray-500 mt-1">Theo dõi và quản lý các đơn hàng của bạn</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingOutlined style={{ fontSize: 48 }} className="text-amber-500" spin />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="orderId"
            pagination={{
              pageSize: 10,
              position: ["bottomCenter"],
              className: "custom-pagination",
            }}
            className="custom-table"
          />
        </div>
      )}

      {selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      <style jsx global>{`
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
        
        .custom-pagination .ant-pagination-item {
          border-radius: 9999px;
          border: none;
          background: #f3f4f6;
        }
        
        .custom-pagination .ant-pagination-item-active {
          background: linear-gradient(to right, #f59e0b, #b45309);
        }
        
        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }
        
        .custom-pagination .ant-pagination-prev button,
        .custom-pagination .ant-pagination-next button {
          border-radius: 9999px;
          border: none;
          background: #f3f4f6;
        }
      `}</style>
    </motion.div>
  );
});

export default OrderHistory;
