import React from "react";
import {
  MdPermIdentity,
  MdStore,
  MdBarChart,
  MdChatBubbleOutline,
} from "react-icons/md";
import { LiaClipboardListSolid } from "react-icons/lia";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const user = useSelector((state) => state.user.user, (prev, next) => prev === next);

  return (
    <div className="flex-1 bg-white h-[calc(100vh-60px)] sticky w-[254.663px] border-r border-gray-100">
      <div className="p-6 text-gray-600">
        {/* Quick Menu */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#596ecd] mb-4 px-3">
            Trang quản trị
          </h3>
          <ul className="space-y-1">
            <NavLink
              to="users"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-3 py-2.5 rounded-lg bg-[#596ecd] text-white font-medium transition-all duration-200"
                  : "flex items-center px-3 py-2.5 rounded-lg hover:bg-[#596ecd]/10 text-gray-600 hover:text-[#596ecd] font-medium transition-all duration-200"
              }
            >
              <MdPermIdentity className="text-xl mr-3" />
              Người dùng
            </NavLink>

            <NavLink
              to="products"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-3 py-2.5 rounded-lg bg-[#596ecd] text-white font-medium transition-all duration-200"
                  : "flex items-center px-3 py-2.5 rounded-lg hover:bg-[#596ecd]/10 text-gray-600 hover:text-[#596ecd] font-medium transition-all duration-200"
              }
            >
              <MdStore className="text-xl mr-3" />
              Sản phẩm
            </NavLink>

            <NavLink
              to="brands"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-3 py-2.5 rounded-lg bg-[#596ecd] text-white font-medium transition-all duration-200"
                  : "flex items-center px-3 py-2.5 rounded-lg hover:bg-[#596ecd]/10 text-gray-600 hover:text-[#596ecd] font-medium transition-all duration-200"
              }
            >
              <MdStore className="text-xl mr-3" />
              Nhãn hàng
            </NavLink>

            <NavLink
              to="categories"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-3 py-2.5 rounded-lg bg-[#596ecd] text-white font-medium transition-all duration-200"
                  : "flex items-center px-3 py-2.5 rounded-lg hover:bg-[#596ecd]/10 text-gray-600 hover:text-[#596ecd] font-medium transition-all duration-200"
              }
            >
              <MdStore className="text-xl mr-3" />
              Danh mục
            </NavLink>

            <NavLink
              to="orders"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-3 py-2.5 rounded-lg bg-[#596ecd] text-white font-medium transition-all duration-200"
                  : "flex items-center px-3 py-2.5 rounded-lg hover:bg-[#596ecd]/10 text-gray-600 hover:text-[#596ecd] font-medium transition-all duration-200"
              }
            >
              <LiaClipboardListSolid className="text-xl mr-3" />
              Đơn hàng
            </NavLink>

            <NavLink
              to="statistics"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-3 py-2.5 rounded-lg bg-[#596ecd] text-white font-medium transition-all duration-200"
                  : "flex items-center px-3 py-2.5 rounded-lg hover:bg-[#596ecd]/10 text-gray-600 hover:text-[#596ecd] font-medium transition-all duration-200"
              }
            >
              <MdBarChart className="text-xl mr-3" />
              Thống kê
            </NavLink>
          </ul>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#596ecd] mb-4 px-3">
            Thông báo
          </h3>
          <ul className="space-y-1">
            <NavLink
              to="messages"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-3 py-2.5 rounded-lg bg-[#596ecd] text-white font-medium transition-all duration-200"
                  : "flex items-center px-3 py-2.5 rounded-lg hover:bg-[#596ecd]/10 text-gray-600 hover:text-[#596ecd] font-medium transition-all duration-200"
              }
            >
              <MdChatBubbleOutline className="text-xl mr-3" />
              Tin nhắn
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 