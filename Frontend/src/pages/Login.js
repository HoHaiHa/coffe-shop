import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import img_login from "../assets/img/img-login.png";
import Logo from "../components/layout/Logo";
import { LoadingOutlined } from "@ant-design/icons";
import summaryApi from "../common";
import { toast } from "react-toastify";
import { message } from "antd";

import Cookies from "js-cookie";
import Context from "../context";
import EmailInput from "../components/validateInputForm/EmailInput";
import PasswordInput from "../components/validateInputForm/PasswordInput";

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

    setData((pre) => {
      return {
        ...pre,
        [name]: value,
      };
    });
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
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-end"
      style={{ backgroundImage: `url(${img_login})` }}
    >
      <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg p-8 m-6">
        <div className="flex justify-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <h1 className="text-3xl font-bold mt-8 text-center">Xin chào!</h1>

        <p className="mt-3 mb-10 text-gray-600 text-center text-sm">
          Chào mừng bạn quay lại với Hacafe, Chúc bạn có một buổi mua sắm vui vẻ
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {errors && <p className="text-sm text-red-500 my-2 ">{errors}</p>}

          <EmailInput onEmailChange={handleOnchange} setErrors={setEmailError} />
          <PasswordInput
            label={"Password"}
            placeholder={"Enter password"}
            name={"password"}
            onChange={handleOnchange}
            setErrors={setPasswordError}
          />

          <div className="text-right">
            <Link to="/forgot-password">
              <span className="text-sm text-blue-600 font-medium hover:underline">
                Quên mật khẩu
              </span>
            </Link>
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading
              ? "bg-gray-300 cursor-wait"
              : passwordError || emailError || errors
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-700 to-stone-500 transition-all duration-500 ease-in-out bg-[length:200%_auto] hover:bg-[position:right_center]"
              }`}
            disabled={isLoading || passwordError || emailError || errors}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingOutlined className="text-black animate-spin text-lg" />
                <span className="ml-2">Đang đăng nhập...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="flex items-center mt-6 space-x-3 justify-center">
          <span className=" text-center text-gray-500">
            Bạn chưa có tài khoản?
          </span>
          <Link to="/sign-up">
            <span className="text-blue-600 hover:underline">Đăng ký</span>.
          </Link>
        </div>
      </div>
    </div>

  );
};

export default SignIn;
