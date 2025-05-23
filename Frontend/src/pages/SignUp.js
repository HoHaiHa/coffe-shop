import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import img_login from "../assets/img/img-login.png";
import Logo from "../components/layout/Logo";

import summaryApi from "../common";
import Context from "../context";

import Cookies from "js-cookie";

import { toast } from "react-toastify";
import PasswordInput from "../components/validateInputForm/PasswordInput";
import EmailInput from "../components/validateInputForm/EmailInput";
import { LoadingOutlined } from "@ant-design/icons";


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
    setData((pre) => {
      return {
        ...pre,
        [name]: value,
      };
    });
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
          toast.success("Sign Up  Successfully !");

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
      }
      finally {
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
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-end"
      style={{ backgroundImage: `url(${img_login})` }}
    >
      <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg p-8 m-6">
        <div className="flex justify-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold mt-8 text-center">Đăng ký</h1>
          <p className="mt-3 mb-10 text-gray-600 text-center text-sm">
            Hãy tạo tài khoản của bạn để mua sắm như chuyên gia và tiết kiệm tiền.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <EmailInput onEmailChange={handleOnchange} setErrors={setEmailError} />
          <PasswordInput
            label={"Mật khẩu"}
            placeholder={"Enter password"}
            name={"password"}
            onChange={handleOnchange}
            setErrors={setPasswordError}
          />
          <PasswordInput
            label={"Xác nhận mật khẩu"}
            placeholder={"Enter confirmPassword"}
            name={"confirmPassword"}
            onChange={handleOnchange}
            setErrors={setPasswordError}
          />
          {error && <p className="text-sm text-red-500 my-2">{error}</p>}

          <button
            type="submit"
            className={`w-full py-2 px-4 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading
              ? "bg-gray-300 cursor-wait"
              : passwordError || emailError
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-700 to-stone-500 transition-all duration-500 ease-in-out bg-[length:200%_auto] hover:bg-[position:right_center]"
              }`}
            disabled={isLoading || passwordError || emailError}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingOutlined className="text-black animate-spin text-lg" />
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        <div className="flex items-center mt-5 space-x-2 justify-center">
          <span className="text-gray-600 text-sm">Bạn đã có tài khoản?</span>
          <Link to="/login">
            <span className="text-blue-600 hover:underline text-sm">Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );

};

export default SignUp;
