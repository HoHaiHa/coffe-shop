import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { GrSearch } from "react-icons/gr";
import { GiCoffeeCup } from "react-icons/gi";
import { MdOutlineShoppingCart, MdLogout } from "react-icons/md";
import { PiUserCircle } from "react-icons/pi";
import { AiOutlineTrademark } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../store/userSlice";
import Cookies from "js-cookie";
import { message, Popconfirm, Tooltip, Badge } from "antd";
import { clearCart } from "../../store/cartSlice";
import { clearFavorites } from "../../store/favoritesSlice ";
import CartTab from "../cart/CartTab";
import { clearAddress } from "../../store/shippingAddressSlice ";
import DropdownWithList from "./DropdownWithList";
import ListCategory from "../homepage/ListCategory";
import ListBrand from "../homepage/ListBrand";
import { FaMapLocationDot } from "react-icons/fa6";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.user);
  const carts = useSelector((store) => store.cart.items);
  const loading = useSelector((state) => state.user.loading);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [showCartTab, setShowCartTab] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    Cookies.remove("cart-item-list");
    localStorage.removeItem("shipping-address");
    dispatch(clearUser());
    dispatch(clearCart());
    dispatch(clearFavorites());
    dispatch(clearAddress());
    navigate("/");
    message.success("Đăng xuất thành công!");
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
      const query = encodeURIComponent(searchTerm);
      navigate(`/search?q=${query}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const total = carts.length;
    setTotalQuantity(total);
  }, [carts, user]);

  // Lấy giá trị q từ URL và đồng bộ với input search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";
    setSearchTerm(query);
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-20 backdrop-blur-sm bg-white/90">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 transform hover:scale-105 transition-transform duration-200">
              <Logo />
            </Link>

            {/* Categories and Brands Dropdowns */}
            <div className="hidden md:flex items-center space-x-6">
              <DropdownWithList 
                title='Danh mục' 
                Icon={GiCoffeeCup}
                className="group flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-all duration-200 font-medium"
              >
                <ListCategory />
              </DropdownWithList>
              
              <DropdownWithList 
                title='Thương hiệu' 
                Icon={AiOutlineTrademark}
                className="group flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-all duration-200 font-medium"
              >
                <ListBrand />
              </DropdownWithList>
            </div>
          </div>

          {/* Center Section: Search */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full h-11 pl-5 pr-12 rounded-full border-2 border-gray-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 bg-gray-50/50"
                value={searchTerm}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSearch}
                className="absolute right-0 top-0 h-full px-5 flex items-center justify-center text-gray-400 hover:text-amber-600 transition-colors duration-200"
              >
                <GrSearch className="text-lg" />
              </button>
            </div>
          </div>

          {/* Right Section: Nav Items */}
          <div className="flex items-center space-x-6">
            {/* About Us */}
            <Tooltip title="Về chúng tôi">
              <Link 
                to="/about-we"
                className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-all duration-200 group"
              >
                <FaMapLocationDot className="text-lg group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">Về chúng tôi</span>
              </Link>
            </Tooltip>

            {/* Cart */}
            <div
              className="relative transform hover:scale-105 transition-transform duration-200"
              onMouseEnter={() => setShowCartTab(true)}
              onMouseLeave={() => setShowCartTab(false)}
            >
              <Link to="/cart">
                <Badge 
                  count={totalQuantity} 
                  size="small"
                  className="cursor-pointer"
                  style={{ backgroundColor: '#c2410c' }}
                >
                  <MdOutlineShoppingCart className="text-2xl text-gray-600 hover:text-amber-600 transition-colors duration-200" />
                </Badge>
              </Link>
              {showCartTab && (
                <div className="absolute top-full right-0 pt-2 z-50 hidden md:block">
                  <CartTab items={carts} />
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user?.id ? (
                <>
                  <Link 
                    to="/profile"
                    className="flex items-center space-x-2 py-1.5 px-4 rounded-full hover:bg-gray-50/80 transition-all duration-200 group"
                  >
                    {user?.profile_img ? (
                      <img
                        src={user.profile_img}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full border-2 border-amber-500/20 group-hover:border-amber-500/40 transition-colors duration-200"
                      />
                    ) : (
                      <PiUserCircle className="text-2xl text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Tài khoản</span>
                  </Link>

                  <Popconfirm
                    title="Đăng xuất khỏi hệ thống?"
                    description="Bạn có chắc chắn muốn đăng xuất?"
                    onConfirm={handleLogout}
                    okText="Đăng xuất"
                    cancelText="Hủy"
                    okButtonProps={{
                      className: 'bg-gradient-to-r from-amber-600 to-amber-700 border-none hover:opacity-90'
                    }}
                  >
                    <button className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-white bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105">
                      <MdLogout className="text-lg" />
                      <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                  </Popconfirm>
                </>
              ) : (
                <Link to="/login">
                  <button className="px-6 py-2.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105">
                    Đăng nhập
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
