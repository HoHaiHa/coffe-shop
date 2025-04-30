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
      className="h-80 bg-white rounded-xl border overflow-hidden shadow-lg cursor-pointer flex flex-col group"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-2/3 overflow-hidden">
        {product?.images?.[0]?.url ? (
          <>
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                <LoadingOutlined className="text-3xl text-gray-400" spin />
              </div>
            )}
            <img
              src={product.images[0].url}
              alt={product.name || "Product Image"}
              onLoad={handleImageLoad}
              className={`w-full h-full object-cover transition-transform duration-[500ms] ease-in-out will-change-transform ${
                isImageLoaded ? "scale-100" : "scale-95"
              } group-hover:scale-125 rounded-xl`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>
  
      <div className="-mt-4 px-4 pt-4 pb-3 flex flex-col justify-between bg-white rounded-xl z-10">
        <div>
          <div className="font-medium text-sm line-clamp-1">{product.name}</div>
          <p className="text-gray-400 text-xs mt-0.5">{product.brand.name}</p>
          <p className="text-gray-400 text-xs">{product.category.name}</p>
        </div>
        <div className="mt-2">
          <button className="w-full py-1.5 rounded-full text-white text-sm bg-opacity-70 bg-amber-700 group-hover:bg-opacity-100 group-hover:scale-105 transition-all duration-300">
            {Number(product.minPrice).toLocaleString("vi-VN")}đ
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default ProductCard;
