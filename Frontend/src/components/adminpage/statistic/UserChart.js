import React, { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from "recharts";
import { Table, Select, Spin, Button, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiFilter, FiPieChart, FiUserCheck, FiDownload } from "react-icons/fi";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";
import moment from "moment";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";

const { Option } = Select;

// Gradient colors for user segments
const COLORS = [
  ["#6366F1", "#4F46E5"], // Indigo gradient
  ["#EC4899", "#DB2777"], // Pink gradient
  ["#10B981", "#059669"], // Green gradient
  ["#F59E0B", "#D97706"], // Amber gradient
  ["#8B5CF6", "#7C3AED"], // Purple gradient
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <p className="text-gray-700 mb-3 font-medium flex items-center gap-2">
          <FiUserCheck className="text-indigo-500" />
          {data.payload.userName || "Chưa cập nhật"}
        </p>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: `linear-gradient(to right, ${COLORS[data.payload.index % COLORS.length][0]}, ${COLORS[data.payload.index % COLORS.length][1]})` }}
          />
          <span className="font-medium text-gray-700">Tổng mua:</span>
          <span className="text-indigo-600 font-semibold">
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
  const chartRef = useRef(null);

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

  const exportToExcel = async () => {
    try {
      // Capture chart image first
      let chartImageBase64 = null;
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        chartImageBase64 = canvas.toDataURL('image/png');
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Thống kê khách hàng');

      // Add title
      worksheet.addRow(['THỐNG KÊ KHÁCH HÀNG']).font = { bold: true, size: 16 };
      worksheet.addRow([`Thời gian: ${timeFrame === 'overview' ? 'Tổng quan' : `Tháng ${selectedMonth}/${selectedYear}`}`]).font = { size: 12 };
      worksheet.addRow([]).height = 20; // Spacing

      // Add chart image if captured successfully
      if (chartImageBase64) {
        const chartImageId = workbook.addImage({
          base64: chartImageBase64,
          extension: 'png',
        });
        
        worksheet.addRow(['BIỂU ĐỒ THỐNG KÊ']).font = { bold: true, size: 14 };
        worksheet.addRow([]).height = 10; // Spacing
        
        worksheet.addImage(chartImageId, {
          tl: { col: 0, row: worksheet.lastRow._number },
          ext: { width: 600, height: 400 }
        });

        for (let i = 0; i < 30; i++) {
          worksheet.addRow([]).height = 15;
        }        
        
        worksheet.addRow([]).height = 20; // Spacing after chart
      }

      // Add legend section
      worksheet.addRow(['CHI TIẾT KHÁCH HÀNG']).font = { bold: true, size: 14 };
      worksheet.addRow([]).height = 10; // Spacing

      // Add legend data with color indicators
      data.forEach((entry, index) => {
        const row = worksheet.addRow(['', entry.userName || 'Chưa cập nhật', '', 'Tổng mua:', entry.totalSold]);
        
        // Style the cells
        const colorCell = row.getCell(1);
        colorCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS[index % COLORS.length][0].replace('#', 'FF') }
        };
        colorCell.border = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        };
        
        // Format name cell
        const nameCell = row.getCell(2);
        nameCell.font = { bold: true };
        
        // Format amount cell
        const amountCell = row.getCell(5);
        amountCell.numFmt = '#,##0 "₫"';
        amountCell.font = { color: { argb: 'FF4F46E5' } };
      });

      worksheet.addRow([]).height = 20; // Spacing

      // Add data table section
      worksheet.addRow(['BẢNG CHI TIẾT']).font = { bold: true, size: 14 };
      worksheet.addRow([]).height = 10; // Spacing

      // Add headers
      const headers = ['Mã KH', 'Tên khách hàng', 'Email', 'Ngày tạo', 'Tổng mua'];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };

      // Set column widths
      worksheet.columns = [
        { width: 15 }, // Mã KH
        { width: 25 }, // Tên khách hàng
        { width: 30 }, // Email
        { width: 15 }, // Ngày tạo
        { width: 20 }, // Tổng mua
      ];

      // Add data
      detailedData.forEach(item => {
        const row = worksheet.addRow([
          item.userId,
          item.userName,
          item.email,
          moment(item.creatAt).format("DD/MM/YYYY"),
          item.totalSold
        ]);
      });

      // Format the totalSold column
      const totalSoldColumn = worksheet.getColumn(5);
      totalSoldColumn.numFmt = '#,##0 "₫"';

      // Add total row
      const totalAmount = detailedData.reduce((sum, item) => sum + item.totalSold, 0);
      worksheet.addRow([]).height = 10; // Spacing
      const totalRow = worksheet.addRow(['', '', '', 'Tổng cộng:', totalAmount]);
      totalRow.font = { bold: true };
      totalRow.getCell(5).numFmt = '#,##0 "₫"';

      // Generate the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thong_ke_khach_hang_${moment().format('DD-MM-YYYY')}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Có lỗi xảy ra khi xuất file Excel!');
    }
  };

  const captureChart = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current);
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `bieu_do_khach_hang_${moment().format('DD-MM-YYYY')}.png`;
        a.click();
        message.success('Xuất biểu đồ thành công!');
      } catch (error) {
        console.error('Error capturing chart:', error);
        message.error('Có lỗi xảy ra khi xuất biểu đồ!');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col w-full space-y-6"
    >
      {/* Header và bộ lọc */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <FiUsers className="text-2xl text-indigo-500" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
              Thống Kê Khách Hàng
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="primary"
              icon={<FiDownload />}
              onClick={exportToExcel}
              className="bg-indigo-600 hover:bg-indigo-700 border-0"
            >
              Xuất báo cáo Excel
            </Button>
            <Select
              value={timeFrame}
              onChange={handleTimeFrameChange}
              className="min-w-[140px]"
              size="large"
              suffixIcon={<FiFilter className="text-gray-400" />}
            >
              <Option value="overview">Tổng quan</Option>
              <Option value="monthly">Theo tháng</Option>
            </Select>

            {timeFrame === "monthly" && (
              <>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="min-w-[120px]"
                  size="large"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <Option key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </Option>
                  ))}
                </Select>

                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="min-w-[100px]"
                  size="large"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = moment().year() - i;
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
      </motion.div>

      {/* Biểu đồ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
      >
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          {loading ? (
            <div className="flex justify-center items-center w-full h-[400px]">
              <Spin size="large" className="custom-spin" />
            </div>
          ) : (
            <>
              {/* Chart Container */}
              <div className="w-full lg:w-2/3" ref={chartRef}>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart onClick={handleChartClick}>
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`gradient-${index}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={color[0]} />
                          <stop offset="100%" stopColor={color[1]} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={data.map((item, index) => ({ ...item, index }))}
                      dataKey="totalSold"
                      nameKey="userName"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      innerRadius={80}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#gradient-${index % COLORS.length})`}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Container */}
              <div className="w-full lg:w-1/3 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FiPieChart className="text-xl text-indigo-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Chi tiết khách hàng
                  </h3>
                </div>
                <div className="space-y-4">
                  {data.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-4 h-4 rounded-full mt-1"
                        style={{ background: `linear-gradient(to right, ${COLORS[index % COLORS.length][0]}, ${COLORS[index % COLORS.length][1]})` }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {entry.userName || "Chưa cập nhật"}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Tổng mua:</span>
                          <span className="font-semibold text-indigo-600">
                            {formatCurrency(entry.totalSold)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Bảng chi tiết */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FiUsers className="text-2xl text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết khách hàng
            </h3>
          </div>
        </div>

        <Table
          columns={detailedColumns}
          dataSource={detailedData}
          rowKey="userId"
          className="custom-table"
          pagination={{
            pageSize: 5,
            className: "custom-pagination px-6 py-4"
          }}
        />
      </motion.div>

      <style jsx global>{`
        .custom-spin .ant-spin-dot-item {
          background-color: #6366F1;
        }

        .custom-table .ant-table {
          background: transparent;
        }
        
        .custom-table .ant-table-thead > tr > th {
          background: #F9FAFB;
          border-bottom: none;
          font-weight: 600;
          color: #374151;
        }
        
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #F3F4F6;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #EEF2FF !important;
        }

        .custom-pagination .ant-pagination-item {
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .custom-pagination .ant-pagination-item:hover {
          border-color: #6366F1;
          color: #6366F1;
        }

        .custom-pagination .ant-pagination-item-active {
          background: linear-gradient(to right, #6366F1, #4F46E5);
          border: none;
        }

        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }

        .custom-pagination .ant-pagination-prev button,
        .custom-pagination .ant-pagination-next button {
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .custom-pagination .ant-pagination-prev:hover button,
        .custom-pagination .ant-pagination-next:hover button {
          border-color: #6366F1;
          color: #6366F1;
        }

        /* Export button styles */
        .ant-btn {
          border-radius: 8px;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .ant-btn-primary {
          text-shadow: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .ant-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .ant-btn:not(.ant-btn-primary):hover {
          color: #4F46E5;
          border-color: #4F46E5;
          background: #EEF2FF;
        }
      `}</style>
    </motion.div>
  );
};

export default UserChart; 