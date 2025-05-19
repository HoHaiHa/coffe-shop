import React from "react";
import { Badge, Avatar, Dropdown, Popconfirm, message } from "antd";
import { MdNotificationsNone, MdLogout, MdPerson } from "react-icons/md";
import { PiUserCircle } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../../store/userSlice";
import Cookies from "js-cookie";

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.user);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    localStorage.removeItem("shipping-address");
    dispatch(clearUser());
    navigate("/login");
    message.success("Đăng xuất thành công!");
  };

  return (
    <div className="w-full h-[60px] bg-white sticky top-0 z-[999]">
      <div className="h-full px-6 flex items-center justify-between border-b">
        {/* Logo and Brand */}
        <Link to="/admin" className="flex items-center space-x-2">
          <div className="font-bold text-2xl bg-gradient-to-r from-[#596ecd] to-[#7b8ed8] bg-clip-text text-transparent">
            {user?.roleName === 'ROLE_ADMIN' ? 'HacafeAdmin' : 'HacafeStaff'}
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* User Profile */}
          <Link 
            to="/admin/profile"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
          >
            <div className="relative">
              {user?.profile_img ? (
                <Avatar
                  src={user.profile_img}
                  size={36}
                  className="border-2 border-[#596ecd]/20"
                />
              ) : (
                <Avatar
                  size={36}
                  icon={<MdPerson />}
                  className="bg-[#596ecd]/10 text-[#596ecd] border-2 border-[#596ecd]/20"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user?.fullName }
              </span>
              <span className="text-xs text-gray-500">
                {user?.roleName === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
              </span>
            </div>
          </Link>

          {/* Logout Button */}
          <Popconfirm
            title="Đăng xuất khỏi hệ thống?"
            description="Bạn có chắc chắn muốn đăng xuất?"
            onConfirm={handleLogout}
            okText="Đăng xuất"
            cancelText="Hủy"
            okButtonProps={{
              className: 'bg-[#596ecd] hover:bg-[#596ecd]/90'
            }}
          >
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-[#596ecd] hover:bg-[#596ecd]/90 transition-all duration-200 shadow-sm hover:shadow"
            >
              <MdLogout className="text-lg" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
};

export default Topbar; 