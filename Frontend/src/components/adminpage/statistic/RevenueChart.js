import React, { useEffect, useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, Table, Spin, Button, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiDollarSign, FiTrendingUp, FiFilter, FiDownload, FiBarChart2 } from "react-icons/fi";
import moment from "moment";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';

const { Option } = Select;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <p className="text-gray-600 mb-3 font-medium flex items-center gap-2">
          <FiCalendar className="text-amber-500" />
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium text-gray-700">Doanh thu:</span>
            <span className="text-amber-600 font-semibold">
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
  const chartRef = useRef(null);

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

  const exportToExcel = async () => {
    try {
      message.loading({ content: 'Đang xuất báo cáo...', key: 'exporting' });

      if (!data || data.length === 0) {
        message.error({ content: 'Không có dữ liệu để xuất báo cáo!', key: 'exporting' });
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Báo cáo doanh thu');

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

      worksheet.mergeCells('A1:G1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `BÁO CÁO DOANH THU ${view === 'overview' ? 'TỔNG QUAN' : `THÁNG ${selectedMonth + 1}/${selectedYear}`}`;
      titleCell.style = titleStyle;
      worksheet.getRow(1).height = 30;

      try {
        if (chartRef.current) {
          const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true
          });
          
          const base64Image = canvas.toDataURL('image/png');
          
          const imageId = workbook.addImage({
            base64: base64Image,
            extension: 'png',
          });
          
          worksheet.addImage(imageId, {
            tl: { col: 0, row: 1 },
            ext: { width: 800, height: 400 }
          });

          for (let i = 2; i <= 20; i++) {
            worksheet.getRow(i).height = 20;
          }
        }
      } catch (imageError) {
        console.error('Error capturing chart:', imageError);
        message.warning({ content: 'Không thể chụp biểu đồ, báo cáo sẽ chỉ bao gồm dữ liệu bảng', key: 'exporting' });
      }

      worksheet.addRow([]);
      worksheet.addRow([]);

      const headers = [
        'Mã đơn hàng',
        'Ngày đặt hàng',
        'Người nhận',
        'Số điện thoại',
        'Địa chỉ',
        'Loại thanh toán',
        'Tổng tiền'
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });
      worksheet.getRow(headerRow.number).height = 30;

      detailedData.forEach((order, index) => {
        if (!order) return;

        let rowData;
        try {
          rowData = [
            order.orderId || '',
            moment(order.orderDate).format('DD/MM/YYYY'),
            order.shippingAddress?.receiverName || '',
            order.shippingAddress?.receiverPhone || '',
            order.shippingAddress?.location || '',
            order.paymentMethod || '',
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total || 0)
          ];
        } catch (error) {
          console.error('Error preparing row data:', error);
          return;
        }

        const row = worksheet.addRow(rowData);

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

        row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
        row.getCell(5).alignment = { vertical: 'middle', horizontal: 'left' };
      });

      worksheet.columns.forEach((column, index) => {
        try {
          const lengths = detailedData.map(order => {
            let value = '';
            switch (index) {
              case 0: value = order.orderId; break;
              case 1: value = moment(order.orderDate).format('DD/MM/YYYY'); break;
              case 2: value = order.shippingAddress?.receiverName; break;
              case 3: value = order.shippingAddress?.receiverPhone; break;
              case 4: value = order.shippingAddress?.location; break;
              case 5: value = order.paymentMethod; break;
              case 6: value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total); break;
              default: value = '';
            }
            return (value || '').toString().length;
          });
          
          const maxLength = Math.max(
            ...lengths,
            headers[index].length
          );
          
          column.width = maxLength + 5;
        } catch (columnError) {
          console.error('Error adjusting column width:', columnError);
          column.width = 15;
        }
      });

      try {
        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `bao_cao_doanh_thu_${view === 'overview' ? 'tong_quan' : `thang_${selectedMonth + 1}_${selectedYear}`}.xlsx`;
        
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="text-2xl text-amber-500" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
              Biểu Đồ Doanh Thu
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="primary"
              icon={<FiDownload />}
              onClick={exportToExcel}
              className="bg-amber-500 hover:bg-amber-600 flex items-center"
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

      <motion.div
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

        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Spin size="large" className="custom-spin" />
          </div>
        ) : (
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey={view === "overview" ? "month" : "day"}
                  tickFormatter={(value) =>
                    moment(value).format(view === "overview" ? "MM/YYYY" : "DD/MM")
                  }
                  stroke="#6B7280"
                />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                  stroke="#6B7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  name="Doanh thu"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: "#F59E0B", r: 4 }}
                  activeDot={{ r: 6, fill: "#D97706" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-2xl text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết doanh thu
            </h3>
          </div>
        </div>

        <Table
          columns={detailedColumns}
          dataSource={detailedData}
          rowKey="orderId"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
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

export default RevenueChart; 