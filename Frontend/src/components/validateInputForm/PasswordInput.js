import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import InPutForm from "./InPutForm";
import PasswordRequirements from "./PasswordRequirements";

const PasswordStrengthIndicator = ({ strength }) => {
  const getStrengthColor = () => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-1"
    >
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          className={`h-full ${getStrengthColor()} transition-all duration-300`}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Độ mạnh mật khẩu: {strength < 25 ? "Yếu" : strength < 50 ? "Trung bình" : strength < 75 ? "Khá" : "Mạnh"}
      </p>
    </motion.div>
  );
};

const PasswordInput = ({
  label = "Mật khẩu",
  name = "password",
  placeholder = "Nhập mật khẩu của bạn",
  onChange,
  setErrors,
  value: externalValue,
  isLoginMode = false,
  minLength = 8,
  requireSpecialChar = true,
  requireNumber = true,
  requireUpperCase = true,
  requireLowerCase = true,
  showStrengthIndicator = true,
  showRequirements = true,
  className = "",
}) => {
  const [password, setPassword] = useState(externalValue || "");
  const [strength, setStrength] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");

  const calculatePasswordStrength = useCallback(() => {
    if (isLoginMode) return 100; // Don't show strength in login mode
    
    let score = 0;
    if (password.length >= minLength) score += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 25;
    return score;
  }, [password, minLength, isLoginMode]);

  const validatePassword = useCallback(() => {
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      setErrors?.(true);
      return false;
    }

    if (isLoginMode) {
      setError("");
      setErrors?.(false);
      return true;
    }

    const meetsRequirements = 
      password.length >= minLength &&
      (!requireSpecialChar || /[!@#$%^&*(),.?":{}|<>]/.test(password)) &&
      (!requireNumber || /\d/.test(password)) &&
      (!requireUpperCase || /[A-Z]/.test(password)) &&
      (!requireLowerCase || /[a-z]/.test(password));
    
    if (!meetsRequirements) {
      setError("Mật khẩu không đáp ứng các yêu cầu");
      setErrors?.(true);
      return false;
    }

    setError("");
    setErrors?.(false);
    return true;
  }, [
    password,
    isLoginMode,
    minLength,
    requireSpecialChar,
    requireNumber,
    requireUpperCase,
    requireLowerCase,
    setErrors,
  ]);

  useEffect(() => {
    if (isDirty) {
      setStrength(calculatePasswordStrength());
      validatePassword();
    }
  }, [password, isDirty, calculatePasswordStrength, validatePassword]);

  useEffect(() => {
    if (externalValue !== undefined) {
      setPassword(externalValue);
    }
  }, [externalValue]);

  const handleChange = (e) => {
    const { value } = e.target;
    setPassword(value);
    if (isDirty) {
      validatePassword();
    }
    onChange?.(e);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsDirty(true);
    validatePassword();
  };

  return (
    <div className={`space-y-2 ${className}`}>
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
        onBlur={handleBlur}
        error={error}
        showEye={true}
        required
      />

      <AnimatePresence>
        {!isLoginMode && showStrengthIndicator && password && (
          <PasswordStrengthIndicator strength={strength} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoginMode && showRequirements && (isFocused || (isDirty && error)) && (
          <PasswordRequirements
            password={password}
            minLength={minLength}
            requireSpecialChar={requireSpecialChar}
            requireNumber={requireNumber}
            requireUpperCase={requireUpperCase}
            requireLowerCase={requireLowerCase}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PasswordInput;