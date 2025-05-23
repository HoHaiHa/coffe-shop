import React, { useEffect, useState } from "react";
import summaryApi from "../../common";
import { Slider, Box, Typography } from "@mui/material";

const FilterBrand = ({ onFilter, products, onClickFilter }) => {
  const min = 0;
  const max = 5000000;
  const step = 50000;
  const [categories, setCategories] = useState([]);
  const [selectCategories, setSelectCategories] = useState([]);
  const [value, setValue] = useState([min, max]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(summaryApi.allCategory.url, {
          method: summaryApi.allCategory.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResponse = await response.json();
        if (dataResponse.respCode === "000") {
          setCategories(dataResponse.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSelectCategory = (category) => {
    setSelectCategories((pre) =>
      pre.includes(category.name)
        ? pre.filter((item) => item !== category.name)
        : [...pre, category.name]
    );
  };

  const handleClickFilter = () => {
    const filtered = products.filter((product) => {
      const inPriceRange =
        product.minPrice >= value[0] && product.minPrice <= value[1];
      const matchesCategories = selectCategories.length
        ? selectCategories.includes(product.category.name)
        : true;
      return inPriceRange && matchesCategories;
    });
    onClickFilter();
    onFilter(filtered);
  };

  return (
    <div className="relative p-6 w-full bg-white rounded-lg shadow-xl ">
      <div className="w-full grid grid-cols-1 justify-between items-start gap-y-8">
        <div>
          <Box margin="0 auto">
            <Typography
              gutterBottom
              sx={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Giá
            </Typography>
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
                  width: 12,
                  height: 12,
                  backgroundColor: "#8B4513", // nâu đất (SaddleBrown)
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0px 0px 0px 8px rgba(139, 69, 19, 0.16)",
                  },
                },
                "& .MuiSlider-track": {
                  height: 6,
                  backgroundColor: "#D2B48C", // be vàng sáng (Tan)
                },
                "& .MuiSlider-rail": {
                  height: 6,
                  backgroundColor: "#EDEDED", // màu rail nhẹ
                },
                "& .MuiSlider-valueLabel": {
                  backgroundColor: "#8B4513", // label nâu
                },
              }}
            />


            <div className="grid grid-cols-2 gap-6 justify-between ">
              <Box
                sx={{
                  border: "1px solid #ccc",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {value[0]}
              </Box>
              <Box
                sx={{
                  border: "1px solid #ccc",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {value[1]}
              </Box>
            </div>
          </Box>
        </div>

        {/* Lọc theo danh muc */}
        <div className="">
          <p className="text-xl font-semibold mb-4">Danh mục</p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`border rounded p-2 text-nowrap text-sm line-clamp-1 ${selectCategories.includes(category.name) ? "bg-yellow-500 text-white" : ""
                  }`}
                onClick={() => handleSelectCategory(category)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className=" mt-10">
        <button
          onClick={handleClickFilter}

          className="w-full p-2 text-white uppercase rounded-lg shadow-lg
           bg-gradient-to-r from-amber-700 to-stone-500 transition-all 
           duration-500 ease-in-out bg-[length:200%_auto] hover:bg-[position:right_center]"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default FilterBrand;
