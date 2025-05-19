import React, { useEffect, useState } from "react";
import CategoryCard from "../layout/CategoryCard";
import summaryApi from "../../common";
import { motion } from "framer-motion";
import { BiCategory } from "react-icons/bi";

const ListCategory = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const categoryResponse = await fetch(summaryApi.allCategory.url, {
          method: summaryApi.allCategory.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResult = await categoryResponse.json();
        if (dataResult.respCode === "000") {
          setCategories(dataResult.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchCategory();
  }, []);

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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto bg-white p-6 md:p-8 shadow-lg rounded-2xl border border-gray-100"
    >
      {/* Header Section */}
      <div className="flex items-center space-x-3 mb-8">
        <BiCategory className="text-2xl text-amber-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Danh mục sản phẩm
          </h2>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500">Tổng</span>
            <span className="ml-2 px-3 py-1 text-sm bg-amber-50 text-amber-600 rounded-full font-medium">
              {categories.length} danh mục
            </span>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {categories.map((category, index) => (
          <motion.div
            key={index}
            variants={item}
            className="transform hover:-translate-x-2 transition-transform duration-300"
          >
            <CategoryCard category={category} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ListCategory;
