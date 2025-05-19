import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const InPutForm = ({
  label,
  type = "text",
  placeholder = "",
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  error = "",
  required = false,
  showEye = false,
  rightElement,
  disabled = false,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col space-y-1 ${className}`}
    >
      {label && (
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-1 text-sm font-medium text-gray-700 flex items-center space-x-1"
        >
          {label}
          {required && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-red-500"
            >
              *
            </motion.span>
          )}
        </motion.label>
      )}

      <div className="relative group">
        <motion.input
          type={showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          name={name}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-lg transition-all duration-200
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error
              ? "border-red-500 bg-red-50 text-red-600 focus:ring-red-100"
              : isFocused
                ? "border-amber-500 ring-2 ring-amber-100"
                : "border-gray-300 hover:border-amber-300"
            }
            ${(showEye || rightElement) ? "pr-10" : ""}
            focus:outline-none border
          `}
        />

        <AnimatePresence>
          {(showEye || rightElement) && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              {showEye ? (
                <motion.button
                  type="button"
                  onClick={togglePasswordVisibility}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    ${error ? "text-red-500" : "text-gray-500"}
                    hover:text-amber-600 focus:outline-none transition-colors duration-200
                    flex items-center justify-center h-full
                  `}
                >
                  {showPassword ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
                </motion.button>
              ) : rightElement}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFocused && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 border-2 border-amber-500 rounded-lg pointer-events-none"
              style={{ margin: "-2px" }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center mt-1.5 space-x-1.5 text-sm text-red-600"
          >
            <motion.div
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InPutForm;
