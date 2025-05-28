import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, Card, Row, Col, Statistic, Typography, Space, Tag, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import fetchWithAuth from '../../../helps/fetchWithAuth';
import summaryApi from '../../../common';
import Search from 'antd/es/transfer/search';
import { toast } from 'react-toastify';
import TextArea from 'antd/es/input/TextArea';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import moment from 'moment';

const { Title } = Typography;

const BrandTable = ({ brands, setBrands }) => {
    // const [brands, setBrands] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [currentBrand, setCurrentBrand] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [nameError, setNameError] = useState('');
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.user.user, (prev, next) => prev === next);

    // Stats calculation
    const stats = {
        total: brands.length,
        active: brands.filter(brand => brand.status === 'ACTIVE').length,
        inactive: brands.filter(brand => brand.status === 'INACTIVE').length
    };

    const handleAddOrUpdateBrand = (values) => {
        const url = currentBrand ? `${summaryApi.updateBrand.url}/${currentBrand.id}` : summaryApi.addBrand.url;
        const method = currentBrand ? summaryApi.updateBrand.method : summaryApi.addBrand.method;

        const fetchAddOrUpdateBrand = async () => {
            const response = await fetchWithAuth(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Name: values.name, Description: values.description, ArticleTitle: values.articleTitle, Article: values.article }),
            });
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                setNameError('')
                currentBrand ? toast.success("Chỉnh sửa nhãn hàng thành công!") : toast.success("Thêm nhãn hàng thành công!")
                if (currentBrand) {
                    setBrands(brands.map(brand => brand.id === currentBrand.id ? data.data : brand));
                } else {
                    setBrands([...brands, data.data]);
                }
                setIsModalVisible(false);
                form.resetFields();
                setCurrentBrand(null);
            } else {
                console.log(data);
                currentBrand ? toast.error("Chỉnh sửa nhãn hàng không thành công! Vui lòng thử lại sau!") : toast.error("Thêm nhãn hàng không thành công! Vui lòng thử lại sau!")
            }
            if (data.respCode === '100') {
                setNameError('Tên nhãn hàng không được để trống!')
            }
            if (data.respCode === '102') {
                setNameError('Nhãn hàng đã tồn tại!')
            }
        };
        console.log(JSON.stringify({ Name: values.name, Description: values.description, ArticleTitle: values.articleTitle, Article: values.article }))
        fetchAddOrUpdateBrand();
    };

    const handleDeleteBrand = (id) => {
        const fetchDeleteBrand = async () => {
            const response = await fetchWithAuth(`${summaryApi.deleteBrand.url}/${id}`, {
                method: summaryApi.deleteBrand.method,
            });
            const data = await response.json();
            if (data.respCode === '000') {
                toast.success('Xóa nhãn hàng thành công!')
                setBrands(brands.filter(brand => brand.id !== id));
            } else {
                console.log(data);
                toast.error('Xóa nhãn hàng thất bại! Vui lòng thử lại sau!')
            }
        };
        fetchDeleteBrand();
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Tìm kiếm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Tìm kiếm
                </Button>
                <Button
                    onClick={() => handleReset(clearFilters)}
                    size="small"
                    style={{ width: 90 }}
                >
                    Xóa
                </Button>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
    });

    const handleExportToExcel = () => {
        try {
            const exportData = brands.map(brand => ({
                'Mã nhãn hàng': brand.id,
                'Tên nhãn hàng': brand.name,
                'Mô tả': brand.description || 'Không có mô tả',
                'Tên bài viết': brand.articleTitle || 'Không có bài viết',
                'Trạng thái': brand.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động',
                'Ngày tạo': moment(brand.createdAt).format('DD-MM-YYYY')
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nhãn hàng');

            // Tự động điều chỉnh độ rộng cột
            const colWidths = [
                { wch: 15 }, // Mã nhãn hàng
                { wch: 30 }, // Tên nhãn hàng
                { wch: 40 }, // Mô tả
                { wch: 30 }, // Tên bài viết
                { wch: 20 }, // Trạng thái
                { wch: 25 }, // Ngày tạo
            ];
            ws['!cols'] = colWidths;

            XLSX.writeFile(wb, `danh_sach_nhan_hang_${moment().format('DD-MM-YYYY')}.xlsx`);
            toast.success('Xuất file Excel thành công!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Có lỗi xảy ra khi xuất file Excel!');
        }
    };

    const columns = [
        {
            title: 'Mã nhãn hàng',
            dataIndex: 'id',
            key: 'id',
            width: 120,
        },
        {
            title: 'Tên nhãn hàng',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps("name"),
            render: (text, record) => (
                <Space>
                    <span className="font-medium">{text}</span>
                    {record.articleTitle && (
                        <Tag color="blue">Có bài viết</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: text => text || <span className="text-gray-400 italic">Chưa có mô tả</span>
        },
        // Ẩn nếu là ROLE_STAFF
        ...(user?.roleName !== 'ROLE_STAFF'
            ? [
                {
                    title: 'Hành động',
                    key: 'action',
                    width: 200,
                    render: (_, record) => (
                        <Space size="small">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setCurrentBrand(record);
                                    form.setFieldsValue({
                                        name: record.name,
                                        description: record.description,
                                        articleTitle: record.articleTitle,
                                        article: record.article
                                    });
                                    setIsModalVisible(true);
                                }}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Sửa
                            </Button>
                            <Popconfirm
                                title="Xóa nhãn hàng?"
                                description="Bạn có chắc muốn xóa nhãn hàng này?"
                                onConfirm={() => handleDeleteBrand(record.id)}
                                okText="Đồng ý"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </Space>
                    ),
                },
            ]
            : [])
    ];

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="mb-0">Danh sách nhãn hàng</Title>
                    <Space size="middle">
                        <Tooltip title="Xuất danh sách nhãn hàng">
                            <Button
                                type="primary"
                                icon={<FileExcelOutlined />}
                                onClick={handleExportToExcel}
                            >
                                Xuất báo cáo Excel
                            </Button>
                        </Tooltip>
                        {user?.roleName !== 'ROLE_STAFF' && (
                            <Button
                                type="primary"
                                onClick={() => {
                                    setCurrentBrand(null);
                                    form.resetFields();
                                    setIsModalVisible(true);
                                }}
                                icon={<PlusOutlined />}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Thêm nhãn hàng
                            </Button>
                        )}
                    </Space>
                </div>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={brands}
                    loading={loading}
                    className="border rounded-lg"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} nhãn hàng`,
                    }}
                />
            </Card>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-gray-800">
                            {currentBrand ? "Chỉnh sửa nhãn hàng" : "Thêm nhãn hàng mới"}
                        </span>
                    </div>
                }
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setNameError('');
                    form.resetFields();
                }}
                footer={null}
                width={720}
                className="rounded-lg"
                centered
            >
                <div className="p-4">
                    <Form
                        form={form}
                        onFinish={handleAddOrUpdateBrand}
                        layout="vertical"
                        className="space-y-4"
                    >
                        <Form.Item
                            name="name"
                            label={
                                <span className="text-gray-700 font-medium">
                                    Tên nhãn hàng
                                </span>
                            }
                            rules={[{ required: true, message: 'Vui lòng nhập tên nhãn hàng!' }]}
                            help={nameError}
                            validateStatus={nameError ? 'error' : ''}
                        >
                            <Input
                                placeholder="Nhập tên nhãn hàng"
                                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label={
                                <span className="text-gray-700 font-medium">
                                    Mô tả
                                </span>
                            }
                        >
                            <TextArea
                                placeholder="Nhập mô tả về nhãn hàng"
                                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                                rows={3}
                                showCount
                                maxLength={500}
                            />
                        </Form.Item>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div className="text-gray-700 font-medium mb-2">
                                Thông tin bài viết
                            </div>
                            <Form.Item
                                name="articleTitle"
                                label={
                                    <span className="text-gray-700">
                                        Tên bài viết
                                    </span>
                                }
                            >
                                <Input
                                    placeholder="Nhập tên bài viết"
                                    className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="article"
                                label={
                                    <span className="text-gray-700">
                                        Nội dung bài viết
                                    </span>
                                }
                            >
                                <TextArea
                                    placeholder="Nhập nội dung bài viết"
                                    className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                                    rows={6}
                                    showCount
                                    maxLength={2000}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item className="mb-0 pt-4 border-t">
                            <Space className="w-full justify-end">
                                <Button
                                    onClick={() => {
                                        setIsModalVisible(false);
                                        setNameError('');
                                        form.resetFields();
                                    }}
                                    className="min-w-[100px]"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="min-w-[100px] bg-blue-500 hover:bg-blue-600"
                                >
                                    {currentBrand ? 'Cập nhật' : 'Thêm mới'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default BrandTable;
