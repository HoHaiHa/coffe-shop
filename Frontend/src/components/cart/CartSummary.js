import React, { useMemo } from "react";
import { Card } from "antd";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { BsTag } from "react-icons/bs";
import { FaRegMoneyBillAlt } from "react-icons/fa";

const CartSummary = () => {
  const cartItems = useSelector((store) => store.cart.items);

  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => item.isSelected);
  }, [cartItems]);

  const subtotal = selectedItems
    ? selectedItems.reduce(
        (sum, item) => sum + item.productItemResponse.price * item.quantity,
        0
      )
    : 0;

  const discount = selectedItems
    ? selectedItems.reduce((sum, item) => {
        return sum + item.productItemResponse.discount * item.quantity;
      }, 0)
    : 0;

  const total = subtotal - discount;

  return (
    <Card className="bg-white rounded-2xl shadow-lg border-0">
      <div className="space-y-6">
        <div className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <HiOutlineShoppingBag className="text-amber-500" />
            <h3 className="font-medium">Tạm tính:</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">{selectedItems.length}</span>
            <span className="text-sm text-gray-500">sản phẩm</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <FaRegMoneyBillAlt className="text-amber-500" />
            <h3 className="font-medium">Giá tổng cộng:</h3>
          </div>
          <p className="font-medium text-gray-800">
            {Number(subtotal).toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <BsTag className="text-amber-500" />
            <h3 className="font-medium">Giảm giá:</h3>
          </div>
          <p className="font-medium text-green-600">
            - {Number(discount).toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Tổng cộng:</h3>
            <p className="text-lg sm:text-xl font-bold text-amber-600">
              {Number(total).toLocaleString("vi-VN")}đ
            </p>
          </div>
          
          <div className="mt-6">
            <Link to="/checkout">
              <button
                disabled={subtotal <= 0}
                className={`w-full py-3.5 px-6 rounded-full text-base font-medium transition-all duration-300 transform
                  ${
                    subtotal <= 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
                  }`}
              >
                {subtotal <= 0 ? "Chưa có sản phẩm được chọn" : "Tiếp tục thanh toán"}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Custom styles for Ant Design Card */}
      <style jsx global>{`
        .ant-card {
          border-radius: 1rem;
        }
        
        .ant-card-body {
          padding: 1.5rem;
        }
      `}</style>
    </Card>
  );
};

export default CartSummary;
