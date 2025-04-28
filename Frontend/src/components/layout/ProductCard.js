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
      className="min-h-80 bg-white rounded border p-3 overflow-hidden shadow-lg cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="border-b cursor-pointer">
        {product?.images?.[0]?.url ? (
          <div className="relative w-full h-36 md:h-40">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingOutlined className="text-3xl text-gray-400" spin />
              </div>
            )}
            <img
              className={`w-full rounded object-cover h-36 md:h-40 transition-opacity duration-300 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              }`}
              src={product.images[0].url}
              alt={product.name || "Product Image"}
              onLoad={handleImageLoad}
            />
          </div>
        ) : (
          <div className="w-full rounded bg-gray-200 flex items-center justify-center h-36 md:h-40">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="font-medium text-lg line-clamp-1">{product.name}</div>
        <p className="text-gray-400 font-normal mt-1">{product.brand.name}</p>
        <p className="text-gray-400 font-normal mt-1">{product.category.name}</p>
        <div className="flex items-center justify-between mt-2">
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="py-2 px-7 w-full text-center bg-gradient-to-r from-amber-700 to-stone-500 text-white rounded-full cursor-pointer transition-transform duration-300">
            <button>{Number(product.minPrice).toLocaleString("vi-VN")}đ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
