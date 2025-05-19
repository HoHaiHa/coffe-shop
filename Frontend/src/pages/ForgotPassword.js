import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoKeyOutline } from "react-icons/io5";
import { LoadingOutlined } from "@ant-design/icons";
import EmailInput from "../components/validateInputForm/EmailInput";
import summaryApi from "../common";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setEmail } from "../store/forgotPasswordSlice";
import { message } from "antd";
import img_login from "../assets/img/img-login.png";

function ForgotPassword() {
  const dispatch = useDispatch();
  const email = useSelector((state) => state.forgotPassword.email);
  const [emailError, setEmailError] = useState(""); 
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    dispatch(setEmail(e.target.value));
    setData(e.target.value);
    setEmailError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!data) {
      message.info("Bạn cần nhập địa chỉ email!"); 
      return;
    }
    
    try {
      setIsLoading(true);
      const forgotPassResponse = await fetch(
        summaryApi.forgotPassword.url + `${email}`,
        {
          method: summaryApi.forgotPassword.method,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const forgotPassResult = await forgotPassResponse.json();
      if (forgotPassResult.respCode === "000") {
        navigate("/otp-auth");
        toast.success("OTP đã được gửi đến email của bạn!");
      } else {
        toast.error(forgotPassResult.data);
        setEmailError(forgotPassResult.data);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
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
              className="p-4 rounded-full bg-amber-50 text-amber-600 text-2xl mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <IoKeyOutline />
            </motion.div>

            <motion.h2 
              className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Quên mật khẩu?
            </motion.h2>

            <motion.p 
              className="text-sm text-gray-500 mt-2 text-center"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Đừng lo lắng! Chúng tôi sẽ gửi mã OTP đến email của bạn để đặt lại mật khẩu.
            </motion.p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <EmailInput onEmailChange={handleEmailChange} setErrors={setEmailError} />

            <AnimatePresence>
              {emailError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 rounded-lg p-3"
                >
                  <p className="text-sm text-red-500">{emailError}</p>
                </motion.div>
              )}
            </AnimatePresence>

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
                  : emailError
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
                }
              `}
              disabled={isLoading || emailError}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <LoadingOutlined className="text-amber-900 text-lg" />
                  </motion.div>
                  <span>Đang gửi...</span>
                </div>
              ) : (
                "Gửi mã OTP"
              )}
            </motion.button>
          </motion.form>

          <motion.div 
            className="mt-8 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
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

export default ForgotPassword;
