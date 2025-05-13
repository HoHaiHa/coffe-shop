import React from 'react';
import { Link } from 'react-router-dom';
import Logo from "./Logo";
import { FaFacebookF, FaYoutube, FaTiktok, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-150 dark:bg-gray-900 px-12 py-10 text-gray-700 dark:text-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Footer column 1 */}
        <div>
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <Logo />
          </Link>
          <h3 className="font-semibold mb-4">Liên hệ</h3>
          <ul className="space-y-2">
            <li><p>Email:</p><Link to="mailto:contact@grocerymart.com" className="hover:underline">contact@hacafe.com.vn</Link></li>
            <li><p>Số điện thoại:</p><Link to="tel:18008888" className="hover:underline">0386331426</Link></li>
            <li><p>Thời gian:</p><p>08:00 - 22:00</p></li>
          </ul>
          <p className="mb-4 text-gray-500 dark:text-gray-400 mt-8">
            Nhận tin tức và cập nhật về sản phẩm.
          </p>

          <form action="" className="flex items-center">
            <input
              type="text"
              className="p-2 pl-4 w-full bg-gray-800 dark:bg-gray-200 rounded-md text-white dark:text-gray-800 placeholder-gray-400"
              placeholder="Email address"
            />
            <button className="p-2 bg-gradient-to-r from-amber-700 to-stone-500 text-white rounded-md ml-2">Gửi</button>
          </form>
        </div>

        {/* Footer column 2 */}
        <div>
          <h3 className="font-semibold mb-4">Hỗ trợ</h3>
          <ul className="space-y-2">
            <li><Link to="#!" className="hover:underline">Địa điểm cửa hàng</Link></li>
            <li><Link to="#!" className="hover:underline">Trạng thái giao hàng</Link></li>
          </ul>
        </div>

        {/* Footer column 3 */}
        <div>
          <h3 className="font-semibold mb-4">Cửa hàng</h3>
          <ul className="space-y-2">
            <li><Link to="#!" className="hover:underline">Chăm sóc khách hàng</Link></li>
            <li><Link to="#!" className="hover:underline">Điều khoản sử dụng</Link></li>
            <li><Link to="#!" className="hover:underline">Chính sách</Link></li>
            <li><Link to="#!" className="hover:underline">Tuyển dụng</Link></li>
            <li><Link to="#!" className="hover:underline">Về chúng tôi</Link></li>
            <li><Link to="#!" className="hover:underline">Hợp tác</Link></li>
          </ul>
        </div>

        {/* Footer column 4 */}
        <div>
          <h3 className="font-semibold mb-4">Địa chỉ</h3>
          <ul className="space-y-2">
            <li>
              <p>Số 11, đường Hồ Tùng mậu, Cầu Giấy, Hà Nội</p>
              <p>Số 18,đường Quảng Bá, Tây Hồ, Hà nội",</p>
              <p>Số 22B,đường Nguyễn Huệ, Quận 1, Thành Phố Hồ Chí Minh</p>
              <p>Số 79,đường Nguyễn Thị Minh Khai, Quận 3, Thành Phố Hồ Chí Minh</p>
              <p>Số 15, đường Lê Mao, thành phố Vinh, Nghệ An</p>
              <p>Số 48, đường Bạch Đằng, quận Hải Châu, Đà Nẵng</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-gray-500 dark:text-gray-400">
        <p>© 2010 - 2025 Grocery Mart. Mọi quyền được bảo lưu.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link to="#!" className="hover:text-gray-800 dark:hover:text-gray-300"><FaFacebookF /></Link>
          <Link to="#!" className="hover:text-gray-800 dark:hover:text-gray-300"><FaYoutube /></Link>
          <Link to="#!" className="hover:text-gray-800 dark:hover:text-gray-300"><FaTiktok /></Link>
          <Link to="#!" className="hover:text-gray-800 dark:hover:text-gray-300"><FaTwitter /></Link>
          <Link to="#!" className="hover:text-gray-800 dark:hover:text-gray-300"><FaLinkedinIn /></Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
