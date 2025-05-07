import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { GrSearch } from "react-icons/gr";
import { GiCoffeeCup } from "react-icons/gi";

import { MdOutlineShoppingCart } from "react-icons/md";
import { PiUserCircle } from "react-icons/pi";
import { AiOutlineTrademark } from "react-icons/ai";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../store/userSlice";
import Cookies from "js-cookie";
import { message, Popconfirm } from "antd";
import { Badge } from "antd";
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
    message.success("Logout Successfully!");
  };


  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    if (searchTerm) {
      const query = encodeURIComponent(searchTerm);
      navigate(`/search?q=${query}`);
      setSearchTerm("");
    } else {
      navigate("/search");
    }
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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <header className="bg-gray-150 dark:bg-gray-900 px-6 py-4 fixed top-0 w-full z-20">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-16">
          {/* logo */}
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* search */}
        <div className="bg-white hidden w-full max-w-xs lg:flex items-center justify-between rounded-full border pl-2 focus-within:shadow h-9">
          <input
            type="text"
            placeholder="Search product here..."
            className="w-full outline-none px-3 text-sm"
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <div
            onClick={handleSearch}
            className="flex h-full min-w-[40px] items-center justify-center rounded-r-full cursor-pointer 
        text-white text-base bg-gradient-to-r from-amber-700 to-stone-500 transition-all 
        duration-500 ease-in-out bg-[length:200%_auto] hover:bg-[position:right_center]"
          >
            <GrSearch />
          </div>
        </div>

        {/* user */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center py-2 bg-transparent text-black font-semibold rounded cursor-pointer relative z-20 hover:underline" onClick={() => navigate('/about-we')}>
            <FaMapLocationDot />
            <label className="cursor-pointer px-2">Về chúng tôi</label>
          </div>
          <DropdownWithList title='Thương hiệu' Icon={AiOutlineTrademark}>
            <ListBrand />
          </DropdownWithList>
          <DropdownWithList title='Danh mục' Icon={GiCoffeeCup}>
            <ListCategory />
          </DropdownWithList>
          <div
            className="flex items-center space-x-4 relative"
            onMouseEnter={() => setShowCartTab(true)}
            onMouseLeave={() => setShowCartTab(false)}
          >
            <Link to="/cart">
              <div className="relative cursor-pointer text-2xl">
                <Badge count={totalQuantity} size="default" showZero>
                  <MdOutlineShoppingCart style={{ fontSize: "22px" }} />
                </Badge>
              </div>
            </Link>

            {showCartTab && (
              <div className="absolute top-10 -right-4 z-50 hidden md:block">
                <CartTab items={carts} />
              </div>
            )}
          </div>

          {user?.id ? (
            <Link to="/profile">
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
          ) : (
            <Link to="/login">
              <button className="rounded-full px-4 py-1 text-white text-sm shadow-md
          bg-gradient-to-r from-amber-700 to-stone-500 transition-all duration-300 
          ease-in-out bg-[length:200%_auto] hover:bg-[position:right_center]">
                Sign In
              </button>
            </Link>
          )}

          {user?.id && (
            <Popconfirm
              title="Đăng xuất khỏi hệ thống?"
              onConfirm={handleLogout} 
              okText="Đăng xuất"
              cancelText="Hủy"
            >
              <button
                className="rounded-full px-4 py-1 text-white text-sm shadow-md bg-gradient-to-r from-amber-700 to-stone-500 transition-all duration-300 ease-in-out bg-[length:200%_auto]
      hover:bg-[position:right_center]"
              >
                Logout
              </button>
            </Popconfirm>
          )}
        </div>
      </div>
    </header>

  );
};

export default Header;
