import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';

const RequirementItem = ({ fulfilled, children }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center space-x-2"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`w-5 h-5 rounded-full flex items-center justify-center
        ${fulfilled ? 'bg-green-100' : 'bg-red-100'}`}
    >
      {fulfilled ? (
        <FiCheck className="text-green-600 w-3 h-3" />
      ) : (
        <FiX className="text-red-600 w-3 h-3" />
      )}
    </motion.div>
    <span className={`text-sm ${fulfilled ? 'text-green-600' : 'text-red-600'}`}>
      {children}
    </span>
  </motion.div>
);

const PasswordRequirements = ({
  password,
  minLength = 8,
  requireSpecialChar = true,
  requireNumber = true,
  requireUpperCase = true,
  requireLowerCase = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2"
    >
      <p className="text-sm font-medium text-gray-700 mb-2">
        Mật khẩu cần đáp ứng các yêu cầu sau:
      </p>
      
      <RequirementItem fulfilled={password.length >= minLength}>
        Ít nhất {minLength} ký tự
      </RequirementItem>

      {requireSpecialChar && (
        <RequirementItem fulfilled={/[!@#$%^&*(),.?":{}|<>]/.test(password)}>
          Chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*(),.?":{}|&lt;&gt;)
        </RequirementItem>
      )}

      {requireNumber && (
        <RequirementItem fulfilled={/\d/.test(password)}>
          Chứa ít nhất 1 chữ số
        </RequirementItem>
      )}

      {requireUpperCase && (
        <RequirementItem fulfilled={/[A-Z]/.test(password)}>
          Chứa ít nhất 1 chữ hoa
        </RequirementItem>
      )}

      {requireLowerCase && (
        <RequirementItem fulfilled={/[a-z]/.test(password)}>
          Chứa ít nhất 1 chữ thường
        </RequirementItem>
      )}
    </motion.div>
  );
};

export default PasswordRequirements; 