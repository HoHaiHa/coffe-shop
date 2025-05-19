import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import img_login from "../assets/img/img-login.png";
import Logo from "../components/layout/Logo";
import { LoadingOutlined } from "@ant-design/icons";
import summaryApi from "../common";
import { toast } from "react-toastify";
import { message } from "antd";
import Cookies from "js-cookie";
import Context from "../context";
import EmailInput from "../components/validateInputForm/EmailInput";
import PasswordLoginInput from "../components/validateInputForm/PasswordLoginInput";
import EmailLoginInput from "../components/validateInputForm/EmailLoginInput";

const SignIn = () => {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const { fetchUserDetails } = useContext(Context);
  const navigate = useNavigate();

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setErrors(false);
    setData((pre) => ({
      ...pre,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const loginResponse = await fetch(summaryApi.signIn.url, {
        method: summaryApi.signIn.method,
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const loginResult = await loginResponse.json();

      if (loginResult.respCode === "000") {
        navigate("/");
        message.success("Login Successfully !");
        const { accessToken, refreshToken } = loginResult.data;
        Cookies.set("token", accessToken);
        Cookies.set("refreshToken", refreshToken);
        fetchUserDetails();
      } else if (loginResult.data === 'User is disabled') {
        toast.error("Bạn đã bị khóa khỏi hệ thống!");
      }
      else {
        toast.error("Email hoặc mật khẩu không chính xác!");
      }
    } catch (error) {
      console.log("error Login", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-screen bg-cover bg-center bg-fixed flex items-center justify-end pr-48"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${img_login})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
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
            className="flex justify-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/">
              <Logo />
            </Link>
          </motion.div>

          <motion.h1 
            className="text-3xl font-bold mt-8 text-center bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Xin chào!
          </motion.h1>

          <motion.p 
            className="mt-3 mb-8 text-gray-600 text-center text-sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Chào mừng bạn quay lại với Hacafe, Chúc bạn có một buổi mua sắm vui vẻ
          </motion.p>

          <motion.form 
            className="space-y-6"
            onSubmit={handleSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <AnimatePresence>
              {errors && (
                <motion.p 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg p-3 my-2"
                >
                  {errors}
                </motion.p>
              )}
            </AnimatePresence>

            <EmailLoginInput onEmailChange={handleOnchange} setErrors={setEmailError} />
            <PasswordLoginInput
              label={"Mật khẩu"}
              placeholder={"Nhập mật khẩu"}
              name={"password"}
              onChange={handleOnchange}
              setErrors={setPasswordError}
            />

            <motion.div 
              className="text-right"
              whileHover={{ scale: 1.02 }}
            >
              <Link to="/forgot-password">
                <span className="text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors duration-200">
                  Quên mật khẩu
                </span>
              </Link>
            </motion.div>

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
                  : passwordError || emailError || errors
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
                }
              `}
              disabled={isLoading || passwordError || emailError || errors}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <LoadingOutlined className="text-amber-900 text-lg" />
                  </motion.div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                "Đăng nhập"
              )}
            </motion.button>
          </motion.form>

          <motion.div 
            className="flex items-center mt-8 space-x-2 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-gray-500">
              Bạn chưa có tài khoản?
            </span>
            <Link to="/sign-up">
              <motion.span 
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Đăng ký
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignIn;
