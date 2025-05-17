import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import { Table, Select } from "antd";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";
import moment from "moment";

const { Option } = Select;
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#0088FE"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-gray-600 mb-2">{data.payload.userName || data.payload.email}</p>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="font-medium">Tổng mua:</span>
          <span className="text-blue-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(data.value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const UserChart = () => {
  const [data, setData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeFrame === "overview") {
      fetchOverviewData();
    } else {
      fetchMonthlyData(selectedMonth, selectedYear);
    }
  }, [timeFrame, selectedMonth, selectedYear]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(summaryApi.getUsersStatistic.url);
      const result = await response.json();
      if (result.respCode === "000") {
        const processedData = result.data.map(user => ({
          userId: user.userId || "Chưa cập nhật",
          userName: user.userName || "Chưa cập nhật",
          email: user.email || "Chưa cập nhật",
          creatAt: user.creatAt || "Chưa cập nhật",
          totalSold: user.totalSold || 0,
        }));
        setData(processedData);
        setDetailedData(processedData);
      } else {
        console.error("Failed to fetch overview data");
      }
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async (month, year) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${summaryApi.getTop5MonthlyUsers.url}?month=${month}&year=${year}`);
      const result = await response.json();
      if (result.respCode === "000") {
        const processedData = result.data.map(user => ({
          userId: user.userId || "Chưa cập nhật",
          userName: user.userName || "Chưa cập nhật",
          email: user.email || "Chưa cập nhật",
          creatAt: user.creatAt || "Chưa cập nhật",
          totalSold: user.totalSold || 0,
        }));
        setData(processedData);
        setDetailedData(processedData);
      } else {
        console.error("Failed to fetch monthly data");
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChartClick = (data) => {
    if (data && data.activePayload) {
      const clickedData = data.activePayload[0].payload;
      setDetailedData([clickedData]);
    }
  };

  const handleTimeFrameChange = (value) => {
    setTimeFrame(value);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const detailedColumns = [
    {
      title: "Mã KH",
      dataIndex: "userId",
      key: "userId",
      width: 100,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "userName",
      key: "userName",
      className: "font-medium",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Ngày tạo",
      dataIndex: "creatAt",
      key: "creatAt",
      width: 120,
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng mua",
      dataIndex: "totalSold",
      key: "totalSold",
      width: 150,
      render: (value) => (
        <span className="font-medium text-blue-600">
          {formatCurrency(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full px-6 py-8 space-y-8 bg-gray-50">
      {/* Header và bộ lọc */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          Thống Kê Khách Hàng
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            defaultValue={timeFrame}
            onChange={handleTimeFrameChange}
            className="min-w-[140px]"
            size="large"
          >
            <Option value="overview">Tổng quan</Option>
            <Option value="monthly">Theo tháng</Option>
          </Select>

          {timeFrame === "monthly" && (
            <>
              <Select
                defaultValue={selectedMonth}
                onChange={handleMonthChange}
                className="min-w-[120px]"
                size="large"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <Option key={index + 1} value={index + 1}>
                    Tháng {index + 1}
                  </Option>
                ))}
              </Select>
              <Select
                defaultValue={selectedYear}
                onChange={handleYearChange}
                className="min-w-[100px]"
                size="large"
              >
                {Array.from({ length: 5 }, (_, index) => {
                  const year = moment().year() - index;
                  return (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  );
                })}
              </Select>
            </>
          )}
        </div>
      </div>

      {/* Biểu đồ và bảng */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {/* Chart and Legend */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-8">
          {/* Chart Container */}
          <div className="w-full lg:w-2/3">
            <PieChart width={500} height={400} onClick={handleChartClick}>
              <Pie
                data={data}
                dataKey="totalSold"
                nameKey="email"
                cx="50%"
                cy="50%"
                outerRadius={150}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </div>

          {/* Custom Legend */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-auto">
              <h3 className="text-lg font-semibold text-gray-700">
                Chi Tiết Khách Hàng
              </h3>
              <div className="space-y-3">
                {data.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-1 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setDetailedData([entry])}
                  >
                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-gray-800 truncate">
                        {entry.userName == 'Chưa cập nhật' ? entry.email : entry.userName}
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(entry.totalSold)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Bảng Chi Tiết Đơn Hàng
          </h3>
          <Table
            loading={loading}
            dataSource={detailedData}
            columns={detailedColumns}
            pagination={{
              pageSize: 5,
              className: "custom-pagination"
            }}
            rowKey="userId"
            bordered
            className="custom-table"
          />
        </div>
      </div>
    </div>
  );
};

export default UserChart; 