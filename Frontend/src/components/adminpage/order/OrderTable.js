import { Button, message, Modal, Popconfirm, Table, Space, Input, Select, Tag, Tooltip, DatePicker, Statistic, Card, Row, Col } from "antd";
import { SearchOutlined, FileExcelOutlined, FilterOutlined } from '@ant-design/icons';
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";
import { useState, useEffect } from "react";
import img1 from "../../../assets/img/empty.jpg";
import * as XLSX from 'xlsx';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderTable = ({ orderList, refreshOrderList }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    processing: 0,
    processed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    calculateOrderStats();
  }, [orderList]);

  const calculateOrderStats = () => {
    const stats = orderList.reduce((acc, order) => {
      acc.total++;
      acc[order.orderStatus.toLowerCase()]++;
      return acc;
    }, {
      total: 0,
      processing: 0,
      processed: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0
    });
    setOrderStats(stats);
  };

  const handleUpdateStatus = async (record) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        summaryApi.updateOrderStatus.url + record.orderId,
        {
          method: summaryApi.updateOrderStatus.method,
        }
      );

      const result = await response.json();

      if (result.respCode === "000") {
        message.success("Cập nhật trạng thái đơn hàng thành công");
        refreshOrderList();
        // TODO: Gửi email thông báo cho khách hàng
      } else {
        message.error("Cập nhật trạng thái đơn hàng thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (record) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        summaryApi.cancelOrder.url + record.orderId,
        {
          method: summaryApi.cancelOrder.method,
        }
      );

      const result = await response.json();

      if (result.respCode === "000") {
        message.success("Hủy đơn hàng thành công");
        refreshOrderList();
        // TODO: Gửi email thông báo cho khách hàng
      } else {
        message.error("Hủy đơn hàng thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi hủy đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = orderList.map(order => ({
      'ID': order.orderId,
      'Ngày đặt': moment(order.orderDate).format('DD/MM/YYYY HH:mm:ss'),
      'Người nhận': order.shippingAddress.receiverName,
      'SĐT': order.shippingAddress.receiverPhone,
      'Địa chỉ': order.shippingAddress.location,
      'Phương thức thanh toán': order.paymentMethod,
      'Tổng tiền': order.total,
      'Trạng thái': order.orderStatus
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_${moment().format('DDMMYYYY_HHmmss')}.xlsx`);
  };

  const handleViewDetail = (record) => {
    setOrderDetail(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Processing': 'orange',
      'Processed': 'blue',
      'Shipping': '#FF8C00',
      'Completed': 'green',
      'Cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  const filteredOrders = orderList.filter(order => {
    let match = true;
    
    // Filter by status
    if (filterStatus && order.orderStatus !== filterStatus) {
      match = false;
    }

    // Filter by date range
    if (dateRange) {
      const orderDate = moment(order.orderDate);
      if (!orderDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) {
        match = false;
      }
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchSearch = 
        order.orderId.toString().includes(searchLower) ||
        order.shippingAddress.receiverName.toLowerCase().includes(searchLower) ||
        order.shippingAddress.receiverPhone.includes(searchLower) ||
        order.shippingAddress.location.toLowerCase().includes(searchLower);
      if (!matchSearch) {
        match = false;
      }
    }

    return match;
  });

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
      render: (orderDate) => (
        <Tooltip title={moment(orderDate).format('LLLL')}>
          <span>{moment(orderDate).format('DD/MM/YYYY HH:mm:ss')}</span>
        </Tooltip>
      ),
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      render: (shippingAddress) => (
        <div>
          <p>
            <strong>Tên:</strong> {shippingAddress.receiverName}
          </p>
          <p>
            <strong>SĐT:</strong> {shippingAddress.receiverPhone}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {shippingAddress.location}
          </p>
        </div>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => (
        <Tag color={method === 'COD' ? 'volcano' : 'green'}>
          {method}
        </Tag>
      ),
    },
    {
      title: "Tổng đơn hàng",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (total) => (
        <span className="font-medium">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(total)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>

          {record.orderStatus !== 'Completed' && record.orderStatus !== 'Cancelled' && (
            <>
              <Popconfirm
                title="Cập nhật trạng thái đơn hàng?"
                description="Bạn có chắc muốn cập nhật trạng thái đơn hàng này?"
                onConfirm={() => handleUpdateStatus(record)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button type="primary">
                  Cập nhật trạng thái
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Hủy đơn hàng?"
                description="Bạn có chắc muốn hủy đơn hàng này?"
                onConfirm={() => handleCancelOrder(record)}
                okText="Đồng ý"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger>
                  Hủy đơn
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const orderItemsColumns = [
    {
      title: "Id",
      dataIndex: "orderItemId",
      key: "orderItemId",
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (_, record) => (
        <img
          src={record.image || img1}
          alt="order item"
          className="w-16 h-16 object-cover rounded-md"
          onError={(e) => { e.target.src = img1; }}
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
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: "Số lượng",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="font-medium">{amount}</span>
      )
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-medium">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(price)}
        </span>
      )
    },
    {
      title: "Tổng",
      key: "total",
      render: (_, record) => (
        <span className="font-medium text-blue-600">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(record.price * record.amount)}
        </span>
      )
    },
  ];

  return (
    <div className="p-4">
      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={orderStats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={orderStats.processing}
              valueStyle={{ color: 'orange' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Đã xử lý"
              value={orderStats.processed}
              valueStyle={{ color: 'blue' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Đang giao"
              value={orderStats.shipping}
              valueStyle={{ color: '#FF8C00' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={orderStats.completed}
              valueStyle={{ color: 'green' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={orderStats.cancelled}
              valueStyle={{ color: 'red' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div className="mb-4 flex justify-between items-center">
        <Space size="middle">
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
        </Space>

        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={handleExportExcel}
        >
         Xuất báo cáo Excel
        </Button>
      </div>

      {/* Orders Table */}
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="orderId"
        loading={loading}
        pagination={{
          total: filteredOrders.length,
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />

      {/* Order Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng #${orderDetail?.orderId}`}
        open={isModalVisible}
        onCancel={handleCancel}
        width={1000}
        footer={null}
      >
        {orderDetail && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Thông tin đơn hàng</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>Ngày đặt:</strong> {moment(orderDetail.orderDate).format('LLLL')}</p>
                  <p><strong>Trạng thái:</strong> <Tag color={getStatusColor(orderDetail.orderStatus)}>{orderDetail.orderStatus}</Tag></p>
                  <p><strong>Phương thức thanh toán:</strong> <Tag color={orderDetail.paymentMethod === 'COD' ? 'volcano' : 'green'}>{orderDetail.paymentMethod}</Tag></p>
                </Col>
                <Col span={12}>
                  <p><strong>Người nhận:</strong> {orderDetail.shippingAddress.receiverName}</p>
                  <p><strong>Số điện thoại:</strong> {orderDetail.shippingAddress.receiverPhone}</p>
                  <p><strong>Địa chỉ:</strong> {orderDetail.shippingAddress.location}</p>
                </Col>
              </Row>
            </div>

            <Table
              columns={orderItemsColumns}
              dataSource={orderDetail.orderItems}
              rowKey="orderItemId"
              pagination={false}
              summary={(pageData) => {
                const total = pageData.reduce((sum, item) => sum + (item.price * item.amount), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6} align="right">
                      <strong>Tổng cộng:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <span className="font-medium text-lg text-blue-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(total)}
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderTable;
