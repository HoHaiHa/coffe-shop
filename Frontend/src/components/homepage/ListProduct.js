import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../layout/ProductCard";
import { useRef } from "react";
import { Pagination } from "antd";
import SortProduct from "../layout/SortProduct";
import { motion } from "framer-motion";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { BiSortAlt2 } from "react-icons/bi";

const ListProduct = ({ products: initialProducts, title, onSortChange }) => {
  const titleRef = useRef();
  const [products, setProducts] = useState(initialProducts || []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  const productList = products;

  const currentProducts = useMemo(() => {
    const indexLast = currentPage * itemsPerPage;
    const indexFirst = indexLast - itemsPerPage;
    return productList.slice(indexFirst, indexLast);
  }, [currentPage, itemsPerPage, productList]);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (titleRef.current) {
      const elementPosition = titleRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - 150,
        behavior: "smooth",
      });
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container bg-white shadow-lg p-8 mx-auto mt-12 rounded-2xl border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-8 space-y-4 sm:space-y-0">
        {title && (
          <div className="flex items-center space-x-3">
            <HiOutlineShoppingBag className="text-2xl text-amber-600" />
            <div>
              <h2 ref={titleRef} className="text-xl font-bold text-gray-800">
                {title}
              </h2>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">Tổng</span>
                <span className="ml-2 px-3 py-1 text-sm bg-amber-50 text-amber-600 rounded-full font-medium">
                  {productList.length} sản phẩm
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <BiSortAlt2 className="text-xl text-amber-600" />
          <SortProduct onSelect={onSortChange} />
        </div>
      </div>

      {productList.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16 text-gray-500"
        >
          <div className="w-24 h-24 mb-6 bg-gray-50 rounded-full flex items-center justify-center">
            <HiOutlineShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-600">Không có sản phẩm nào</p>
          <p className="text-sm text-gray-400 mt-2">Vui lòng thử lại với bộ lọc khác</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-2 gap-4 md:gap-6 lg:gap-8"
        >
          {currentProducts.map((product, index) => (
            <motion.div 
              key={index}
              variants={item}
              className="transform hover:-translate-y-1 transition-transform duration-300"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {productList.length > 0 && (
        <div className="flex justify-center mt-12">
          <Pagination
            current={currentPage}
            total={productList.length}
            onChange={handlePageChange}
            pageSize={itemsPerPage}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Custom styles for Ant Design Pagination */}
      <style jsx global>{`
        .ant-pagination {
          display: flex;
          gap: 0.5rem;
        }

        .ant-pagination .ant-pagination-item {
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          min-width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ant-pagination .ant-pagination-item:hover {
          border-color: #d97706;
          color: #d97706;
          background-color: #fff7ed;
        }
        
        .ant-pagination .ant-pagination-item-active {
          background: linear-gradient(to right, #d97706, #b45309);
          border: none;
          position: relative;
          overflow: hidden;
        }
        
        .ant-pagination .ant-pagination-item-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shine 1.5s infinite;
        }
        
        @keyframes shine {
          100% {
            left: 100%;
          }
        }
        
        .ant-pagination .ant-pagination-item-active a {
          color: white;
          font-weight: 500;
        }
        
        .ant-pagination .ant-pagination-prev,
        .ant-pagination .ant-pagination-next {
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          min-width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ant-pagination .ant-pagination-prev:hover,
        .ant-pagination .ant-pagination-next:hover {
          border-color: #d97706;
          color: #d97706;
          background-color: #fff7ed;
        }
        
        .ant-pagination .ant-pagination-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ant-pagination .ant-pagination-disabled:hover {
          border-color: #e5e7eb;
          color: rgba(0, 0, 0, 0.25);
          background-color: #f3f4f6;
        }
      `}</style>
    </motion.div>
  );
};

export default ListProduct;
