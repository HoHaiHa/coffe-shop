import React from "react";
import { Badge, Avatar, Dropdown, Popconfirm, message } from "antd";
import { MdNotificationsNone, MdLanguage, MdSettings } from "react-icons/md";
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
    <div className="w-full h-[60px] bg-white sticky top-0 z-[999] shadow-sm">
      <div className="h-full px-5 flex items-center justify-between">
        <div className="font-bold text-2xl text-blue-700 cursor-pointer">
          HacafeAdmin
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/admin/profile">
            <div className="relative flex cursor-pointer justify-center text-2xl">
              {user?.profile_img ? (
                <img
                  src={user?.profile_img}
                  alt="Avatar User"
                  className="w-8 h-8 object-cover rounded-full"
                />
              ) : (
                <PiUserCircle />
              )}
            </div>
          </Link>

          <div>
            <Popconfirm
              title="Đăng xuất khỏi hệ thống?"
              onConfirm={handleLogout}
              okText="Đăng xuất"
              cancelText="Hủy"
            >
              <button
                className="rounded-full px-5 py-1 text-white text-lg shadow-lg bg-gradient-to-r from-amber-700 to-stone-500 transition-all duration-500 ease-in-out bg-[length:200%_auto]
                hover:bg-[position:right_center]"
              >
                Logout
              </button>
            </Popconfirm>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
