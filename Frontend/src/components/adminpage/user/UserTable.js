import { useState, useRef, useEffect } from 'react';
import { SearchOutlined, UserOutlined, FileExcelOutlined, FilterOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, Popconfirm, Select, Modal, Tag, Avatar, Card, Row, Col, Statistic, Tooltip, Form, message } from 'antd';
import Highlighter from 'react-highlight-words';
import fetchWithAuth from '../../../helps/fetchWithAuth';
import summaryApi from '../../../common';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');
const { Option } = Select;

const UserTable = ({ userList, setUserList }) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
    const [emailForm] = Form.useForm();
    const [filterRole, setFilterRole] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [userStats, setUserStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        staff: 0,
        user: 0
    });

    const searchInput = useRef(null);
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        calculateUserStats();
    }, [userList]);

    const calculateUserStats = () => {
        const stats = userList.reduce((acc, user) => {
            acc.total++;
            acc[user.status.toLowerCase()]++;
            acc[user.roleName.toLowerCase().replace('role_', '')]++;
            return acc;
        }, {
            total: 0,
            active: 0,
            inactive: 0,
            staff: 0,
            user: 0
        });
        setUserStats(stats);
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

    const handleBan = async (key) => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(
                summaryApi.processUser.url + key + '/ban',
                {
                    method: summaryApi.processUser.method,
                }
            );
            const dataResponse = await response.json();
            if (dataResponse.respCode === '000') {
                message.success('Khóa tài khoản thành công');
                const newData = userList.map((item) => {
                    if (item.id === key) {
                        return { ...item, status: 'INACTIVE' };
                    }
                    return item;
                });
                setUserList(newData);
            } else if (dataResponse.status === 403) {
                message.error('Bạn không có quyền thực hiện thao tác này');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi khóa tài khoản');
        } finally {
            setLoading(false);
        }
    };

    const handleUnBan = async (key) => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(
                summaryApi.processUser.url + key + '/unban',
                {
                    method: summaryApi.processUser.method,
                }
            );
            const dataResponse = await response.json();
            if (dataResponse.respCode === '000') {
                message.success('Mở khóa tài khoản thành công');
                const newData = userList.map((item) => {
                    if (item.id === key) {
                        return { ...item, status: 'ACTIVE' };
                    }
                    return item;
                });
                setUserList(newData);
            } else if (dataResponse.status === 403) {
                message.error('Bạn không có quyền thực hiện thao tác này');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi mở khóa tài khoản');
        } finally {
            setLoading(false);
        }
    };

    const handleBatchBan = async () => {
        try {
            setLoading(true);
            for (const id of selectedUsers) {
                await handleBan(id);
            }
            message.success('Đã khóa thành công các tài khoản đã chọn');
            setSelectedUsers([]);
        } catch (error) {
            message.error('Có lỗi xảy ra khi khóa tài khoản hàng loạt');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        const exportData = userList
            .filter(user => selectedUsers.includes(user.id))
            .map(user => ({
                'ID': user.id,
                'Họ tên': user.fullName,
                'Email': user.email,
                'Số điện thoại': user.phone,
                'Vai trò': user.roleName === 'ROLE_USER' ? 'Người dùng' : 'Nhân viên',
                'Trạng thái': user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa',
                'Ngày tạo': moment(user.createdAt).format('DD/MM/YYYY HH:mm:ss')
            }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, `users_${moment().format('DDMMYYYY_HHmmss')}.xlsx`);
    };

    const handleSendEmail = async (values) => {
        try {
            setLoading(true);
            // TODO: Implement email sending API
            message.success('Đã gửi email thành công');
            setIsEmailModalVisible(false);
            emailForm.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra khi gửi email');
        } finally {
            setLoading(false);
        }
    };

    const changeRole = async (key, newRole) => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(
                `${summaryApi.processRoleUser.url + key}?roleName=${newRole}`,
                {
                    method: summaryApi.processRoleUser.method,
                }
            );
            const dataResponse = await response.json();
            if (dataResponse.respCode === '000') {
                message.success('Thay đổi vai trò thành công');
                const newData = userList.map((item) => {
                    if (item.id === key) {
                        return { ...item, roleName: newRole };
                    }
                    return item;
                });
                setUserList(newData);
            } else if (dataResponse.status === 403) {
                message.error('Bạn không có quyền thực hiện thao tác này');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi thay đổi vai trò');
        } finally {
            setLoading(false);
        }
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

    const handleChangeRole = (value, record) => {
        Modal.confirm({
            title: 'Thay đổi vai trò người dùng',
            content: `Bạn có chắc muốn thay đổi vai trò của người dùng này thành ${value === 'ROLE_USER' ? 'Người dùng' : 'Nhân viên'}?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: () => changeRole(record.id, value),
        });
    };

    const handleExportAllUsers = () => {
        const exportData = userList.map(user => ({
            'ID': user.id,
            'Họ tên': user.fullName,
            'Email': user.email,
            'Số điện thoại': user.phone,
            'Vai trò': user.roleName === 'ROLE_USER' ? 'Người dùng' : 'Nhân viên',
            'Trạng thái': user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa',
            'Ngày tạo': moment(user.createdAt).format('DD-MM-YYYY')
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, `danh_sach_nguoi_dung-${moment().format('DD-MM-YYYY')}.xlsx`);
        message.success('Xuất danh sách người dùng thành công');
    };

    const filteredUsers = userList.filter(user => {
        let match = true;
        
        if (filterRole && user.roleName !== filterRole) {
            match = false;
        }
        
        if (filterStatus && user.status !== filterStatus) {
            match = false;
        }

        return match;
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            ...getColumnSearchProps('id'),
        },
        {
            title: 'Thông tin',
            dataIndex: 'fullName',
            key: 'fullName',
            ...getColumnSearchProps('fullName'),
            render: (_, record) => (
                <Space>
                    <Avatar 
                        src={record.avatar}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div className="font-medium">{record.fullName}</div>
                        <div className="text-gray-500 text-sm">{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            ...getColumnSearchProps('phone'),
        },
        {
            title: 'Vai trò',
            dataIndex: 'roleName',
            key: 'roleName',
            render: (role) => (
                <Tag color={role === 'ROLE_USER' ? 'blue' : 'green'}>
                    {role === 'ROLE_USER' ? 'Người dùng' : 'Nhân viên'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
                    {status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Tooltip title={moment(date).format('LLLL')}>
                    {moment(date).format('DD/MM/YYYY HH:mm')}
                </Tooltip>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    {user?.roleName === 'ROLE_ADMIN' && (
                        <Select
                            value={record.roleName}
                            style={{ width: 120 }}
                            onChange={(value) => handleChangeRole(value, record)}
                            disabled={record.status === 'INACTIVE'}
                        >
                            <Option value="ROLE_USER">Người dùng</Option>
                            <Option value="ROLE_STAFF">Nhân viên</Option>
                        </Select>
                    )}

                    {record.status === 'ACTIVE' ? (
                        <Popconfirm
                            title="Khóa tài khoản?"
                            description="Bạn có chắc muốn khóa tài khoản này?"
                            onConfirm={() => handleBan(record.id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger>Khóa</Button>
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            title="Mở khóa tài khoản?"
                            description="Bạn có chắc muốn mở khóa tài khoản này?"
                            onConfirm={() => handleUnBan(record.id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button type="primary">Mở khóa</Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Tổng người dùng"
                            value={userStats.total}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={userStats.active}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card>
                        <Statistic
                            title="Đã khóa"
                            value={userStats.inactive}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card>
                        <Statistic
                            title="Nhân viên"
                            value={userStats.staff}
                            valueStyle={{ color: '#13c2c2' }}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card>
                        <Statistic
                            title="Người dùng"
                            value={userStats.user}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters and Actions */}
            <div className="mb-4 flex justify-between items-center">
                <Space size="middle">
                    <Select
                        placeholder="Vai trò"
                        allowClear
                        style={{ width: 120 }}
                        value={filterRole}
                        onChange={setFilterRole}
                    >
                        <Option value="ROLE_USER">Người dùng</Option>
                        <Option value="ROLE_STAFF">Nhân viên</Option>
                    </Select>

                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        style={{ width: 120 }}
                        value={filterStatus}
                        onChange={setFilterStatus}
                    >
                        <Option value="ACTIVE">Hoạt động</Option>
                        <Option value="INACTIVE">Đã khóa</Option>
                    </Select>

                   
                </Space>

                <Space>
                    <Button
                        type="primary"
                        icon={<FileExcelOutlined />}
                        onClick={handleExportAllUsers}
                    >
                        Xuất báo cáo Excel
                    </Button>
                    <Button
                        icon={<MailOutlined />}
                        onClick={() => setIsEmailModalVisible(true)}
                        disabled={selectedUsers.length === 0}
                    >
                        Gửi email {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                    </Button>
                    <Popconfirm
                        title="Khóa tài khoản hàng loạt?"
                        description={`Bạn có chắc muốn khóa ${selectedUsers.length} tài khoản đã chọn?`}
                        onConfirm={handleBatchBan}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        disabled={selectedUsers.length === 0}
                    >
                        <Button 
                            danger
                            disabled={selectedUsers.length === 0}
                        >
                            Khóa hàng loạt {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                        </Button>
                    </Popconfirm>
                </Space>
            </div>

            {/* Users Table */}
            <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="id"
                loading={loading}
                rowSelection={{
                    selectedRowKeys: selectedUsers,
                    onChange: setSelectedUsers,
                }}
                pagination={{
                    total: filteredUsers.length,
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} người dùng`,
                    showQuickJumper: true,
                    showSizeChanger: true,
                }}
            />

            {/* Send Email Modal */}
            <Modal
                title="Gửi email"
                open={isEmailModalVisible}
                onCancel={() => {
                    setIsEmailModalVisible(false);
                    emailForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={emailForm}
                    onFinish={handleSendEmail}
                    layout="vertical"
                >
                    <Form.Item
                        name="subject"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item className="mb-0">
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Gửi
                            </Button>
                            <Button onClick={() => {
                                setIsEmailModalVisible(false);
                                emailForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserTable;