import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Image, Popconfirm, Spin, Space, Row, Col, Card, Statistic, Tree, Select, message, Divider, Typography, Tag, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, CloseOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, FileExcelOutlined, PictureOutlined } from '@ant-design/icons';
import fetchWithAuth from '../../../helps/fetchWithAuth';
import summaryApi from '../../../common';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Highlighter from 'react-highlight-words';
import moment from 'moment';
import 'moment/locale/vi';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { TextArea } = Input;

moment.locale('vi');

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [currentCategory, setCurrentCategory] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState('');
    const user = useSelector((state) => state.user.user, (prev, next) => prev === next);
    const [categoryStats, setCategoryStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        parent: 0,
        child: 0
    });
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [treeData, setTreeData] = useState([]);

    const searchInput = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetchWithAuth(summaryApi.allCategory.url, {
                method: summaryApi.allCategory.method,
            });
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                setCategories(data.data);
            } else {
                console.log(data);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        calculateCategoryStats();
        buildTreeData();
    }, [categories]);

    const calculateCategoryStats = () => {
        const stats = categories.reduce((acc, category) => {
            acc.total++;
            acc[category.status.toLowerCase()]++;
            if (category.parentId) {
                acc.child++;
            } else {
                acc.parent++;
            }
            return acc;
        }, {
            total: 0,
            active: 0,
            inactive: 0,
            parent: 0,
            child: 0
        });
        setCategoryStats(stats);
    };

    const buildTreeData = () => {
        const parents = categories.filter(cat => !cat.parentId);
        const tree = parents.map(parent => ({
            title: parent.name,
            key: parent.id,
            children: categories
                .filter(child => child.parentId === parent.id)
                .map(child => ({
                    title: child.name,
                    key: child.id
                }))
        }));
        setTreeData(tree);
    };

    const handleAddOrUpdateCategory = (values) => {
        const api = currentCategory ? summaryApi.updateCategory : summaryApi.addCategory;
        const url = currentCategory ? `${api.url}/${currentCategory.id}` : api.url;
        const method = currentCategory ? api.method : api.method;

        const fetchAddOrUpdateCategory = async () => {
            setLoading(true)
            try {
                const formData = new FormData();
                formData.append("name", values.name);
                formData.append("description", values.description);
                formData.append("articleTitle", values.articleTitle);
                formData.append("article", values.article);
                if (values.image && values.image[0]) {
                    formData.append('image', values.image[0].originFileObj);
                }
                formData.forEach((value, key) => {
                    console.log(`${key}:`, value);
                });
                const response = await fetchWithAuth(url, {
                    method: method,
                    body: formData,
                });
                const data = await response.json();
                if (data.respCode === '000' && data.data) {
                    setNameError('')
                    currentCategory ? toast.success('Chỉnh sửa danh mục thành công!') : toast.success('Thêm danh mục thành công!')
                    if (currentCategory) {
                        setCategories(categories.map(category =>
                            category.id === currentCategory.id ? data.data : category
                        ));
                    } else {
                        setCategories([...categories, data.data]);
                    }
                    setIsModalVisible(false);
                    form.resetFields();
                    setCurrentCategory(null);
                }
                if (data.respCode === '100') {
                    setNameError('Tên danh mục không được để trống!')
                }
                if (data.respCode === '102') {
                    setNameError('Danh mục đã tồn tại!')
                }
            } catch (error) {
                console.error('Error:', error);
                currentCategory ? toast.error('Chỉnh sửa danh mục không thành công!') : toast.error('Thêm danh mục không thành công! Vui lòng thử lại sau!')
            }
            setLoading(false)
        };
        fetchAddOrUpdateCategory();
    };

    const handleDeleteCategory = (id) => {
        setLoading(true)
        const fetchDeleteCategory = async () => {
            const response = await fetchWithAuth(`${summaryApi.deleteCategory.url}/${id}`, {
                method: summaryApi.deleteCategory.method,
            });
            const data = await response.json();
            if (data.respCode === '000') {
                toast.success('Xóa danh mục thành công!')
                setCategories(categories.filter(category => category.id !== id));
            } else {
                toast.error('Xóa danh mục không thành công! Vui lòng thử lại sau!')
            }
            setLoading(false)
        };
        fetchDeleteCategory();
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        confirm();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div className="p-4">
                <Input
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    className="mb-2 block w-full"
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, confirm)}
                        size="small"
                    >
                        Đặt lại
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={close}
                    >
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()) ?? false,
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text?.toString() ?? ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: 'Mã danh mục',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            ...getColumnSearchProps('id'),
        },
        {
            title: 'Ảnh bìa',
            key: 'image',
            render: (_, record) => (
                record.defaultImageUrl ? (
                    <Image
                        src={record.defaultImageUrl}
                        alt={record.name}
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                ) : (
                    <span>Chưa cập nhật</span>
                )
            ),
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        ...(user?.roleName !== 'ROLE_STAFF'
            ? [{
                title: 'Hành động',
                key: 'action',
                render: (_, record) => (
                    <>
                        <Button
                            type="link"
                            onClick={() => {
                                setCurrentCategory(record);
                                form.setFieldsValue({
                                    name: record.name,
                                    description: record.description,
                                    articleTitle: record.articleTitle,
                                    article: record.article,
                                    image: record.defaultImageUrl
                                        ? [{
                                            uid: '-1',
                                            name: 'image.png',
                                            status: 'done',
                                            url: record.defaultImageUrl,
                                        }]
                                        : [],
                                });
                                setIsModalVisible(true);
                            }}
                        >
                            Chỉnh sửa
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa danh mục này không?"
                            onConfirm={() => handleDeleteCategory(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button type="link" danger>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </>
                ),
            }]
            : [])
    ];

    const handleExportToExcel = () => {
        try {
            const exportData = categories.map(category => ({
                'Mã danh mục': category.id,
                'Tên danh mục': category.name,
                'Mô tả': category.description || 'Không có mô tả',
                'Tên bài viết': category.articleTitle || 'Không có bài viết',
                'Trạng thái': category.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động',
                'Ngày tạo': moment(category.createdAt).format('DD-MM-YYYY')
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Danh sách danh mục');

            // Tự động điều chỉnh độ rộng cột
            const colWidths = [
                { wch: 15 }, // Mã danh mục
                { wch: 30 }, // Tên danh mục
                { wch: 40 }, // Mô tả
                { wch: 30 }, // Tên bài viết
                { wch: 20 }, // Trạng thái
                { wch: 25 }, // Ngày tạo
            ];
            ws['!cols'] = colWidths;

            XLSX.writeFile(wb, `danh_sach_danh_muc_${moment().format('DD-MM-YYYY')}.xlsx`);
            toast.success('Xuất file Excel thành công!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Có lỗi xảy ra khi xuất file Excel!');
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 w-full">
                {/* Category Table */}
                <Card className="lg:col-span-2 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <Title level={4} className="mb-0">Danh sách danh mục</Title>
                        <Space size="middle">
                            <Tooltip title="Xuất danh sách danh mục">
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
                                        setCurrentCategory(null);
                                        form.resetFields();
                                        setIsModalVisible(true);
                                    }}
                                    icon={<PlusOutlined />}
                                    className="bg-blue-500 hover:bg-blue-600"
                                >
                                    Thêm danh mục
                                </Button>
                            )}
                        </Space>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={categories}
                        loading={loading}
                        className="border rounded-lg"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} danh mục`,
                        }}
                    />
                </Card>
            </div>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-gray-800">
                            {currentCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
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
                        onFinish={handleAddOrUpdateCategory}
                        layout="vertical"
                        className="space-y-4"
                    >
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    name="name"
                                    label={
                                        <span className="text-gray-700 font-medium">
                                            Tên danh mục
                                        </span>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng chọn tên danh mục!' }]}
                                >
                                    <Input
                                        placeholder="Chọn danh mục"
                                        allowClear
                                        className="w-full"
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
                                        placeholder="Nhập mô tả về danh mục"
                                        className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                                        rows={3}
                                        showCount
                                        maxLength={500}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="image"
                                    label={
                                        <span className="text-gray-700 font-medium">
                                            Ảnh bìa
                                        </span>
                                    }
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => {
                                        if (Array.isArray(e)) {
                                            return e;
                                        }
                                        return e?.fileList;
                                    }}
                                >
                                    <Upload
                                        name="image"
                                        listType="picture-card"
                                        maxCount={1}
                                        beforeUpload={() => false}
                                        accept="image/*"
                                    >
                                        <div className="text-center">
                                            <PictureOutlined className="text-2xl" />
                                            <div className="mt-2">Tải lên</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                                <Text type="secondary" className="text-sm block mt-2">
                                    Kích thước đề xuất: 800x400px<br />
                                    Định dạng: JPG, PNG<br />
                                    Dung lượng tối đa: 2MB
                                </Text>
                            </Col>
                        </Row>

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
                                    {currentCategory ? 'Cập nhật' : 'Thêm mới'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default CategoryTable;
