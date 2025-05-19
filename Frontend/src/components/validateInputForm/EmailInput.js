import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";
import InPutForm from "./InPutForm";

function EmailInput({ onEmailChange, setErrors }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^(([^<>()[\],;:\s@"]+(\.[^<>()[\],;:\s@"]+)*)|(".+"))@(([^<>()[\],;:\s@"]+\.)+[^<>()[\],;:\s@"]{2,})$/i;
    return emailRegex.test(value);
  };

  useEffect(() => {
    if (isDirty) {
      const isEmailValid = validateEmail(email);
      setIsValid(isEmailValid);
      setError(isEmailValid ? "" : "Email không hợp lệ");
      setErrors(!isEmailValid);
    }
  }, [email, isDirty, setErrors]);

  const handleBlur = () => {
    setIsDirty(true);
    setIsFocused(false);
    const isEmailValid = validateEmail(email);
    setIsValid(isEmailValid);
    setError(isEmailValid ? "" : "Email không hợp lệ");
    setErrors(!isEmailValid);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (isDirty) {
      const isEmailValid = validateEmail(value);
      setIsValid(isEmailValid);
      setError(isEmailValid ? "" : "Email không hợp lệ");
      setErrors(!isEmailValid);
    }
    onEmailChange(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className="relative group">
      <div className="relative">
        <InPutForm
          label={
            <motion.div 
              className="flex items-center space-x-2"
              animate={{ 
                color: isFocused ? 'rgb(245, 158, 11)' : 'rgb(55, 65, 81)',
                scale: isFocused ? 1.02 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              <span className={`transition-colors duration-200 ${isFocused ? 'text-amber-500' : 'text-gray-400 group-hover:text-amber-400'}`}>
                <FiMail />
              </span>
              <span>Email</span>
            </motion.div>
          }
          type="email"
          name="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          error={error}
          required
        />
        
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                y: isFocused ? -2 : 0
              }}
              exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
              className={`
                absolute right-3 top-[38px] transform -translate-y-1/2
                ${isValid 
                  ? "text-green-500 bg-green-50 border border-green-100" 
                  : "text-red-500 bg-red-50 border border-red-100"
                }
                rounded-full p-1 transition-transform duration-200
              `}
            >
              {isValid ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isDirty && !isValid && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mt-3 text-sm bg-gray-50 rounded-lg border border-gray-100 p-3"
          >
            <div className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
              <FiAlertCircle className="text-amber-500" />
              <span>Email hợp lệ cần:</span>
            </div>
            <ul className="space-y-2">
              <motion.li 
                className="flex items-center space-x-2"
                animate={{ color: email.includes("@") ? '#10B981' : '#EF4444' }}
              >
                <span className="flex-shrink-0">
                  {email.includes("@") ? <FiCheckCircle /> : <FiXCircle />}
                </span>
                <span>Chứa ký tự @</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-2"
                animate={{ color: email.includes(".") ? '#10B981' : '#EF4444' }}
              >
                <span className="flex-shrink-0">
                  {email.includes(".") ? <FiCheckCircle /> : <FiXCircle />}
                </span>
                <span>Chứa tên miền (vd: .com, .vn)</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-2"
                animate={{ color: !email.includes(" ") ? '#10B981' : '#EF4444' }}
              >
                <span className="flex-shrink-0">
                  {!email.includes(" ") ? <FiCheckCircle /> : <FiXCircle />}
                </span>
                <span>Không chứa khoảng trắng</span>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Ripple Effect */}
      <AnimatePresence>
        {isFocused && !error && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 border-2 border-amber-500/20 rounded-lg pointer-events-none"
            style={{ margin: "-4px" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmailInput;
