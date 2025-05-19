import React, { useEffect, useState } from "react";
import summaryApi from "../../common";
import { Slider, Box } from "@mui/material";
import { motion } from "framer-motion";
import { BsBuildingsFill } from "react-icons/bs";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { HiOutlineFilter } from "react-icons/hi";

const FilterCategory = ({ onFilter, products, onClickFilter }) => {
  const min = 0;
  const max = 5000000;
  const step = 50000;
  const [brands, setBrands] = useState([]);
  const [selectBrand, setSelectBrand] = useState([]);
  const [value, setValue] = useState([min, max]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(summaryApi.allBrand.url, {
          method: summaryApi.allBrand.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResponse = await response.json();
        if (dataResponse.respCode === "000") {
          setBrands(dataResponse.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchBrands();
  }, []);

  const handleSelectBrand = (brand) => {
    setSelectBrand((pre) =>
      pre.includes(brand.name)
        ? pre.filter((item) => item !== brand.name)
        : [...pre, brand.name]
    );
  };

  const handleClickFilter = () => {
    const filtered = products.filter((product) => {
      const inPriceRange =
        product.minPrice >= value[0] && product.minPrice <= value[1];
      const matchesBrand = selectBrand.length
        ? selectBrand.includes(product.brand.name)
        : true;
      return inPriceRange && matchesBrand;
    });
    onClickFilter();
    onFilter(filtered);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative p-8 w-full bg-white rounded-2xl shadow-lg border border-gray-100"
    >
      <div className="w-full space-y-8">
        {/* Filter Header */}
        <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
          <HiOutlineFilter className="text-2xl text-amber-600" />
          <h2 className="text-xl font-bold text-gray-800">Bộ lọc theo danh mục</h2>
        </div>

        {/* Price Range Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FaRegMoneyBillAlt className="text-xl text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-800">Khoảng giá</h3>
          </div>
          <Box className="px-2">
            <Slider
              value={value}
              onChange={handleChange}
              valueLabelDisplay="auto"
              step={step}
              min={min}
              max={max}
              disableSwap
              sx={{
                width: "100%",
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                  backgroundColor: "#d97706",
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0px 0px 0px 8px rgba(217, 119, 6, 0.16)",
                  },
                },
                "& .MuiSlider-track": {
                  height: 6,
                  backgroundColor: "#d97706",
                },
                "& .MuiSlider-rail": {
                  height: 6,
                  backgroundColor: "#f3f4f6",
                },
                "& .MuiSlider-valueLabel": {
                  backgroundColor: "#d97706",
                },
              }}
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <p className="text-xs text-gray-500 mb-1">Từ</p>
                <p className="font-medium text-amber-600">
                  {value[0].toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <p className="text-xs text-gray-500 mb-1">Đến</p>
                <p className="font-medium text-amber-600">
                  {value[1].toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          </Box>
        </div>

        {/* Brands Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <BsBuildingsFill className="text-xl text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-800">Thương hiệu</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {brands.map((brand, index) => (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${selectBrand.includes(brand.name)
                    ? "bg-amber-500 text-white shadow-md hover:bg-amber-600"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                onClick={() => handleSelectBrand(brand)}
              >
                {brand.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleClickFilter}
          className="w-full py-4 px-6 mt-6 rounded-xl text-white font-medium
            bg-gradient-to-r from-amber-500 to-amber-700 
            hover:from-amber-600 hover:to-amber-800
            transition-all duration-300 transform hover:shadow-lg"
        >
          Áp dụng bộ lọc
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FilterCategory;
