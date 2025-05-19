import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CiMail } from "react-icons/ci";
import { LoadingOutlined } from "@ant-design/icons";
import summaryApi from "../common";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { message } from "antd";
import img_login from "../assets/img/img-login.png";

function OtpAuthentication() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const email = useSelector((state) => state.forgotPassword.email);
  const navigate = useNavigate();

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError(false);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const openEmailApp = () => {
    window.open((window.location.href = "mailto:"));
  };

  const handleOtpAuthentication = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if(!otpValue || otpValue.length !== 4) {
      message.info("Bạn phải điền mã OTP");
      return;
    }

    try {
      setIsLoading(true);
      const otpResponse = await fetch(
        summaryApi.verifyOtp.url + `${otpValue}/` + email,
        {
          method: summaryApi.verifyOtp.method,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const otpResult = await otpResponse.json();
      if (otpResult.respCode === "000") {
        toast.success(otpResult.data);
        navigate("/change-password");
      } else {
        toast.error(otpResult.data);
        setError(otpResult.data);
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
              className="p-4 rounded-full bg-amber-50 text-amber-600 text-3xl mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <CiMail />
            </motion.div>

            <motion.h2 
              className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-stone-700 bg-clip-text text-transparent"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Xác thực OTP
            </motion.h2>

            <motion.p 
              className="text-sm text-gray-500 mt-2 text-center max-w-[80%]"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Nhập mã OTP xác thực được gửi về email của bạn
            </motion.p>
          </motion.div>

          <motion.form 
            onSubmit={handleOtpAuthentication} 
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex justify-center space-x-4">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  maxLength="1"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileFocus={{ scale: 1.05 }}
                  className={`
                    w-14 h-14 text-center text-2xl font-bold rounded-lg
                    transition-all duration-200 
                    ${error 
                      ? "border-2 border-red-500 bg-red-50 text-red-600" 
                      : "border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    }
                  `}
                />
              ))}
            </div>

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
                  : error
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
                }
              `}
              disabled={isLoading || error}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <LoadingOutlined className="text-amber-900 text-lg" />
                  </motion.div>
                  <span>Đang xác thực...</span>
                </div>
              ) : (
                "Xác thực OTP"
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={openEmailApp}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 px-4 bg-gray-100 text-amber-700 font-semibold rounded-lg 
                shadow-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-gray-200 transition-all duration-300 ease-in-out"
            >
              Mở EMAIL
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

export default OtpAuthentication;
