import React, { useEffect, useState } from "react";
import { InputNumber, Button, Checkbox } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import fetchWithAuth from "../../helps/fetchWithAuth";
import summaryApi from "../../common";
import { useDispatch } from "react-redux";
import {
  addToCart,
  toggleSelected,
  removeFromCart,
} from "../../store/cartSlice";
import { RiDeleteBin6Line } from "react-icons/ri";
import { message } from "antd";
import image1 from "../../assets/img/empty.jpg";
import { Link, useLocation } from "react-router-dom";

const CartItems = ({ cartItems, isCheckingOut }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [errorItemId, setErrorItemId] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const newCartItems =  cartItems.filter((item) => item.quantity <= item.productItemResponse.stock )

  const handleQuantityChange = (value, item) => {
    if (value < 1) {  
      triggerError(item);
    } else {
      if(value > item.productItemResponse.stock) {
        value =  item.productItemResponse.stock;
      }
      const updatedItem = { ...item, quantity: value };
      setErrorItemId(null);
      try {
        if (updatedCartItems(updatedItem)) {
          dispatch(addToCart(updatedItem));
        } else console.log("update false");
      } catch (error) {
        toast.error("Lỗi khi cập nhật sản phẩm");
      }
    }
  };
  const updatedCartItems = async (item) => {
    try {
      const response = await fetchWithAuth(summaryApi.updateCartItem.url, {
        method: summaryApi.updateCartItem.method,
        body: JSON.stringify({
          Quantity: item.quantity,
          ProductItemId: item.productItemResponse.id,
          UserId: item.userId,
        }),
      });
      const result = await response.json();
      if (result.respCode === "000") {
        return true;
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật sản phẩm");
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    }
    return false;
  };

  const triggerError = (item) => {
    setErrorItemId(item.id);
    setTimeout(() => setErrorItemId(null), 500);
  };

  const handleDeleteCartItem = async (itemId) => {
    try {
      const response = await fetchWithAuth(
        summaryApi.deleteCartItem.url + itemId,
        {
          method: summaryApi.deleteCartItem.method,
        }
      );
      const result = await response.json();
      if (result.respCode === "000") {
        message.success("Xóa sản phẩm thành công");
        dispatch(removeFromCart(itemId));
      }
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm");
      console.error("Error delete cart item:", error);
    }
  };

  const handleSelectItem = (item) => {
    setSelectAll(false);
    dispatch(toggleSelected({ itemId: item.id }));
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    dispatch(toggleSelected({ isSelected: !selectAll }));
  };

  useEffect(() => {
   
    if (newCartItems.length === 0) {
      setSelectAll(false); 
      return;
    }
    const allSelected = newCartItems.every(
      (cartItem) =>  cartItem.isSelected === true
    );
    setSelectAll(allSelected && newCartItems.length > 0);
  }, [newCartItems]);

  useEffect(() => {
    cartItems.forEach((item) => {
      if (item.quantity > item.productItemResponse.stock && item.selected) {
        dispatch(toggleSelected({ itemId: item.id }));
      }
    });
  }, [cartItems, dispatch]); 

  return (
    <div className="space-y-6">
      {location.pathname === "/cart" && (
        <div className="bg-white rounded-xl shadow-md py-4 px-6">
          <div className="flex items-center font-medium text-gray-600">
            <div className="w-1/12 flex justify-center">
              <Checkbox
                type="checkbox"
                className="w-4 h-4 accent-amber-600"
                checked={selectAll}
                disabled={newCartItems.length === 0}
                onChange={handleSelectAll}
              />
            </div>
            <div className="w-5/12 flex justify-start">Sản Phẩm</div>
            <div className="sm:w-1/12 w-0 justify-start hidden sm:flex">Đơn Giá</div>
            <div className="w-3/12 flex justify-center">Số Lượng</div>
            <div className="w-2/12 sm:w-1/12 flex justify-start">Số Tiền</div>
            <div className="w-1/12 flex justify-start">Thao Tác</div>
          </div>
        </div>
      )}

      {cartItems.map((item) => (
        <div
          key={item.id}
          className="bg-white shadow-lg rounded-xl py-6 px-6 transform transition-all duration-300 hover:shadow-xl"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-row items-center justify-between">
              <div className="w-1/12 flex justify-center">
                <Checkbox
                  checked={item.isSelected || (item.quantity <= item.productItemResponse.stock && selectAll)}
                  onClick={() => handleSelectItem(item)}
                  disabled={isCheckingOut || item.quantity > item.productItemResponse.stock}
                  className="accent-amber-600 transform scale-110"
                />
              </div>
              <div className="w-5/12">
                <Link to={`/product/${item.productItemResponse.productResponse.id}`}>
                  <div className="flex flex-col items-start sm:flex-row sm:space-x-4 sm:items-center group">
                    <div className="relative overflow-hidden rounded-xl border border-gray-100 group-hover:border-amber-200 transition-colors duration-200">
                      <img
                        src={item.productItemResponse.productResponse.images[0]?.url || image1}
                        alt={item.productItemResponse.productResponse.name}
                        className="w-12 h-12 sm:w-20 sm:h-20 object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <h2 className="text-sm sm:text-lg font-semibold text-gray-800 line-clamp-1 group-hover:text-amber-600 transition-colors duration-200">
                        {item.productItemResponse.productResponse.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Loại: {item.productItemResponse.type.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 hidden sm:block mt-1">
                        Danh mục: {item.productItemResponse.productResponse.category.name}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="w-1/12 text-sm sm:text-base font-medium hidden sm:block">
                {item.productItemResponse.discount ? (
                  <div className="flex flex-col justify-center">
                    <p className="text-amber-600">
                      {Number(item.productItemResponse.price - item.productItemResponse.discount).toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-gray-400 line-through text-sm">
                      {Number(item.productItemResponse.price).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                ) : (
                  <p className="text-amber-600">
                    {Number(item.productItemResponse.price).toLocaleString("vi-VN")}đ
                  </p>
                )}
              </div>

              <div className="w-3/12 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    type="default"
                    icon={<MinusOutlined />}
                    onClick={() => handleQuantityChange(item.quantity - 1, item)}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-200 hover:border-amber-500 hover:text-amber-600 transition-colors duration-200"
                    disabled={item.quantity === 1}
                  />
                  <InputNumber
                    min={1}
                    max={item.productItemResponse.stock}
                    value={item.quantity}
                    onChange={(value) => handleQuantityChange(value, item)}
                    className={`sm:w-16 w-12 h-8 sm:h-9 text-center transition-all duration-300 ${
                      errorItemId === item.id
                        ? "border-red-500 animate-shake"
                        : "border-gray-200 hover:border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    }`}
                  />
                  <Button
                    type="default"
                    icon={<PlusOutlined />}
                    onClick={() => handleQuantityChange(item.quantity + 1, item)}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-200 hover:border-amber-500 hover:text-amber-600 transition-colors duration-200"
                    disabled={item.quantity >= item.productItemResponse.stock}
                    title={
                      item.quantity >= item.productItemResponse.stock
                        ? "Đã đạt số lượng tối đa"
                        : ""
                    }
                  />
                </div>
              </div>

              <div className="w-2/12 sm:w-1/12 flex justify-start font-medium text-amber-600">
                {Number(
                  (item.productItemResponse.price - (item.productItemResponse.discount || 0)) *
                    item.quantity
                ).toLocaleString("vi-VN")}đ
              </div>

              <div className="w-1/12 flex justify-start">
                <button
                  onClick={() => handleDeleteCartItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <RiDeleteBin6Line className="text-xl" />
                </button>
              </div>
            </div>

            {item.quantity > item.productItemResponse.stock && (
              <div className="ml-[8.33%] text-red-500 text-sm">
                Số lượng vượt quá hàng trong kho ({item.productItemResponse.stock})
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Custom styles for Ant Design components */}
      <style jsx global>{`
        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #d97706;
          border-color: #d97706;
        }
        
        .ant-checkbox:hover .ant-checkbox-inner {
          border-color: #d97706;
        }
        
        .ant-input-number:hover, 
        .ant-input-number:focus {
          border-color: #d97706;
        }
        
        .ant-input-number-focused {
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1);
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CartItems;
