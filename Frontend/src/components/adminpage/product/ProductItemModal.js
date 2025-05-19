import React, { useEffect, useState } from 'react';
import { Modal, Table, Button, Form, Input, InputNumber, Select, Upload, message, Popconfirm, Space, Spin } from 'antd';
import { PlusOutlined, CloseOutlined, LoadingOutlined, DragOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import fetchWithAuth from '../../../helps/fetchWithAuth';
import summaryApi from '../../../common';
import { toast } from 'react-toastify';

const AddItemModal = ({ visible, onClose, onSave, types, onAddType, editingItem }) => {
    const [form] = Form.useForm();
    const [isAddingType, setIsAddingType] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingItem) {
            form.setFieldsValue({
                price: editingItem.price,
                stock: editingItem.stock,
                discount: editingItem.discount,
                type: editingItem.type?.name,
            });
        } else {
            form.resetFields();
        }
    }, [editingItem, form]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            await onSave(values, editingItem?.id);
            form.resetFields();
            message.success(editingItem ? 'Cập nhật thành công' : 'Thêm mới thành công');
        } catch (error) {
            message.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editingItem ? "Cập nhật phiên bản" : "Thêm phiên bản mới"}
            open={visible}
            onCancel={onClose}
            onOk={handleSave}
            confirmLoading={loading}
            okText={editingItem ? "Cập nhật" : "Thêm mới"}
            cancelText="Hủy"
        >
            <Form
                form={form}
                layout="vertical"
                className="space-y-4"
            >
                <Form.Item
                    name="price"
                    label="Giá"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá' },
                        { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
                    ]}
                >
                    <InputNumber
                        className="w-full"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        placeholder="Nhập giá"
                    />
                </Form.Item>

                <Form.Item
                    name="stock"
                    label="Số lượng tồn kho"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số lượng' },
                        { type: 'number', min: 0, message: 'Số lượng phải lớn hơn hoặc bằng 0' }
                    ]}
                >
                    <InputNumber
                        className="w-full"
                        placeholder="Nhập số lượng tồn kho"
                    />
                </Form.Item>

                <Form.Item
                    name="discount"
                    label="Giảm giá (%)"
                    rules={[
                        { type: 'number', min: 0, max: 100, message: 'Giảm giá phải từ 0-100%' }
                    ]}
                >
                    <InputNumber
                        className="w-full"
                        placeholder="Nhập % giảm giá"
                    />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Loại"
                    rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
                >
                    <Select
                        placeholder="Chọn loại"
                        dropdownRender={menu => (
                            <div>
                                {menu}
                                <div className="p-2 border-t">
                                    {isAddingType ? (
                                        <div className="flex space-x-2">
                                            <Input
                                                value={newTypeName}
                                                onChange={e => setNewTypeName(e.target.value)}
                                                placeholder="Tên loại mới"
                                            />
                                            <Button
                                                type="primary"
                                                onClick={() => {
                                                    if (newTypeName.trim()) {
                                                        onAddType(newTypeName);
                                                        setNewTypeName('');
                                                        setIsAddingType(false);
                                                    }
                                                }}
                                            >
                                                Thêm
                                            </Button>
                                            <Button onClick={() => setIsAddingType(false)}>
                                                Hủy
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            type="link"
                                            className="w-full text-left"
                                            onClick={() => setIsAddingType(true)}
                                        >
                                            + Thêm loại mới
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    >
                        {types.map(type => (
                            <Select.Option key={type.id} value={type.name}>
                                {type.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

const ProductItemsModal = ({ product, setProduct, visible, onClose, setProductList, productList }) => {
    const [productItems, setProductItems] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [reorderLoading, setReorderLoading] = useState(false);

    useEffect(() => {
        if (product && visible) {
            fetchData();
        }
    }, [product, visible]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchProductItems(), fetchTypes()]);
        } catch (error) {
            message.error('Có lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductItems = async () => {
        try {
            const response = await fetchWithAuth(
                summaryApi.productItem.url + product.id,
                { method: summaryApi.productItem.method }
            );
            const data = await response.json();
            if (data && data.respCode === '000') {
                setProductItems(data.data);
            }
        } catch (error) {
            console.error('Error fetching product items:', error);
            throw error;
        }
    };

    const fetchTypes = async () => {
        try {
            const response = await fetchWithAuth(summaryApi.getAllType.url, {
                method: summaryApi.getAllType.method
            });
            const data = await response.json();
            if (data && data.respCode === '000') {
                setTypes(data.data);
            }
        } catch (error) {
            console.error('Error fetching types:', error);
            throw error;
        }
    };

    const handleSaveItem = async (values, itemId) => {
        try {
            const url = itemId
                ? summaryApi.updateProductItem.url + itemId
                : summaryApi.addProductItem.url + product.id;
            const method = itemId
                ? summaryApi.updateProductItem.method
                : summaryApi.addProductItem.method;

            const response = await fetchWithAuth(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    type: types.find(t => t.name === values.type)?.id
                })
            });

            const data = await response.json();
            if (data.respCode === '000') {
                await fetchProductItems();
                setIsAdding(false);
                setEditingItem(null);
            } else {
                throw new Error(data.respDesc || 'Có lỗi xảy ra');
            }
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteItem = async (item) => {
        try {
            const response = await fetchWithAuth(
                summaryApi.deleteProductItem.url + item.id,
                { method: summaryApi.deleteProductItem.method }
            );
            const data = await response.json();
            if (data.respCode === '000') {
                setProductItems(prev => prev.filter(i => i.id !== item.id));
                message.success('Xóa thành công');
            } else {
                message.error(data.respDesc || 'Có lỗi xảy ra khi xóa');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi kết nối với server');
        }
    };

    const handleAddType = async (name) => {
        try {
            const response = await fetchWithAuth(summaryApi.addType.url, {
                method: summaryApi.addType.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await response.json();
            if (data.respCode === '000') {
                setTypes(prev => [...prev, data.data]);
                message.success('Thêm loại mới thành công');
            } else {
                throw new Error(data.respDesc || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra: ' + error.message);
        }
    };

    const handleAddImage = async (file) => {
        try {
            setImageLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('productId', product.id);

            const response = await fetchWithAuth(summaryApi.uploadImage.url, {
                method: summaryApi.uploadImage.method,
                body: formData
            });

            const data = await response.json();
            if (data.respCode === '000') {
                setProduct(prev => ({
                    ...prev,
                    images: [...(prev.images || []), data.data]
                }));
                message.success('Tải ảnh lên thành công');
            } else {
                throw new Error(data.respDesc || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Có lỗi khi tải ảnh lên: ' + error.message);
        } finally {
            setImageLoading(false);
        }
    };

    const handleRemoveImage = async (imageId) => {
        try {
            const response = await fetchWithAuth(
                summaryApi.deleteImage.url + imageId,
                { method: summaryApi.deleteImage.method }
            );
            const data = await response.json();
            if (data.respCode === '000') {
                setProduct(prev => ({
                    ...prev,
                    images: prev.images.filter(img => img.id !== imageId)
                }));
                message.success('Xóa ảnh thành công');
            } else {
                throw new Error(data.respDesc || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Có lỗi khi xóa ảnh: ' + error.message);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        try {
            setReorderLoading(true);
            const items = Array.from(product.images);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);

            // Update UI immediately
            setProduct(prev => ({
                ...prev,
                images: items
            }));

            // Send reorder request to server
            const response = await fetchWithAuth(summaryApi.reorderImages.url, {
                method: summaryApi.reorderImages.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    imageIds: items.map(img => img.id)
                })
            });

            const data = await response.json();
            if (data.respCode !== '000') {
                throw new Error(data.respDesc || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Có lỗi khi sắp xếp ảnh: ' + error.message);
            // Revert UI if error occurs
            fetchData();
        } finally {
            setReorderLoading(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: price => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price)
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            render: stock => (
                <span className={stock < 10 ? 'text-red-500 font-medium' : ''}>
                    {stock}
                </span>
            )
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            render: discount => discount ? `${discount}%` : '-'
        },
        {
            title: 'Loại',
            dataIndex: ['type', 'name'],
            key: 'type'
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        ghost
                        onClick={() => {
                            setEditingItem(record);
                            setIsAdding(true);
                        }}
                    >
                        Cập nhật
                    </Button>

                    <Popconfirm
                        title="Xóa phiên bản này?"
                        description="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDeleteItem(record)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <>
            <Modal
                title={`Chi tiết sản phẩm - ${product?.name}`}
                open={visible}
                onCancel={onClose}
                footer={[
                    <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAdding(true)}
                    >
                        Thêm phiên bản
                    </Button>
                ]}
                width={800}
            >
                <Spin spinning={reorderLoading} tip="Đang cập nhật thứ tự...">
                    <div className="mt-4 p-4 rounded-md bg-gray-50">
                        <h3 className="text-lg font-medium mb-4">Hình ảnh sản phẩm</h3>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="images" direction="horizontal">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex flex-wrap gap-4"
                                    >
                                        {product?.images?.map((img, index) => (
                                            <Draggable
                                                key={img.id}
                                                draggableId={img.id.toString()}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="relative w-32 h-32 group"
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt="product"
                                                            className="w-full h-full object-cover rounded-md border"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-md">
                                                            <DragOutlined className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100" />
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveImage(img.id)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200"
                                                        >
                                                            <CloseOutlined />
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        <Upload
                                            accept="image/*"
                                            showUploadList={false}
                                            beforeUpload={handleAddImage}
                                            disabled={imageLoading}
                                        >
                                            <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:border-amber-500 transition-colors duration-200">
                                                {imageLoading ? (
                                                    <LoadingOutlined className="text-2xl text-amber-500" />
                                                ) : (
                                                    <PlusOutlined className="text-2xl text-gray-400" />
                                                )}
                                            </div>
                                        </Upload>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Phiên bản sản phẩm</h3>
                        <Table
                            rowKey="id"
                            dataSource={productItems}
                            columns={columns}
                            loading={loading}
                            pagination={false}
                            scroll={{ x: 800 }}
                        />
                    </div>
                </Spin>
            </Modal>

            <AddItemModal
                visible={isAdding}
                onClose={() => {
                    setEditingItem(null);
                    setIsAdding(false);
                }}
                onSave={handleSaveItem}
                types={types}
                onAddType={handleAddType}
                editingItem={editingItem}
            />
        </>
    );
};

export default ProductItemsModal;
