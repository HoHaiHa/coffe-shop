import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    const dx = Math.abs(e.clientX - startPos.x);
    const dy = Math.abs(e.clientY - startPos.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 5) {
      navigate(`/product/${product.id}`);
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - startPos.x);
    const dy = Math.abs(touch.clientY - startPos.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 5) {
      navigate(`/product/${product.id}`);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };
  return (
    <div
      className="h-[340px] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[65%] overflow-hidden bg-gray-50">
        {product?.images?.[0]?.url ? (
          <>
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                <LoadingOutlined className="text-3xl text-amber-500" spin />
              </div>
            )}
            <img
              src={product.images[0].url}
              alt={product.name || "Product Image"}
              onLoad={handleImageLoad}
              className={`w-full h-full object-cover transition-all duration-500 ease-in-out will-change-transform ${
                isImageLoaded ? "scale-100" : "scale-95 blur-sm"
              } group-hover:scale-110`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400 font-medium">Chưa có ảnh</p>
          </div>
        )}
      </div>
  
      <div className="flex-1 px-4 pt-4 pb-4 flex flex-col justify-between bg-white">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 group-hover:text-amber-600 transition-colors duration-200">
            {product.name}
          </h3>
          <div className="mt-1 space-y-0.5">
            <p className="text-gray-500 text-xs flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mr-1.5" />
              {product.brand.name}
            </p>
            <p className="text-gray-500 text-xs flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mr-1.5" />
              {product.category.name}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <button className="w-full py-2 rounded-full text-white text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-700 opacity-90 group-hover:opacity-100 transform group-hover:scale-[1.02] transition-all duration-300 shadow-sm group-hover:shadow-md">
            {Number(product.minPrice).toLocaleString("vi-VN")}đ
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default ProductCard;
