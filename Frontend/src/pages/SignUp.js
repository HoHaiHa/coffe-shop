import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import img_login from "../assets/img/img-login.png";
import Logo from "../components/layout/Logo";

import summaryApi from "../common";
import Context from "../context";

import Cookies from "js-cookie";

import { toast } from "react-toastify";
import PasswordInput from "../components/validateInputForm/PasswordInput";
import EmailInput from "../components/validateInputForm/EmailInput";
import { LoadingOutlined } from "@ant-design/icons";
import { PasswordLoginInput } from "../components/validateInputForm";


const SignUp = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { fetchUserDetails } = useContext(Context);

  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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

    if (data.password === data.confirmPassword) {
      setIsLoading(true);
      try {
        const signUpResponse = await fetch(summaryApi.signUP.url, {
          method: summaryApi.signUP.method,
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const signUpResult = await signUpResponse.json();

        if (signUpResult.respCode === "000") {
          toast.success("Sign Up Successfully!");

          // auto login
          const loginResponse = await fetch(summaryApi.signIn.url, {
            method: summaryApi.signIn.method,
            body: JSON.stringify({
              email: data.email,
              password: data.password,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const loginResult = await loginResponse.json();
          if (loginResult.respCode === "000") {
            navigate("/");
            const { accessToken, refreshToken } = loginResult.data;
            Cookies.set("token", accessToken);
            Cookies.set("refreshToken", refreshToken);
            fetchUserDetails();
          }
        } else {
          toast.error(signUpResult.data, {
            autoClose: 5000,
          });
        }
      } catch (error) {
        console.log("Error SignUp", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Mật khẩu và xác nhận mật khẩu không đúng", {
        autoClose: 1000,
      });
      setError("Mật khẩu và xác nhận mật khẩu không đúng");
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
            Đăng ký
          </motion.h1>

          <motion.p 
            className="mt-3 mb-8 text-gray-600 text-center text-sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Hãy tạo tài khoản của bạn để mua sắm như chuyên gia và tiết kiệm tiền.
          </motion.p>

          <motion.form 
            className="space-y-5"
            onSubmit={handleSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <EmailInput onEmailChange={handleOnchange} setErrors={setEmailError} />
            <PasswordInput
              label={"Mật khẩu"}
              placeholder={"Nhập password"}
              name={"password"}
              onChange={handleOnchange}
              setErrors={setPasswordError}
            />
            <PasswordLoginInput
              label={"Xác nhận mật khẩu"}
              placeholder={"Xác nhận mật khẩu"}
              name={"confirmPassword"}
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
                  <p className="text-sm text-red-500">{error}</p>
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
                  : passwordError || emailError
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
                }
              `}
              disabled={isLoading || passwordError || emailError}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <LoadingOutlined className="text-amber-900 text-lg" />
                  </motion.div>
                  <span>Đang tải...</span>
                </div>
              ) : (
                "Đăng ký"
              )}
            </motion.button>
          </motion.form>

          <motion.div 
            className="flex items-center mt-8 space-x-2 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-gray-600 text-sm">
              Bạn đã có tài khoản?
            </span>
            <Link to="/login">
              <motion.span 
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 font-medium text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Đăng nhập
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignUp;
