import { useState, useRef } from 'react';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    DownloadOutlined,
    UploadOutlined,
    InfoCircleOutlined,
    ShoppingOutlined,
    FileExcelOutlined,
    DollarOutlined,
    StarOutlined,
    EditOutlined,
    DeleteOutlined,
    DownOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {
    Button,
    Input,
    Space,
    Table,
    Popconfirm,
    Modal,
    Form,
    Select,
    Image,
    AutoComplete,
    Dropdown,
    Menu,
    message,
    Tag,
    Tooltip,
    Upload,
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Divider,
    Rate
} from 'antd';
import { AiOutlineBars } from "react-icons/ai";
import { RiEditLine, RiDeleteBinLine } from "react-icons/ri";
import { PiListStarBold } from "react-icons/pi";
import Highlighter from 'react-highlight-words';
import fetchWithAuth from '../../../helps/fetchWithAuth';
import summaryApi from '../../../common';
import ProductItemModal from './ProductItemModal';
import ReviewModal from './ReviewManagement';
import TextArea from 'antd/es/input/TextArea';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import moment from 'moment';
import 'moment/locale/vi';
import SortProduct from '../../layout/SortProduct';
import { BiSortAlt2 } from 'react-icons/bi';

const { Option } = Select;
const { Title, Text } = Typography;

moment.locale('vi');

const ProductTable = ({ products, setProducts, categories, brands, setCategories, setBrands, onSortChange }) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newBrandName, setNewBrandName] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [filters, setFilters] = useState({
        category: [],
        brand: [],
        priceRange: null,
        stock: null
    });

    const searchInput = useRef(null);
    const user = useSelector((state) => state.user.user);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [form] = Form.useForm();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductItemsModalVisible, setIsProductItemsModalVisible] = useState(false);

    // Add product statistics
    const productStats = {
        total: products.length,
        active: products.filter(p => p.status === 'ACTIVE').length,
        outOfStock: products.filter(p => p.quantity === 0).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
    };

    // Batch Operations
    const handleBatchDelete = async () => {
        try {
            setLoading(true);
            for (const id of selectedRows) {
                await handleDelete(id);
            }
            message.success('Đã xóa thành công các sản phẩm đã chọn');
            setSelectedRows([]);
        } catch (error) {
            message.error('Có lỗi xảy ra khi xóa sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await fetchWithAuth(`${summaryApi.exportToExcel.url}`, {
                method: summaryApi.exportToExcel.method,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Nhận dữ liệu nhị phân
            const blob = await response.blob();

            // Tạo đường dẫn tải file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `danh_sach_san_pham-${getCurrentDateString()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            toast.success('Xuất danh sách sản phẩm thành công!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Có lỗi xảy ra khi xuất file Excel!');
        }
    };

    const getCurrentDateString = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `-${day}-${month}-${year}`;
    };

    const handleImportExcel = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(firstSheet);

                // Process and validate data
                const validData = data.filter(item =>
                    item['Tên sản phẩm'] &&
                    item['Danh mục'] &&
                    item['Thương hiệu']
                );

                if (validData.length === 0) {
                    message.error('Không có dữ liệu hợp lệ trong file');
                    return;
                }

                // Import products
                setLoading(true);
                for (const item of validData) {
                    try {
                        const response = await fetchWithAuth(summaryApi.addProduct.url, {
                            method: summaryApi.addProduct.method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: item['Tên sản phẩm'],
                                category: categories.find(c => c.name === item['Danh mục'])?.id,
                                brand: brands.find(b => b.name === item['Thương hiệu'])?.id,
                                description: item['Mô tả'],
                                netWeight: item['Khối lượng'],
                                beanType: item['Loại hạt'],
                                origin: item['Xuất xứ']
                            })
                        });
                        const result = await response.json();
                        if (result.respCode === '000') {
                            setProducts(prev => [...prev, result.data]);
                        }
                    } catch (error) {
                        console.error('Error importing product:', error);
                    }
                }
                message.success('Nhập dữ liệu thành công');
            } catch (error) {
                message.error('Có lỗi xảy ra khi đọc file');
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
        return false;
    };

    // Enhanced filtering
    const handleFilterChange = (type, value) => {
        setFilters(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const filteredProducts = products.filter(product => {
        let match = true;
        if (filters.category.length > 0) {
            match = match && filters.category.includes(product.category?.id);
        }
        if (filters.brand.length > 0) {
            match = match && filters.brand.includes(product.brand?.id);
        }
        return match;
    });

    const showProductItemsModal = (product) => {
        setSelectedProduct(product);
        setIsProductItemsModalVisible(true);
    };

    const closeProductItemsModal = () => {
        setSelectedProduct(null);
        setIsProductItemsModalVisible(false);
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

    const closeModel = () => {
        setCurrentProduct(null);
        setIsModalVisible(false);
        if (!currentProduct) form.resetFields();
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetchWithAuth(summaryApi.deleteProduct.url + id, {
                method: summaryApi.deleteProduct.method,
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.respCode === '000') {
                setProducts(products.filter((product) => product.id !== id));
                message.success('Xóa sản phẩm thành công');
            } else if (data.status === 403) {
                message.error('Bạn không có quyền thực hiện thao tác này');
            } else {
                message.error('Có lỗi xảy ra khi xóa sản phẩm');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi kết nối với server');
        }
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const showModal = (product = null) => {
        setCurrentProduct(product);
        setIsModalVisible(true);
        if (product) {
            form.setFieldsValue({
                name: product.name,
                description: product.description,
                category: product.category?.id,
                brand: product.brand?.id,
                netWeight: product.netWeight,
                beanType: product.beanType,
                origin: product.origin,
                roadLevel: product.roadLevel,
                flavoNotes: product.flavoNotes,
                caffeineContents: product.caffeineContents,
                cafeForm: product.cafeForm,
                articleTitle: product.articleTitle,
                article: product.article,
            });
        } else {
            if (!currentProduct) form.resetFields();
        }
    }
    const handleUpdateProduct = (values) => {
        const fetchUpdateProduct = async () => {
            const response = await fetchWithAuth(summaryApi.updateProduct.url + currentProduct.id, {
                method: summaryApi.updateProduct.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Name: values.name,
                    Description: values.description,
                    BrandId: values.brand,
                    CategoryId: values.category,
                    NetWeight: values.netWeight,
                    BeanType: values.beanType,
                    Origin: values.origin,
                    RoadLevel: values.roadLevel,
                    FlavoNotes: values.flavoNotes,
                    CaffeineContents: values.caffeineContents,
                    CafeForm: values.cafeForm,
                    ArticleTitle: values.articleTitle,
                    Article: values.article,
                }),
            });
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                const updatedProducts = products.map((product) => {
                    if (product.id === currentProduct.id) {
                        return data.data;
                    }
                    return product;
                });
                setProducts(updatedProducts);
                message.success('Cập nhật sản phẩm thành công');
                closeModel();
            } else if (data.status === 403) {
                message.error('Bạn không có quyền thực hiện thao tác này');
            } else {
                message.error('Có lỗi xảy ra khi cập nhật sản phẩm');
            }
        };
        fetchUpdateProduct();
    };

    const handleAddProduct = (values) => {
        const fetchAddProduct = async () => {
            const response = await fetchWithAuth(summaryApi.addProduct.url, {
                method: summaryApi.addProduct.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Name: values.name,
                    Description: values.description,
                    BrandId: values.brand,
                    CategoryId: values.category,
                    NetWeight: values.netWeight,
                    BeanType: values.beanType,
                    Origin: values.origin,
                    RoadLevel: values.roadLevel,
                    FlavoNotes: values.flavoNotes,
                    CaffeineContents: values.caffeineContents,
                    CafeForm: values.cafeForm,
                    ArticleTitle: values.articleTitle,
                    Article: values.article,
                }),
            });
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                setProducts([...products, data.data]);
                message.success('Thêm sản phẩm thành công');
                closeModel();
            } else if (data.status === 403) {
                message.error('Bạn không có quyền thực hiện thao tác này');
            } else {
                message.error('Có lỗi xảy ra khi thêm sản phẩm');
            }
        };
        fetchAddProduct();
    };

    const handleAddCategory = () => {
        const fetchAddCategory = async () => {
            const response = await fetchWithAuth(summaryApi.addCategory.url, {
                method: summaryApi.addCategory.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newCategoryName }),
            });
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                setCategories([...categories, data.data]);
                setNewCategoryName('');
                setIsCategoryModalVisible(false);
            } else {
                console.log(data);
            }
        };
        fetchAddCategory();
    };

    const handleAddBrand = () => {
        const fetchAddBrand = async () => {
            const response = await fetchWithAuth(summaryApi.addBrand.url, {
                method: summaryApi.addBrand.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newBrandName }),
            });
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                setBrands([...brands, data.data]);
                setNewBrandName('');
                setIsBrandModalVisible(false);
            } else {
                console.log(data);
            }
        }
        fetchAddBrand();
    };

    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);

    const showReviewModal = (product) => {
        setSelectedProduct(product);
        setIsReviewModalVisible(true);
    };

    const closeReviewModal = () => {
        setSelectedProduct(null);
        setIsReviewModalVisible(false);
    };

    const columns = [
        {
            title: 'Mã SP',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            ...getColumnSearchProps('id'),
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'defaultImageUrl',
            key: 'image',
            width: 100,
            render: (_, record) => (
                record.images && record.images.length > 0 ? (
                    <Image
                        src={record.images[0].url}
                        alt="Product"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        preview={{
                            mask: <div className="text-xs">Xem</div>
                        }}
                    />
                ) : (
                    <Tag color="warning">Chưa có ảnh</Tag>
                )
            )
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
            render: (text) => (
                <Tooltip title={text}>
                    <div className="max-w-xs truncate">{text}</div>
                </Tooltip>
            )
        },
        {
            title: 'Danh mục',
            dataIndex: ['category', 'name'],
            key: 'categoryName',
            filters: categories.map(cat => ({
                text: cat.name,
                value: cat.id
            })),
            onFilter: (value, record) => record.category?.id === value,
            render: (text) => <Tag color="blue">{text || 'N/A'}</Tag>
        },
        {
            title: 'Thương hiệu',
            dataIndex: ['brand', 'name'],
            key: 'brandName',
            filters: brands.map(brand => ({
                text: brand.name,
                value: brand.id
            })),
            onFilter: (value, record) => record.brand?.id === value,
            render: (text) => <Tag color="green">{text || 'N/A'}</Tag>
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <Tooltip title={text}>
                    <div className="max-w-xs truncate">{text || 'N/A'}</div>
                </Tooltip>
            )
        },
        ...(user?.roleName !== 'ROLE_STAFF' ? [
            {
                title: 'Hành động',
                key: 'action',
                fixed: 'right',
                width: 200,
                render: (_, record) => (
                    <Space size="small">
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="link"
                                icon={<AiOutlineBars />}
                                onClick={() => showProductItemsModal(record)}
                                className="text-green-500 hover:text-green-400"
                            />
                        </Tooltip>

                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="link"
                                icon={<RiEditLine />}
                                onClick={() => showModal(record)}
                                className="text-blue-500 hover:text-blue-400"
                            />
                        </Tooltip>

                        <Tooltip title="Xem đánh giá">
                            <Button
                                type="link"
                                icon={<PiListStarBold />}
                                onClick={() => showReviewModal(record)}
                                className="text-yellow-500 hover:text-yellow-400"
                            />
                        </Tooltip>

                        <Tooltip title="Xóa">
                            <Popconfirm
                                title="Bạn có chắc muốn xóa sản phẩm này?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    type="link"
                                    icon={<RiDeleteBinLine />}
                                    className="text-red-500 hover:text-red-400"
                                />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                ),
            },
        ] : []),
    ];

    return (
        <div className="space-y-6">
            {/* Main Content */}
            <Card className="shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="mb-0">Danh sách sản phẩm</Title>
                    <Space size="middle">
                        <SortProduct onSelect={onSortChange} />
                        <Tooltip title="Lọc sản phẩm">
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setFilterVisible(!filterVisible)}
                                className={filterVisible ? 'bg-blue-50' : ''}
                            >
                                Bộ lọc
                            </Button>
                        </Tooltip>

                        <Button
                            type="primary"
                            icon={<FileExcelOutlined />}
                            onClick={handleExportExcel}
                        >
                            Xuất báo cáo Excel
                        </Button>

                        {user?.roleName !== 'ROLE_STAFF' && (
                            <Button
                                type="primary"
                                onClick={() => showModal()}
                                icon={<PlusOutlined />}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Thêm sản phẩm
                            </Button>
                        )}
                    </Space>
                </div>

                {/* Filter Panel */}
                {filterVisible && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <Row gutter={16}>
                            <Col span={6}>
                                <Form.Item label="Danh mục">
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn danh mục"
                                        value={filters.category}
                                        onChange={value => handleFilterChange('category', value)}
                                        className="w-full"
                                    >
                                        {categories.map(cat => (
                                            <Option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Thương hiệu">
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn thương hiệu"
                                        value={filters.brand}
                                        onChange={value => handleFilterChange('brand', value)}
                                        className="w-full"
                                    >
                                        {brands.map(brand => (
                                            <Option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className="flex justify-end">
                            <Button
                                onClick={() => {
                                    setFilters({
                                        category: [],
                                        brand: [],
                                        priceRange: null,
                                        stock: null
                                    });
                                }}
                            >
                                Đặt lại
                            </Button>
                        </div>
                    </div>
                )}

                {/* Batch Actions */}
                {selectedRows.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 flex justify-between items-center">
                        <Text>Đã chọn {selectedRows.length} sản phẩm</Text>
                        <Space>
                            <Button
                                onClick={handleExportExcel}
                                icon={<FileExcelOutlined />}
                            >
                                Xuất báo cáo Excel
                            </Button>
                            <Popconfirm
                                title="Xóa sản phẩm?"
                                description={`Bạn có chắc muốn xóa ${selectedRows.length} sản phẩm đã chọn?`}
                                onConfirm={handleBatchDelete}
                                okText="Đồng ý"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={loading}
                                >
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </Space>
                    </div>
                )}

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredProducts}
                    loading={loading}
                    className="border rounded-lg"
                    rowSelection={{
                        selectedRowKeys: selectedRows,
                        onChange: setSelectedRows
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                    }}
                />
            </Card>

            <ReviewModal
                visible={isReviewModalVisible}
                onClose={closeReviewModal}
                product={selectedProduct}
            />

            <ProductItemModal
                product={selectedProduct}
                setProduct={setSelectedProduct}
                visible={isProductItemsModalVisible}
                onClose={closeProductItemsModal}
                setProductList={setProducts}
                productList={products}
            />

            <Modal
                title={currentProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                open={isModalVisible}
                onCancel={closeModel}
                footer={null}
                width={800}
                className="product-form-modal"
            >
                <Form
                    form={form}
                    onFinish={currentProduct ? handleUpdateProduct : handleAddProduct}
                    layout="vertical"
                    className="space-y-4"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
                                    { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' }
                                ]}
                            >
                                <Input placeholder="VD: Cà phê Arabica" maxLength={100} showCount />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="netWeight"
                                label="Khối lượng tịnh"
                                rules={[{ required: true, message: 'Vui lòng nhập khối lượng!' }]}
                            >
                                <AutoComplete
                                    placeholder="VD: 500gr"
                                    options={[
                                        { value: '500gr' },
                                        { value: '1000gr' },
                                        { value: '500-1000gr' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                            >
                                <Select
                                    placeholder="Chọn danh mục"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {categories.map((cat) => (
                                        <Option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="brand"
                                label="Thương hiệu"
                                rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
                            >
                                <Select
                                    placeholder="Chọn thương hiệu"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {brands.map((brand) => (
                                        <Option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm!' }]}
                    >
                        <Input.TextArea
                            placeholder="Mô tả chi tiết về sản phẩm"
                            rows={4}
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="origin"
                                label="Xuất xứ"
                                rules={[{ required: true, message: 'Vui lòng chọn xuất xứ!' }]}
                            >
                                <Select
                                    placeholder="Chọn xuất xứ"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {['Vietnam', 'Brazil', 'Colombia', 'Ethiopia', 'Indonesia'].map(origin => (
                                        <Option key={origin} value={origin}>{origin}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="beanType"
                                label="Loại hạt"
                                rules={[{ required: true, message: 'Vui lòng chọn loại hạt!' }]}
                            >
                                <Select placeholder="Chọn loại hạt">
                                    <Option value="Arabica">Arabica</Option>
                                    <Option value="Robusta">Robusta</Option>
                                    <Option value="Culi">Culi</Option>
                                    <Option value="Moka">Moka</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="roadLevel"
                                label="Độ rang"
                            >
                                <Select placeholder="Chọn độ rang">
                                    <Option value="Light">Light Roast (180°C – 205°C)</Option>
                                    <Option value="Medium">Medium Roast (210°C – 220°C)</Option>
                                    <Option value="Dark">Dark Roast (225°C – 240°C)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="flavoNotes"
                                label="Hương vị"
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn hương vị"
                                    maxTagCount={3}
                                >
                                    {[
                                        'Chocolate', 'Fruity', 'Nutty', 'Floral',
                                        'Caramel', 'Spicy', 'Citrus', 'Berry'
                                    ].map(flavor => (
                                        <Option key={flavor} value={flavor}>{flavor}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="caffeineContents"
                                label="Hàm lượng caffeine"
                            >
                                <Select placeholder="Chọn hàm lượng">
                                    <Option value="Low">Thấp (Dưới 30 mg/100ml)</Option>
                                    <Option value="Medium">Trung bình (30-60 mg/100ml)</Option>
                                    <Option value="High">Cao (Trên 60 mg/100ml)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="cafeForm"
                                label="Hình thức"
                            >
                                <Select placeholder="Chọn hình thức">
                                    <Option value="Whole Bean">Cà phê nguyên hạt</Option>
                                    <Option value="Ground">Cà phê xay</Option>
                                    <Option value="Instant">Cà phê hòa tan</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Form.Item
                        name="articleTitle"
                        label="Tiêu đề bài viết"
                    >
                        <Input placeholder="Nhập tiêu đề bài viết" maxLength={200} showCount />
                    </Form.Item>

                    <Form.Item
                        name="article"
                        label="Nội dung bài viết"
                    >
                        <Input.TextArea
                            placeholder="Nhập nội dung bài viết"
                            rows={6}
                            showCount
                            maxLength={2000}
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={closeModel}>Hủy</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                {currentProduct ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Thêm sản phẩm"
                open={isCategoryModalVisible}
                onCancel={() => setIsCategoryModalVisible(false)}
                footer={null}
            >
                <Input
                    placeholder="Thêm danh mục"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button
                    type="primary"
                    onClick={handleAddCategory}
                    className="mt-2"
                    disabled={!newCategoryName.trim()}
                >
                    Thêm danh mục
                </Button>
            </Modal>
        </div>
    );
};

export default ProductTable;
