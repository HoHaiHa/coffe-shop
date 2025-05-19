import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { VscLock } from "react-icons/vsc";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { clearEmail } from "../store/forgotPasswordSlice";
import summaryApi from "../common";
import PasswordInput from "../components/validateInputForm/PasswordInput";
import img_login from "../assets/img/img-login.png";

function ChangePassword() {
  const email = useSelector((state) => state.forgotPassword.email);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState({
    password: "",
    repeatPassword: "",
  });

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setError(false);
    setData((pre) => ({
      ...pre,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (data.password === data.repeatPassword) {
      try {
        setError(false);
        setIsLoading(true);
        const changePasswordResponse = await fetch(
          summaryApi.changePassword.url + email,
          {
            method: summaryApi.changePassword.method,
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const changePassResult = await changePasswordResponse.json();

        if (changePassResult.respCode === "000") {
          toast.success(changePassResult.data);
          dispatch(clearEmail());
          navigate("/login");
        }
      } catch (error) {
        toast.error(error);
        console.log("Error", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Xác nhận mật khẩu không đúng");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-screen bg-cover bg-center bg-fixed flex items-center justify-center"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${img_login})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mx-4 my-8 relative overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <div className="relative">
          <motion.div 
            className="flex flex-col items-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="p-4 rounded-full bg-amber-50 text-amber-600 text-3xl mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <VscLock />
            </motion.div>

            <motion.h2 
              className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Thêm mật khẩu mới
            </motion.h2>

            <motion.p 
              className="text-sm text-gray-500 mt-2 text-center max-w-[80%]"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Mật khẩu mới của bạn phải khác mật khẩu cũ
            </motion.p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <PasswordInput
              label={"Mật khẩu"}
              placeholder={"Nhập password"}
              name={"password"}
              onChange={handleOnchange}
              setErrors={setPasswordError}
            />

            <PasswordInput
              label={"Xác nhận mật khẩu"}
              placeholder={"Xác nhận mật khẩu"}
              name={"repeatPassword"}
              onChange={handleOnchange}
              setErrors={setPasswordError}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 rounded-lg p-3"
                >
                  <p className="text-sm text-red-500 text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.ul 
              className="space-y-2 text-sm text-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.li 
                className="flex items-center space-x-2"
                whileHover={{ x: 5 }}
              >
                <span className="text-amber-500">•</span>
                <span>Mật khẩu phải có ít nhất 8 ký tự</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-2"
                whileHover={{ x: 5 }}
              >
                <span className="text-amber-500">•</span>
                <span>1 ký tự đặc biệt</span>
              </motion.li>
            </motion.ul>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                w-full py-3 px-4 text-white font-semibold rounded-lg shadow-lg
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                transition-all duration-300 ease-in-out
                ${isLoading
                  ? "bg-gray-300 cursor-wait"
                  : passwordError || error
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
                }
              `}
              disabled={isLoading || passwordError || error}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <LoadingOutlined className="text-amber-900 text-lg" />
                  </motion.div>
                  <span>Đang cập nhật...</span>
                </div>
              ) : (
                "Lấy lại mật khẩu"
              )}
            </motion.button>
          </motion.form>

          <motion.div 
            className="mt-8 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/login">
              <motion.p 
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 font-medium inline-flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <span>←</span>
                <span>Quay lại đăng nhập</span>
              </motion.p>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ChangePassword;
