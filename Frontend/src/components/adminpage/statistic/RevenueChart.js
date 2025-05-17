import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, Table } from "antd";
import moment from "moment";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";

const { Option } = Select;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-gray-600 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">Doanh thu:</span>
            <span className="text-green-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueChart = () => {
  const [view, setView] = useState("overview");
  const [data, setData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(summaryApi.getOrderByStatus.url + `Completed`, {
          method: summaryApi.getOrderByStatus.method,
        });
        const result = await response.json();
        if (result.respCode === "000") {
          const orders = result.data;
          setAllOrders(orders);
          updateData(view, orders, selectedMonth, selectedYear);
        } else {
          setData([]);
          setDetailedData([]);
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setData([]);
        setDetailedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view, selectedMonth, selectedYear]);

  // ... Giữ nguyên các hàm xử lý dữ liệu ...
  const updateData = (view, orders, month, year) => {
    if (view === "overview") {
      setData(aggregateMonthlyData(orders));
      setDetailedData(orders);
    } else {
      setData(aggregateDailyData(orders, month, year));
      setDetailedData(filterOrdersByMonth(orders, month, year));
    }
  };

  const aggregateMonthlyData = (orders) => {
    const monthlyData = {};
    orders.forEach(order => {
      const month = moment(order.orderDate).format('YYYY-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, totalRevenue: 0 };
      }
      monthlyData[month].totalRevenue += order.total;
    });
    return Object.values(monthlyData);
  };

  const aggregateDailyData = (orders, month, year) => {
    const dailyData = {};
    orders.forEach(order => {
      const orderDate = moment(order.orderDate);
      if (orderDate.month() === month && orderDate.year() === year) {
        const day = orderDate.format('YYYY-MM-DD');
        if (!dailyData[day]) {
          dailyData[day] = { day, totalRevenue: 0 };
        }
        dailyData[day].totalRevenue += order.total;
      }
    });
    return Object.values(dailyData);
  };

  const aggregateMonthlyTotal = (orders, month, year) => {
    const totalRevenue = orders.reduce((acc, order) => {
      const orderDate = moment(order.orderDate);
      if (orderDate.month() === month && orderDate.year() === year) {
        return acc + order.total;
      }
      return acc;
    }, 0);
    return [{ month: moment().year(year).month(month).format('YYYY-MM'), totalRevenue }];
  };

  const filterOrdersByMonth = (orders, month, year) => {
    return orders.filter(order => {
      const orderDate = moment(order.orderDate);
      return orderDate.month() === month && orderDate.year() === year;
    });
  };

  const handleViewChange = (value) => {
    setView(value);
    updateData(value, allOrders, selectedMonth, selectedYear);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    if (view === "monthly") {
      setData(aggregateDailyData(allOrders, value, selectedYear));
      setDetailedData(filterOrdersByMonth(allOrders, value, selectedYear));
    }
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    if (view === "monthly") {
      setData(aggregateDailyData(allOrders, selectedMonth, value));
      setDetailedData(filterOrdersByMonth(allOrders, selectedMonth, value));
    }
  };

  const handleRowClick = (record) => {
    if (view === "overview") {
      const selectedMonthOrders = filterOrdersByMonth(allOrders, moment(record.month).month(), moment(record.month).year());
      setDetailedData(selectedMonthOrders);
    }
  };

  const aggregatedColumns = [
    {
      title: "Thời gian",
      dataIndex: view === "overview" ? "month" : "day",
      key: "time",
      render: (value) => moment(value).format(view === "overview" ? "MM/YYYY" : "DD/MM/YYYY"),
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value) => (
        <span className="font-medium text-green-600">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
        </span>
      ),
    },
  ];

  const detailedColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      className: "font-medium",
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thông tin đặt hàng",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      render: (address) => {
        const { receiverName, receiverPhone, location } = address || {};
        return (
          <div className="space-y-1">
            {receiverName && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Người nhận:</span>
                <span>{receiverName}</span>
              </div>
            )}
            {receiverPhone && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">SĐT:</span>
                <span>{receiverPhone}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Địa chỉ:</span>
                <span>{location}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Loại thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (value) => (
        <span className="font-medium text-green-600">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full px-6 space-y-8 bg-gray-50">
      {/* Header và bộ lọc */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          Biểu Đồ Doanh Thu
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            defaultValue="overview"
            onChange={handleViewChange}
            className="min-w-[140px]"
            size="large"
          >
            <Option value="overview">Tổng quan</Option>
            <Option value="monthly">Theo tháng</Option>
          </Select>

          {view === "monthly" && (
            <>
              <Select
                defaultValue={selectedMonth}
                onChange={handleMonthChange}
                className="min-w-[120px]"
                size="large"
              >
                {moment.months().map((month, index) => (
                  <Option key={index} value={index}>
                    {month}
                  </Option>
                ))}
              </Select>
              <Select
                defaultValue={selectedYear}
                onChange={handleYearChange}
                className="min-w-[100px]"
                size="large"
              >
                {Array.from({ length: 10 }, (_, i) =>
                  moment().year() - 5 + i
                ).map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </>
          )}
        </div>
      </div>

      {/* Biểu đồ và bảng tổng hợp */}
      <div className="bg-white p-6 pl-0 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          {/* Chart Container */}
          <div className="w-full lg:w-2/3">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey={view === "overview" ? "month" : "day"}
                  tick={{ fontSize: 12, fill: '#374151' }}
                  tickFormatter={(value) =>
                    moment(value).format(view === "overview" ? "MM/YYYY" : "DD/MM")
                  }
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#374151' }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  name="Doanh thu"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6, fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>

          {/* Summary Table */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold  text-gray-700">
                Tổng Hợp Doanh Thu
              </h3>
              <div className="max-h-[300px] overflow-auto">
                <Table
                  loading={loading}
                  dataSource={view === "overview" ? data : aggregateMonthlyTotal(allOrders, selectedMonth, selectedYear)}
                  columns={aggregatedColumns}
                  pagination={false}
                  rowKey={view === "overview" ? "month" : "day"}
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    className: "cursor-pointer hover:bg-gray-100",
                  })}
                  className="custom-table"
                  scroll={{ y: 500 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Chi Tiết Đơn Hàng
        </h3>
        <Table
          loading={loading}
          dataSource={detailedData}
          columns={detailedColumns}
          pagination={{
            pageSize: 5,
            className: "custom-pagination"
          }}
          rowKey="orderId"
          bordered
          className="custom-table"
        />
      </div>
    </div>
  );
};

export default RevenueChart; 