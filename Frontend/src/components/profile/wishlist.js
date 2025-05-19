import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Pagination, Typography, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiTrash2, FiShoppingBag, FiAlertCircle } from "react-icons/fi";
import { removeFromFavorites } from "../../store/favoritesSlice ";
import fetchWithAuth from "../../helps/fetchWithAuth";
import summaryApi from "../../common";
import image1 from "../../assets/img/empty.jpg";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const favorites = useSelector((state) => state.favorites.items);
  const user = useSelector((store) => store?.user?.user);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(2);

  const currentFavorites = useMemo(() => {
    const indexOfLastFavorite = currentPage * pageSize;
    const indexOfFirstFavorite = indexOfLastFavorite - pageSize;
    return favorites.slice(indexOfFirstFavorite, indexOfLastFavorite);
  }, [currentPage, pageSize, favorites]);

  const handleRemoveFavorite = async (product) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(summaryApi.deleteFavorites.url, {
        method: summaryApi.deleteFavorites.method,
        body: JSON.stringify({
          UserId: user.id,
          ProductId: product.id,
        }),
      });

      const data = await response.json();
      if (data.respCode === "000") {
        const updateFavorites = favorites.filter((item) => item.id !== product.id);
        const totalPages = Math.ceil(updateFavorites.length / pageSize);

        if (currentPage > totalPages) {
          setCurrentPage(Math.max(1, totalPages));
        }
        dispatch(removeFromFavorites(product));
        message.success({
          content: "Đã xóa khỏi danh sách yêu thích",
          icon: <FiHeart className="text-red-500" />,
          className: "custom-message"
        });
      } else {
        throw new Error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích");
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích:", error);
      message.error({
        content: "Không thể xóa khỏi danh sách yêu thích",
        icon: <FiAlertCircle className="text-red-500" />,
        className: "custom-message"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-amber-50/30 p-6 rounded-2xl shadow-lg border border-amber-100/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <FiHeart className="text-2xl text-amber-600" />
        <Title level={3} className="text-xl font-bold m-0 bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
          Danh sách yêu thích
        </Title>
      </div>

      <motion.div 
        className="mt-6 space-y-4"
        layout
      >
        <AnimatePresence mode="popLayout">
          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 px-4"
            >
              <FiHeart className="mx-auto text-4xl text-amber-300 mb-4" />
              <Text className="block text-gray-500 text-lg">
                Danh sách yêu thích của bạn đang trống
              </Text>
              <Text className="block text-gray-400 mt-2">
                Hãy thêm những sản phẩm bạn yêu thích vào đây
              </Text>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl
                         shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => navigate("/")}
              >
                <span className="flex items-center gap-2">
                  <FiShoppingBag />
                  Khám phá sản phẩm
                </span>
              </motion.button>
            </motion.div>
          ) : (
            currentFavorites.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 
                         bg-white rounded-xl border border-amber-100/50 shadow-sm hover:shadow-md 
                         transition-all duration-300"
              >
                <motion.div
                  className="flex items-center w-full sm:w-auto cursor-pointer"
                  onClick={() => handleViewItem(item)}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative overflow-hidden rounded-xl border-2 border-amber-100/50">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                      src={item.images[0]?.url ? item.images[0].url : image1}
                      alt={item.name}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <Text className="block mb-1 font-semibold text-base sm:text-lg text-gray-800 group-hover:text-amber-700 transition-colors duration-300">
                      {item.name}
                    </Text>
                    <Text className="text-sm sm:text-base text-gray-500">
                      <span className="font-medium text-amber-600">
                        Danh mục:{" "}
                      </span>
                      {item.category.name}
                    </Text>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto border-red-200 hover:border-red-400
                             text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                    icon={<FiTrash2 className="mr-1" />}
                    loading={loading === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(item);
                    }}
                  >
                    Xóa
                  </Button>
                </motion.div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {favorites.length > pageSize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mt-8"
          >
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={favorites.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              className="custom-pagination"
            />
          </motion.div>
        )}
      </motion.div>

      <style jsx global>{`
        .custom-message {
          border-radius: 12px;
          padding: 12px 16px;
          background: white;
          border: 1px solid rgba(245, 158, 11, 0.2);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .custom-pagination .ant-pagination-item {
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .custom-pagination .ant-pagination-item:hover {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .custom-pagination .ant-pagination-item-active {
          background: linear-gradient(to right, #f59e0b, #d97706);
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
          border-color: #f59e0b;
          color: #f59e0b;
        }
      `}</style>
    </motion.div>
  );
};

export default Wishlist;
