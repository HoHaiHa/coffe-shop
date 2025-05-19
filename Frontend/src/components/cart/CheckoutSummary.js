import React, { useEffect, useMemo } from "react";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import summaryApi from "../../common";
import fetchWithAuth from "../../helps/fetchWithAuth";
import { Radio } from "antd";
import { HiOutlineShoppingBag, HiOutlineTruck } from "react-icons/hi";
import { BsTag } from "react-icons/bs";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";

const CheckoutSummary = ({ selectedAddress }) => {
  const cartItems = useSelector((store) => store.cart.items);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shipping, setShipping] = useState(0);
  
  const navigate = useNavigate();

  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => item.isSelected);
  }, [cartItems]);

  useEffect(() => {
    if (selectedAddress) {
      setShipping(10000);
    } else {
      setShipping(0);
    }
  }, [selectedAddress]);

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

  const total = subtotal + shipping - discount;

  const handleCheckout = async () => {
    const order = {
      OrderItems: selectedItems.map((item) => ({
        ProductItemId: item.productItemResponse.id,
        Amount: item.quantity,
        Price: item.productItemResponse.price,
        Discount: item.productItemResponse.discount,
      })),
      ShippingAddressId: selectedAddress,
      PaymentMethod: paymentMethod,
    };

    localStorage.setItem("order", JSON.stringify(order));

    try {
      if (paymentMethod === "COD") {
        navigate("/order-status?status=success");
      } else if (paymentMethod === "VNPay") {
        const createOnlinePayment = await fetchWithAuth(
          summaryApi.createOnlinePayment.url + `?amount=${total}`,
          {
            method: summaryApi.createOnlinePayment.method,
          }
        );

        const response = await createOnlinePayment.json();
        if (response.respCode === "000") {
          window.location.href = response.data.URL;
        } else {
          navigate("/order-status?status=fail");
        }
      }
    } catch (error) {}
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg border-0">
      <div className="space-y-6">
        <div className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <HiOutlineShoppingBag className="text-amber-500 text-xl" />
            <h3 className="font-medium">Tạm tính:</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">{selectedItems.length}</span>
            <span className="text-sm text-gray-500">sản phẩm</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <FaRegMoneyBillAlt className="text-amber-500 text-xl" />
            <h3 className="font-medium">Giá tổng cộng:</h3>
          </div>
          <p className="font-medium text-gray-800">
            {Number(subtotal).toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <HiOutlineTruck className="text-amber-500 text-xl" />
            <h3 className="font-medium">Phí giao hàng:</h3>
          </div>
          <p className="font-medium text-gray-800">
            {Number(shipping).toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center space-x-2 text-gray-700">
            <BsTag className="text-amber-500 text-xl" />
            <h3 className="font-medium">Giảm giá:</h3>
          </div>
          <p className="font-medium text-green-600">
            - {Number(discount).toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Tổng cộng:</h3>
            <p className="text-lg sm:text-xl font-bold text-amber-600">
              {Number(total).toLocaleString("vi-VN")}đ
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-800">
              <MdPayment className="text-amber-500 text-xl" />
              <h3 className="font-bold">Phương thức thanh toán:</h3>
            </div>
            
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="flex flex-col space-y-3"
            >
              <Radio value="COD" className="payment-radio">
                <div className="ml-2">
                  <p className="font-medium text-gray-800">Thanh toán khi nhận hàng</p>
                  <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                </div>
              </Radio>
              <Radio value="VNPay" className="payment-radio">
                <div className="ml-2">
                  <p className="font-medium text-gray-800">Thanh toán online (VNPay)</p>
                  <p className="text-sm text-gray-500">Thanh toán an toàn qua cổng VNPay</p>
                </div>
              </Radio>
            </Radio.Group>
          </div>

          <div className="mt-8">
            <button
              disabled={subtotal <= 0 || !selectedAddress}
              className={`w-full py-4 px-6 rounded-full text-base font-medium transition-all duration-300 transform
                ${
                  subtotal <= 0 || !selectedAddress
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
                }`}
              onClick={handleCheckout}
            >
              {subtotal <= 0 || !selectedAddress ? "Vui lòng chọn địa chỉ giao hàng" : "Tiến hành thanh toán"}
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles for Ant Design components */}
      <style jsx global>{`
        .ant-card {
          border-radius: 1rem;
        }
        
        .ant-card-body {
          padding: 1.5rem;
        }

        .ant-radio-wrapper {
          margin-right: 0;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
        }

        .ant-radio-wrapper:hover {
          background-color: #fef3c7;
        }

        .ant-radio-checked .ant-radio-inner {
          border-color: #d97706 !important;
          background-color: #d97706 !important;
        }

        .ant-radio:hover .ant-radio-inner {
          border-color: #d97706 !important;
        }
      `}</style>
    </Card>
  );
};

export default CheckoutSummary;
