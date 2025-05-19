import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiLock } from "react-icons/fi";
import InPutForm from "./InPutForm";

const PasswordLoginInput = ({
  label = "Mật khẩu",
  name = "password",
  placeholder = "Nhập mật khẩu của bạn",
  onChange,
  setErrors,
}) => {
  const [password, setPassword] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const { value } = e.target;
    setPassword(value);
    setErrors(false);
    onChange(e);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <InPutForm
        label={
          <div className="flex items-center space-x-2">
            <FiLock className="text-amber-500" />
            <span>{label}</span>
          </div>
        }
        type="password"
        placeholder={placeholder}
        name={name}
        value={password}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        showEye={true}
        required
      />

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isFocused ? 1 : 0,
          height: isFocused ? "auto" : 0
        }}
        transition={{ duration: 0.2 }}
        className="text-sm text-gray-500 mt-1 overflow-hidden"
      >
        <p className="italic">
          Nhập mật khẩu của bạn để đăng nhập
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PasswordLoginInput;
