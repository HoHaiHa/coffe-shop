import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Select, Table } from "antd";
import moment from "moment";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";

const { Option } = Select;

// Màu sắc mới với palette đẹp hơn
const COLORS = [
  "#2E7D32", // Xanh lá đậm
  "#1976D2", // Xanh dương đậm
  "#C62828", // Đỏ đậm
  "#F57C00", // Cam đậm
  "#6A1B9A", // Tím đậm
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-gray-600 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span>{entry.value.toLocaleString()} sản phẩm</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ProductChart = () => {
  const [view, setView] = useState("overview");
  const [data, setData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (view === "overview") {
          response = await fetchWithAuth(
            summaryApi.getTop5BestSellingProduct.url,
            {
              method: summaryApi.getTop5BestSellingProduct.method,
            }
          );
        } else {
          const startDate = moment()
            .year(selectedYear)
            .month(selectedMonth)
            .startOf("month")
            .format("YYYY-MM-DD");
          const endDate = moment()
            .year(selectedYear)
            .month(selectedMonth)
            .endOf("month")
            .format("YYYY-MM-DD");
          const url = `${summaryApi.getTop5MonthlySellingProduct.url}?startDate=${startDate}&endDate=${endDate}`;
          response = await fetchWithAuth(url, {
            method: summaryApi.getTop5MonthlySellingProduct.method,
          });
        }
        const result = await response.json();
        if (result.respCode === "000" && result.data.length > 0) {
          setData(result.data);
          setDetailedData(result.data);
        } else {
          setData([]);
          setDetailedData([]);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setData([]);
        setDetailedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view, selectedMonth, selectedYear]);

  const handleViewChange = (value) => {
    setView(value);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const chartData = data.length
    ? [
        data.reduce((acc, item, index) => {
          acc["name"] = view === "overview" 
            ? "Biểu đồ thể hiện top sản phẩm bán chạy" 
            : `Tháng ${selectedMonth + 1}/${selectedYear}`;
          acc[`product${index}`] = item.quantitySold;
          return acc;
        }, {}),
      ]
    : [];

  const detailedColumns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "productId",
      key: "productId",
      className: "font-medium",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      className: "font-medium",
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Thương hiệu",
      dataIndex: "brandName",
      key: "brandName",
    },
    {
      title: "Số lượng đã bán",
      dataIndex: "quantitySold",
      key: "quantitySold",
      render: (value) => value.toLocaleString(),
      className: "font-medium text-blue-600",
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value),
      className: "font-medium text-green-600",
    },
  ];

  return (
    <div className="flex flex-col w-full px-6 py-8 space-y-8 bg-gray-50">
      {/* Header và bộ lọc */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          Top 5 Sản Phẩm Bán Chạy Nhất
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

      {/* Biểu đồ và Legend */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          {/* Chart Container */}
          <div className="w-full lg:w-1/2 h-[400px]">
            <BarChart
              width={700}
              height={400}
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barGap={35}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 14, fill: '#374151' }}
                tickLine={false}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <YAxis 
                tick={{ fontSize: 14, fill: '#374151' }}
                tickLine={false}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              {data.map((item, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey={`product${index}`}
                  fill={COLORS[index % COLORS.length]}
                  name={item.productName}
                  barSize={60}
                  label={{
                    position: "top",
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "#374151",
                  }}
                />
              ))}
            </BarChart>
          </div>

          {/* Custom Legend */}
          <div className="lg:w-1/3 p-6 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-1 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-6 h-4 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-semibold text-gray-800 text-base flex-1">
                    {item.productName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Bảng Chi Tiết Doanh Số
        </h3>
        <Table
          loading={loading}
          dataSource={detailedData}
          columns={detailedColumns}
          pagination={{ 
            pageSize: 5,
            className: "custom-pagination" 
          }}
          rowKey="productId"
          bordered
          className="custom-table"
        />
      </div>
    </div>
  );
};

export default ProductChart; 