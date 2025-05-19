import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Select, Table, Spin, Button, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FiBox, FiFilter, FiAward, FiBarChart2, FiDownload } from "react-icons/fi";
import moment from "moment";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';

const { Option } = Select;

// Gradient colors for bars
const COLORS = [
  ["#F59E0B", "#D97706"], 
  ["#3B82F6", "#2563EB"], 
  ["#10B981", "#059669"], 
  ["#EC4899", "#DB2777"], 
  ["#8B5CF6", "#7C3AED"], 
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <p className="text-gray-700 mb-3 font-medium flex items-center gap-2">
          <FiBox className="text-amber-500" />
          {label}
        </p>
        <div className="flex items-center space-x-2 py-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: 'linear-gradient(to right, #F59E0B, #D97706)' }}
          />
          <span className="font-medium text-gray-700">Số lượng bán:</span>
          <span className="text-amber-600 font-semibold">
            {payload[0].value.toLocaleString()} sản phẩm
          </span>
        </div>
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
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

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
        console.log('API Response:', result);
        if (result.respCode === "000" && result.data.length > 0) {
          setData(result.data);
          setDetailedData(result.data);
          console.log('Chart Data:', result.data);
        } else {
          console.log('No data received or invalid response code');
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

  const chartData = React.useMemo(() => {
    if (!data.length) return [];
    
    // Transform data for the chart
    return data.map(item => ({
      name: item.productName,
      value: item.quantitySold,
      revenue: item.totalRevenue
    }));
  }, [data]);

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

  const exportToExcel = async () => {
    try {
      message.loading({ content: 'Đang xuất báo cáo...', key: 'exporting' });

      // Kiểm tra dữ liệu
      if (!data || data.length === 0) {
        message.error({ content: 'Không có dữ liệu để xuất báo cáo!', key: 'exporting' });
        return;
      }

      // Tạo workbook và worksheet mới
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Báo cáo doanh số');

      // Thiết lập style cho tiêu đề
      const titleStyle = {
        font: { size: 16, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };

      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F59E0B' }
        },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };

      // Thêm tiêu đề báo cáo
      worksheet.mergeCells('A1:G1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `BÁO CÁO TOP 5 SẢN PHẨM BÁN CHẠY ${view === 'overview' ? 'TỔNG QUAN' : `THÁNG ${selectedMonth + 1}/${selectedYear}`}`;
      titleCell.style = titleStyle;
      worksheet.getRow(1).height = 30;

      try {
        // Chụp ảnh biểu đồ
        if (chartRef.current) {
          const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true
          });
          
          // Chuyển canvas thành base64
          const base64Image = canvas.toDataURL('image/png');
          
          // Thêm ảnh vào Excel
          const imageId = workbook.addImage({
            base64: base64Image,
            extension: 'png',
          });
          
          // Chèn ảnh vào worksheet với kích thước cố định
          worksheet.addImage(imageId, {
            tl: { col: 0, row: 1 },
            ext: { width: 800, height: 400 }
          });

          // Điều chỉnh độ cao của các hàng chứa biểu đồ
          for (let i = 2; i <= 20; i++) {
            worksheet.getRow(i).height = 20;
          }
        }
      } catch (imageError) {
        console.error('Error capturing chart:', imageError);
        message.warning({ content: 'Không thể chụp biểu đồ, báo cáo sẽ chỉ bao gồm dữ liệu bảng', key: 'exporting' });
      }

      // Thêm khoảng trống sau biểu đồ
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Thêm tiêu đề bảng
      const headers = [
        'Mã sản phẩm',
        'Tên sản phẩm',
        'Danh mục',
        'Thương hiệu',
        'Số lượng',
        'Doanh thu',
        'Thời gian'
      ];

      // Thêm header với style
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });
      worksheet.getRow(headerRow.number).height = 30;

      // Thêm dữ liệu với màu sắc xen kẽ
      data.forEach((item, index) => {
        if (!item) return;

        let rowData;
        try {
          rowData = [
            item.productId || '',
            item.productName || '',
            item.categoryName || '',
            item.brandName || '',
            item.quantitySold || 0,
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalRevenue || 0),
            view === 'overview' ? 'Tổng quan' : `Tháng ${selectedMonth + 1}/${selectedYear}`
          ];
        } catch (error) {
          console.error('Error preparing row data:', error);
          return;
        }

        const row = worksheet.addRow(rowData);

        // Chỉ thêm border và căn chỉnh cho các ô
        row.eachCell((cell) => {
          cell.style = {
            alignment: { vertical: 'middle', horizontal: 'center' },
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        });

        // Căn trái cho tên sản phẩm
        row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
      });

      // Tự động điều chỉnh độ rộng cột
      worksheet.columns.forEach((column, index) => {
        try {
          const lengths = data.map(row => {
            const value = row[headers[index].toLowerCase().replace(/\s+/g, '')] || '';
            return value.toString().length;
          });
          
          const maxLength = Math.max(
            ...lengths,
            headers[index].length
          );
          
          column.width = maxLength + 5;
        } catch (columnError) {
          console.error('Error adjusting column width:', columnError);
          column.width = 15; // Fallback width
        }
      });

      try {
        // Tạo buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Tạo blob và tải xuống
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `bao_cao_top_5_san_pham_${view === 'overview' ? 'tong_quan' : `thang_${selectedMonth + 1}_${selectedYear}`}.xlsx`;
        
        // Tạo link tải và click
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        
        message.success({ content: 'Xuất báo cáo thành công!', key: 'exporting' });
      } catch (saveError) {
        console.error('Error saving file:', saveError);
        message.error({ content: 'Không thể lưu file báo cáo!', key: 'exporting' });
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error({ content: 'Có lỗi xảy ra khi xuất báo cáo!', key: 'exporting' });
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
            <FiAward className="text-2xl text-amber-500" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
              Top 5 Sản Phẩm Bán Chạy Nhất
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="primary"
              icon={<FiDownload />}
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 flex items-center"
              disabled={loading || !data.length}
            >
              Xuất báo cáo Excel
            </Button>
            <Select
              defaultValue="overview"
              onChange={handleViewChange}
              className="min-w-[140px]"
              size="large"
              suffixIcon={<FiFilter className="text-gray-400" />}
            >
              <Option value="overview">Tổng quan</Option>
              <Option value="monthly">Theo tháng</Option>
            </Select>

            {view === "monthly" && (
              <>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="min-w-[120px]"
                  size="large"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <Option key={i} value={i}>
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
                    const year = moment().year() - 2 + i;
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
        ref={chartContainerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FiBarChart2 className="text-xl text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-800">Biểu đồ thống kê</h3>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {loading ? (
            <div className="flex justify-center items-center w-full h-[500px]">
              <Spin size="large" className="custom-spin" />
            </div>
          ) : (
            <>
              {/* Chart Container */}
              <div className="w-full max-w-4xl min-h-[400px]" ref={chartRef}>
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      barSize={80}
                    >
                      <defs>
                        <linearGradient id="gradient-0" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="name"
                        angle={-35}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#9CA3AF' }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#9CA3AF' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "15px"
                        }}
                      />
                      <Bar
                        dataKey="value"
                        name=" "
                        fill="url(#gradient-0)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={80}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div className="text-center">
                      <FiBarChart2 className="mx-auto text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
                    </div>
                  </div>
                )}
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
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FiBox className="text-2xl text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết doanh số
            </h3>
          </div>
          <Button
            icon={<FiDownload />}
            onClick={exportToExcel}
            className="flex items-center hover:text-green-600"
            disabled={loading || !data.length}
          >
            Xuất bảng chi tiết
          </Button>
        </div>

        <Table
          columns={detailedColumns}
          dataSource={detailedData}
          rowKey="productId"
          className="custom-table"
          pagination={{
            pageSize: 5,
            className: "custom-pagination px-6 py-4"
          }}
        />
      </motion.div>

      <style jsx global>{`
        .custom-spin .ant-spin-dot-item {
          background-color: #F59E0B;
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
          background: #FEF3C7 !important;
        }

        .custom-pagination .ant-pagination-item {
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .custom-pagination .ant-pagination-item:hover {
          border-color: #F59E0B;
          color: #F59E0B;
        }

        .custom-pagination .ant-pagination-item-active {
          background: linear-gradient(to right, #F59E0B, #D97706);
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
          border-color: #F59E0B;
          color: #F59E0B;
        }
      `}</style>
    </motion.div>
  );
};

export default ProductChart; 