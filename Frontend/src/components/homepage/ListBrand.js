import React, { useEffect, useState } from "react";
import summaryApi from "../../common";
import BrandCard from "../layout/BrandCard";
import { motion } from "framer-motion";
import { BsBuildingsFill } from "react-icons/bs";

const ListBrand = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandResponse = await fetch(summaryApi.allBrand.url, {
          method: summaryApi.allBrand.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResult = await brandResponse.json();
        if (dataResult.respCode === "000") {
          setBrands(dataResult.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchBrands();
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
        <BsBuildingsFill className="text-2xl text-amber-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Thương hiệu nổi bật
          </h2>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500">Tổng</span>
            <span className="ml-2 px-3 py-1 text-sm bg-amber-50 text-amber-600 rounded-full font-medium">
              {brands.length} thương hiệu
            </span>
          </div>
        </div>
      </div>

      {/* Brands List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {brands.map((brand, index) => (
          <motion.div
            key={index}
            variants={item}
            className="transform hover:-translate-x-2 transition-transform duration-300"
          >
            <BrandCard brand={brand} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ListBrand;
