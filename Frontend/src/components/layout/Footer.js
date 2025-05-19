import React from 'react';
import { Link } from 'react-router-dom';
import Logo from "./Logo";
import { FaFacebookF, FaYoutube, FaTiktok, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-50 px-6 md:px-12 py-16 text-gray-600">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Footer column 1 */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center space-x-2 mb-6 transform hover:scale-105 transition-transform duration-200">
            <Logo />
          </Link>
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li>
                <p className="text-gray-500 mb-1">Email:</p>
                <Link to="mailto:contact@grocerymart.com" className="text-amber-600 hover:text-amber-700 transition-colors duration-200">
                  contact@hacafe.com.vn
                </Link>
              </li>
              <li>
                <p className="text-gray-500 mb-1">Số điện thoại:</p>
                <Link to="tel:18008888" className="text-amber-600 hover:text-amber-700 transition-colors duration-200">
                  0386331426
                </Link>
              </li>
              <li>
                <p className="text-gray-500 mb-1">Thời gian:</p>
                <p className="font-medium">08:00 - 22:00</p>
              </li>
            </ul>
          </div>
          <div className="pt-4">
            <p className="text-gray-500 mb-4">
              Nhận tin tức và cập nhật về sản phẩm.
            </p>
            <form action="" className="flex items-center">
              <input
                type="text"
                className="flex-1 p-3 bg-white border border-gray-200 rounded-l-full focus:outline-none focus:border-amber-500 transition-colors duration-200"
                placeholder="Email của bạn"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-r-full hover:from-amber-600 hover:to-amber-800 transition-all duration-300 shadow-sm hover:shadow-md">
                Gửi
              </button>
            </form>
          </div>
        </div>

        {/* Footer column 2 */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-6">Hỗ trợ</h3>
          <ul className="space-y-3">
            <li>
              <Link to="#!" className="hover:text-amber-600 transition-colors duration-200">
                Địa điểm cửa hàng
              </Link>
            </li>
            <li>
              <Link to="#!" className="hover:text-amber-600 transition-colors duration-200">
                Trạng thái giao hàng
              </Link>
            </li>
          </ul>
        </div>

        {/* Footer column 3 */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-6">Cửa hàng</h3>
          <ul className="space-y-3">
            <li><Link to="#!" className="hover:text-amber-600 transition-colors duration-200">Chăm sóc khách hàng</Link></li>
            <li><Link to="#!" className="hover:text-amber-600 transition-colors duration-200">Điều khoản sử dụng</Link></li>
            <li><Link to="#!" className="hover:text-amber-600 transition-colors duration-200">Chính sách</Link></li>
            <li><Link to="#!" className="hover:text-amber-600 transition-colors duration-200">Tuyển dụng</Link></li>
            <li><Link to="#!" className="hover:text-amber-600 transition-colors duration-200">Về chúng tôi</Link></li>
            <li><Link to="#!" className="hover:text-amber-600 transition-colors duration-200">Hợp tác</Link></li>
          </ul>
        </div>

        {/* Footer column 4 */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-6">Địa chỉ</h3>
          <ul className="space-y-3">
            <li className="space-y-2">
              <p className="hover:text-amber-600 transition-colors duration-200 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500/60 mr-2" />
                Số 11, đường Hồ Tùng mậu, Cầu Giấy, Hà Nội
              </p>
              <p className="hover:text-amber-600 transition-colors duration-200 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500/60 mr-2" />
                Số 18, đường Quảng Bá, Tây Hồ, Hà nội
              </p>
              <p className="hover:text-amber-600 transition-colors duration-200 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500/60 mr-2" />
                Số 22B, đường Nguyễn Huệ, Quận 1, TP.HCM
              </p>
              <p className="hover:text-amber-600 transition-colors duration-200 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500/60 mr-2" />
                Số 79, đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM
              </p>
              <p className="hover:text-amber-600 transition-colors duration-200 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500/60 mr-2" />
                Số 15, đường Lê Mao, thành phố Vinh, Nghệ An
              </p>
              <p className="hover:text-amber-600 transition-colors duration-200 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500/60 mr-2" />
                Số 48, đường Bạch Đằng, quận Hải Châu, Đà Nẵng
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-500">© 2010 - 2025 Grocery Mart. Mọi quyền được bảo lưu.</p>
        <div className="flex space-x-6 mt-6 md:mt-0">
          <Link to="#!" className="text-gray-400 hover:text-amber-600 transition-colors duration-200 transform hover:scale-110">
            <FaFacebookF className="text-xl" />
          </Link>
          <Link to="#!" className="text-gray-400 hover:text-amber-600 transition-colors duration-200 transform hover:scale-110">
            <FaYoutube className="text-xl" />
          </Link>
          <Link to="#!" className="text-gray-400 hover:text-amber-600 transition-colors duration-200 transform hover:scale-110">
            <FaTiktok className="text-xl" />
          </Link>
          <Link to="#!" className="text-gray-400 hover:text-amber-600 transition-colors duration-200 transform hover:scale-110">
            <FaTwitter className="text-xl" />
          </Link>
          <Link to="#!" className="text-gray-400 hover:text-amber-600 transition-colors duration-200 transform hover:scale-110">
            <FaLinkedinIn className="text-xl" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
