import ExcelJS from 'exceljs';
import moment from 'moment';

export const exportStatisticsToExcel = async (data, type = 'statistics') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Thống kê');

    // Định dạng tiêu đề
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Báo cáo thống kê ${type === 'statistics' ? 'tổng quan' : type === 'brand' ? 'nhãn hàng' : 'danh mục'} - ${moment().format('DD/MM/YYYY')}`;
    titleCell.font = {
        name: 'Arial',
        size: 16,
        bold: true
    };
    titleCell.alignment = { horizontal: 'center' };

    // Thêm dữ liệu thống kê
    worksheet.addRow([]); // Dòng trống
    const statsRow = worksheet.addRow(['Chỉ số', 'Giá trị']);
    statsRow.font = { bold: true };

    if (type === 'brand') {
        worksheet.addRow(['Tổng số nhãn hàng', data.brandStats.total]);
        worksheet.addRow(['Đang hoạt động', data.brandStats.active]);
        worksheet.addRow(['Không hoạt động', data.brandStats.inactive]);
    } else if (type === 'category') {
        worksheet.addRow(['Tổng số danh mục', data.categoryStats.total]);
        worksheet.addRow(['Danh mục gốc', data.categoryStats.parent]);
        worksheet.addRow(['Danh mục con', data.categoryStats.child]);
    }

    // Thêm biểu đồ
    const chart = workbook.addChart(type === 'brand' ? 'pie' : 'column', {
        title: {
            text: `Biểu đồ thống kê ${type === 'brand' ? 'nhãn hàng' : 'danh mục'}`
        },
        legend: {
            position: 'right'
        }
    });

    // Thêm dữ liệu cho biểu đồ
    if (type === 'brand') {
        chart.addSeries({
            name: 'Trạng thái',
            labels: ['Đang hoạt động', 'Không hoạt động'],
            values: [[data.brandStats.active, data.brandStats.inactive]],
            dataLabels: { showValue: true }
        });
    } else if (type === 'category') {
        chart.addSeries({
            name: 'Số lượng',
            labels: ['Danh mục gốc', 'Danh mục con'],
            values: [[data.categoryStats.parent, data.categoryStats.child]],
            dataLabels: { showValue: true }
        });
    }

    worksheet.addRow([]); // Dòng trống
    worksheet.addImage(chart, {
        tl: { col: 1, row: 7 },
        br: { col: 6, row: 20 }
    });

    // Thêm bảng dữ liệu
    worksheet.addRow([]); // Dòng trống
    worksheet.addRow([]); // Dòng trống
    
    const headerRow = worksheet.addRow(
        type === 'brand' 
            ? ['ID', 'Tên nhãn hàng', 'Mô tả', 'Trạng thái', 'Ngày tạo']
            : ['ID', 'Tên danh mục', 'Mô tả', 'Trạng thái', 'Ngày tạo']
    );
    headerRow.font = { bold: true };

    // Thêm dữ liệu từ bảng
    const items = type === 'brand' ? data.brandList : data.categories;
    items.forEach(item => {
        const row = type === 'brand'
            ? [
                item.id,
                item.name,
                item.description,
                item.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động',
                moment(item.createdAt).format('DD/MM/YYYY HH:mm')
            ]
            : [
                item.id,
                item.name,
                item.description,
                item.parentId ? (data.categories.find(c => c.id === item.parentId)?.name || '') : 'Danh mục gốc',
                item.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động',
                moment(item.createdAt).format('DD/MM/YYYY HH:mm')
            ];
        worksheet.addRow(row);
    });

    // Định dạng cột
    worksheet.columns.forEach(column => {
        column.width = 20;
        column.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Tạo file Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thong_ke_${type}_${moment().format('DDMMYYYY_HHmmss')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
}; 