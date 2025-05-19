import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail } from "react-icons/fi";
import InPutForm from "./InPutForm";

function EmailLoginInput({ onEmailChange }) {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    onEmailChange(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative group">
      <div className="relative">
        <InPutForm
          label={
            <motion.div
              className="flex items-center space-x-2"
              animate={{
                color: isFocused ? "rgb(245, 158, 11)" : "rgb(55, 65, 81)",
                scale: isFocused ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <span
                className={`transition-colors duration-200 ${
                  isFocused ? "text-amber-500" : "text-gray-400 group-hover:text-amber-400"
                }`}
              >
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
          required
        />
      </div>

      {/* Focus Ripple Effect */}
      <AnimatePresence>
        {isFocused && (
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

export default EmailLoginInput;
