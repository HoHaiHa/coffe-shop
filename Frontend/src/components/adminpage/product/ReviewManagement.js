import { Modal, Rate, Avatar, List, Button, message, Select, Popconfirm, Empty, Spin, Space, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { UserOutlined, LikeOutlined, DislikeOutlined, FilterOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import fetchWithAuth from '../../../helps/fetchWithAuth';
import summaryApi from '../../../common';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const ReviewModal = ({ visible, onClose, product }) => {
    const [reviewList, setReviewList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingStats, setRatingStats] = useState({
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    });

    const pageSize = 5;

    useEffect(() => {
        if (visible && product) {
            fetchReviewList();
        }
    }, [product, visible]);

    const fetchReviewList = async () => {
        setLoading(true);
        try {
            const request = await fetchWithAuth(
                summaryApi.getReviewByProductId.url + product.id,
                {
                    method: summaryApi.getReviewByProductId.method,
                }
            );
            const response = await request.json();
            if (response.respCode === "000") {
                const reviews = response.data;
                setReviewList(reviews);
                setFilteredReviews(reviews);
                setTotalReviews(reviews.length);
                
                // Calculate rating statistics
                const stats = reviews.reduce((acc, review) => {
                    acc[review.rating] = (acc[review.rating] || 0) + 1;
                    return acc;
                }, {5: 0, 4: 0, 3: 0, 2: 0, 1: 0});
                
                setRatingStats(stats);
            } else {
                message.error("Có lỗi khi tải đánh giá");
            }
        } catch (error) {
            message.error("Có lỗi khi kết nối với server");
        } finally {
            setLoading(false);
        }
    };

    const handleRatingFilterChange = (value) => {
        setRatingFilter(value);
        setCurrentPage(1);
        
        if (value === null) {
            setFilteredReviews(reviewList);
        } else {
            const filtered = reviewList.filter(review => review.rating === value);
            setFilteredReviews(filtered);
        }
    };

    const handleSortChange = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);
        
        const sorted = [...filteredReviews].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return newOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        
        setFilteredReviews(sorted);
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(
                summaryApi.deleteReview.url + reviewId,
                { method: summaryApi.deleteReview.method }
            );
            const data = await response.json();
            
            if (data.respCode === "000") {
                const updatedReviews = reviewList.filter(review => review.id !== reviewId);
                setReviewList(updatedReviews);
                setFilteredReviews(updatedReviews.filter(review => 
                    ratingFilter === null || review.rating === ratingFilter
                ));
                message.success("Xóa đánh giá thành công");
                
                // Update statistics
                const newStats = { ...ratingStats };
                const deletedReview = reviewList.find(review => review.id === reviewId);
                if (deletedReview) {
                    newStats[deletedReview.rating]--;
                }
                setRatingStats(newStats);
                setTotalReviews(prev => prev - 1);
            } else {
                message.error("Có lỗi khi xóa đánh giá");
            }
        } catch (error) {
            message.error("Có lỗi khi kết nối với server");
        } finally {
            setLoading(false);
        }
    };

    const renderRatingStats = () => {
        return (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Thống kê đánh giá</h3>
                <div className="space-y-2">
                    {Object.entries(ratingStats).reverse().map(([rating, count]) => {
                        const percentage = totalReviews ? (count / totalReviews) * 100 : 0;
                        return (
                            <div key={rating} className="flex items-center space-x-4">
                                <div className="w-20 text-right">
                                    <Rate disabled defaultValue={parseInt(rating)} className="text-sm" />
                                </div>
                                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="w-20">
                                    <span className="text-sm text-gray-600">
                                        {count} ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 text-center">
                    <Tag color="blue">Tổng số đánh giá: {totalReviews}</Tag>
                    {totalReviews > 0 && (
                        <Tag color="green">
                            Điểm trung bình: {(Object.entries(ratingStats).reduce((acc, [rating, count]) => 
                                acc + (parseInt(rating) * count), 0) / totalReviews).toFixed(1)}
                        </Tag>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Modal
            title={`Đánh giá - ${product?.name}`}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Spin spinning={loading}>
                {renderRatingStats()}

                <div className="mb-4 flex justify-between items-center">
                    <Space>
                        <Select
                            value={ratingFilter}
                            onChange={handleRatingFilterChange}
                            placeholder="Lọc theo số sao"
                            style={{ width: 140 }}
                            allowClear
                            suffixIcon={<FilterOutlined />}
                        >
                            {[5, 4, 3, 2, 1].map(stars => (
                                <Select.Option key={stars} value={stars}>
                                    <Rate disabled defaultValue={stars} className="text-sm" />
                                </Select.Option>
                            ))}
                        </Select>
                        
                        <Button
                            icon={sortOrder === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
                            onClick={handleSortChange}
                        >
                            {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
                        </Button>
                    </Space>

                    <span className="text-gray-500 text-sm">
                        {filteredReviews.length} đánh giá
                    </span>
                </div>

                {filteredReviews.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                        renderItem={(review) => (
                            <List.Item
                                className="border-b border-gray-200 pb-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                actions={[
                                    <Popconfirm
                                        title="Xóa đánh giá này?"
                                        description="Bạn có chắc chắn muốn xóa đánh giá này?"
                                        onConfirm={() => handleDeleteReview(review.id)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button danger>Xóa</Button>
                                    </Popconfirm>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar icon={<UserOutlined />} src={review.user?.avatar} />
                                    }
                                    title={
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">{review.user?.fullName || 'Ẩn danh'}</span>
                                            <Rate disabled defaultValue={review.rating} className="text-sm" />
                                        </div>
                                    }
                                    description={
                                        <div className="space-y-2">
                                            <p className="text-gray-800">{review.comment}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <Tooltip title={moment(review.createdAt).format('LLLL')}>
                                                    <span>{moment(review.createdAt).fromNow()}</span>
                                                </Tooltip>
                                                <Space>
                                                    <span className="flex items-center">
                                                        <LikeOutlined className="mr-1" />
                                                        {review.likes || 0}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <DislikeOutlined className="mr-1" />
                                                        {review.dislikes || 0}
                                                    </span>
                                                </Space>
                                            </div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                        pagination={{
                            current: currentPage,
                            onChange: (page) => setCurrentPage(page),
                            pageSize: pageSize,
                            total: filteredReviews.length,
                            showSizeChanger: false,
                            showQuickJumper: true,
                            showTotal: (total) => `Tổng ${total} đánh giá`
                        }}
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span className="text-gray-500">
                                {ratingFilter ? 'Không có đánh giá nào với số sao này' : 'Chưa có đánh giá nào'}
                            </span>
                        }
                    />
                )}
            </Spin>
        </Modal>
    );
};

export default ReviewModal;
