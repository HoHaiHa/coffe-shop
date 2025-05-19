import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination, Empty, Spin } from "antd";
import { FiMessageSquare } from "react-icons/fi";
import ReviewItem from "./ReviewItem";
import summaryApi from "../../common";
import image1 from "../../assets/img/user-default.jpg";

const ListReview = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          summaryApi.getReviewByProductId.url + productId,
          {
            method: summaryApi.getReviewByProductId.method,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (result.respCode === "000") {
          setReviews(result.data);
          setTotalReviews(result.data.length);
        } else {
          console.log("Error Review:", result.respDesc);
        }
      } catch (error) {
        console.log("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [productId]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pageSize = 5;
  const startIndex = (currentPage - 1) * pageSize;
  const currentReviews = reviews.slice(startIndex, startIndex + pageSize);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FiMessageSquare className="text-2xl text-amber-500" />
        <h2 className="text-xl font-semibold text-gray-800">
          Đánh giá từ khách hàng
          {totalReviews > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalReviews} đánh giá)
            </span>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : reviews.length > 0 ? (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence>
              {currentReviews.map((review, index) => (
                <ReviewItem
                  key={review.id || index}
                  username={review.userEmail || "Ẩn danh"}
                  rating={review.rating}
                  date={review.createAt}
                  comment={review.comment}
                  avatar={review.userAvatar || image1}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {totalReviews > pageSize && (
            <div className="mt-6 flex justify-center">
              <Pagination
                current={currentPage}
                total={totalReviews}
                pageSize={pageSize}
                onChange={handlePageChange}
                className="custom-pagination"
              />
            </div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="py-12"
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-gray-500">
                Chưa có đánh giá nào cho sản phẩm này
              </span>
            }
          />
        </motion.div>
      )}

      <style jsx global>{`
        .custom-pagination {
          display: flex;
          justify-content: center;
        }
        
        .custom-pagination .ant-pagination-item {
          border-radius: 9999px;
          border: none;
          background: #f3f4f6;
        }
        
        .custom-pagination .ant-pagination-item-active {
          background: linear-gradient(to right, #f59e0b, #b45309);
        }
        
        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }
        
        .custom-pagination .ant-pagination-prev button,
        .custom-pagination .ant-pagination-next button {
          border-radius: 9999px;
          border: none;
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default ListReview;
