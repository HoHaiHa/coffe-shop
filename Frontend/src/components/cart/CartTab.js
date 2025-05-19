import React from "react";
import image1 from "../../assets/img/empty.jpg";
import { Link, useLocation } from "react-router-dom";
import cartEmpty from "../../assets/img/cart-empty.jpg";
import { motion } from "framer-motion";

const CartTab = ({ items }) => {
  const location = useLocation();
  const isInCartPage = location.pathname === "/cart";
  const validItems = items.filter((item) => item.productItemResponse);
  const isInProductDetailPage = location.pathname.startsWith("/product/");
  const shouldHideCartTab = isInCartPage || isInProductDetailPage;

  const displayedItems = validItems.slice(0, 4);
  const remainingItemsCount = validItems.length - displayedItems.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={`relative p-6 bg-white rounded-2xl shadow-xl md:w-[340px] lg:w-[400px] ${
        shouldHideCartTab ? "hidden" : ""
      }`}
    >
      <div className="absolute top-0 right-6 w-4 h-4 bg-white rotate-45 transform -translate-y-1/2 shadow-[-2px_-2px_3px_-1px_rgba(0,0,0,0.05)]"></div>

      {displayedItems.length <= 0 ? (
        <div className="text-center py-6">
          <img src={cartEmpty} alt="Cart Empty" className="w-48 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Giỏ hàng của bạn đang trống</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Giỏ Hàng</h2>
            <span className="px-3 py-1 text-sm bg-amber-50 text-amber-600 rounded-full font-medium">
              {validItems.length} sản phẩm
            </span>
          </div>
          
          <ul className="space-y-4 mb-6">
            {displayedItems.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/product/${item.productItemResponse.productResponse.id}`}>
                  <div className="grid grid-cols-4 gap-4 items-center p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className="col-span-1">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 group-hover:border-amber-200 transition-colors duration-200">
                        <img 
                          src={item.productItemResponse.productResponse.images[0]?.url || image1} 
                          alt="Product"
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300" 
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-700 line-clamp-2 group-hover:text-amber-600 transition-colors duration-200">
                        {item.productItemResponse.productResponse.name}
                      </h3>
                    </div>

                    <div className="col-span-1 text-right">
                      <span className="font-semibold text-sm text-amber-600">
                        {Number(item.productItemResponse.price).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </>
      )}

      {remainingItemsCount > 0 && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 bg-gray-50 py-2 px-4 rounded-full inline-block">
            +{remainingItemsCount} sản phẩm khác trong giỏ hàng
          </p>
        </div>
      )}

      {displayedItems.length > 0 && (
        <Link to="/cart">
          <button className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 
                           text-white text-sm font-medium rounded-full transition-all duration-300 
                           transform hover:scale-[1.02] hover:shadow-lg">
            Xem Giỏ Hàng
          </button>
        </Link>
      )}
    </motion.div>
  );
};

export default CartTab;
