import { Button, message, Modal, Popconfirm, Table } from "antd";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";
import { useState } from "react";
import img1 from "../../../assets/img/empty.jpg";

const OrderTable = ({ orderList , refreshOrderList }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);

  const handleUpdateStatus = (record) => {
    const fetchUpdateStatus = async () => {
      const response = await fetchWithAuth(
        summaryApi.updateOrderStatus.url + record.orderId,
        {
          method: summaryApi.updateOrderStatus.method,
        }
      );

      const result = await response.json();

      if (result.respCode === "000") {
        message.success("cập nhật trạng thái đơn hàng thành công");
        refreshOrderList();
      } else {
        message.error("cập nhật trạng thái đơn hàng thất bại");
        console.log("error cập nhật trạng thái đơn hàng");
      }
    };

    fetchUpdateStatus();
  };

  const handleViewDetail = (record) => {
    setOrderDetail(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const columns = [
    {
      title: "Id",
      dataIndex: "orderId",
      key: "orderId",
      sorter: (a, b) => a.orderId - b.orderId,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Ngày tạo",
      dataIndex: "orderDate",
      key: "orderDate",
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      render: (orderDate) => {
        const dateObj = new Date(orderDate);
        const formatDate = dateObj.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const formatTime = dateObj.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "numeric",
        });

        return `${formatDate} ${formatTime}`;
      },
    },

    {
      title: "Địa chỉ giao hàng",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      render: (shippingAddress) => (
        <div>
          <p>
            <strong>Name:</strong> {shippingAddress.receiverName}
          </p>
          <p>
            <strong>Phone:</strong> {shippingAddress.receiverPhone}
          </p>
          <p>
            <strong>Location:</strong> {shippingAddress.location}
          </p>
        </div>
      ),
    },

    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Tổng đơn hàng",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (total) => `${total}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => {
        let color;
        switch (status) {
          case "Processing":
            color = "orange";
            break;
          case "Processed":
            color = "blue";
            break;
          case "Shipping":
            color = "#FF8C00";
            break;
          case "Completed":
            color = "darkgreen";
            break;
          case "Cancelled":
            color = "red";
            break;
          default:
            color = "black";
        }
        return (
          <span style={{ color: color, fontWeight: "bold" }}>{status}</span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div>
          <Button
            style={{ marginRight: 8 }} // Khoảng cách giữa các nút
            type="default"
            onClick={() => handleViewDetail(record)}
          >
            Xem chi tiết
          </Button>

          <Popconfirm
            title={`Thay đổi trạng thái`}
            onConfirm={() => handleUpdateStatus(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              disabled={record.orderStatus === "Completed" || record.orderStatus === "Cancelled" }
            >
              Thay đổi trạng thái
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  const orderItemsColumns = [
    {
      title: "Id",
      dataIndex: "orderItemId",
      key: "orderItemId",
      sorter: (a, b) => a.orderId - b.orderId,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: () => (
        <img
          src={img1}
          alt="img order item"
          className="w-10 h-10 object-cover rounded"
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Loại",
      dataIndex: "productType",
      key: "productType",
    },
    {
      title: "Số lượng",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={orderList.sort((a,b)=> new Date(b.orderDate ) - new Date(a.orderDate))}
        rowKey="orderId"
        pagination={{ pageSize: 10 , showSizeChanger : false }}
        bordered
      />

      <Modal
        width="50%"
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {orderDetail ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <strong className="w-1/5">ID đơn hàng:</strong>
              <p className="w-4/5">{orderDetail.orderId}</p>
            </div>
            <div className="flex justify-between items-center">
              <strong className="w-1/5">Trạng thái:</strong>
              <p className="w-4/5">{orderDetail.orderStatus} </p>
            </div>
            <div className="flex justify-between items-center">
              <strong className="w-1/5">Tên người dùng:</strong>

              <p className="w-4/5">
                {" "}
                {orderDetail.shippingAddress.receiverName}{" "}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <strong className="w-1/5">Địa chỉ giao hàng:</strong>

              <p className="w-4/5"> {orderDetail.shippingAddress.location} </p>
            </div>
            <div className="flex justify-between items-center">
              <strong className="w-1/5">Phí ship:</strong>

              <p className="w-4/5"> {"10000 đ"} </p>
            </div>
            <div className="flex justify-between items-center">
              <strong className="w-1/5">Tổng số lượng:</strong>
              <p className="w-4/5">{orderDetail.total} đ </p>
            </div>

            <div>
              <p className="mb-8 font-bold">Danh sách sản phẩm:</p>
              {orderDetail.orderItems.length > 0 ? (
                <Table
                  columns={orderItemsColumns}
                  dataSource={orderDetail.orderItems}
                  rowKey="orderItemId"
                  pagination={false}
                  bordered
                />
              ) : (
                <li>Chưa có sản phẩm nào</li>
              )}
            </div>
          </div>
        ) : (
          <p>Đang tải...</p>
        )}
      </Modal>
    </div>
  );
};

export default OrderTable;
