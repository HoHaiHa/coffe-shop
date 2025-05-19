import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiUsers } from "react-icons/fi";
import RevenueChart from "./RevenueChart";
import ProductChart from "./ProductChart";
import UserChart from "./UserChart";
import ProductSlowChart from "./ProductSlowChart";

const Statistics = () => {
  const [activeTab, setActiveTab] = useState("Thống kê doanh thu");
  const [tabIndex, setTabIndex] = useState(0);

  const keyTab = [
    {
      key: "Thống kê doanh thu",
      icon: <FiBarChart2 className="text-lg" />,
      color: "amber"
    },
    {
      key: "Thống kê sản phẩm bán chạy",
      icon: <FiTrendingUp className="text-lg" />,
      color: "green"
    },
    {
      key: "Thống kê sản phẩm bán chậm",
      icon: <FiTrendingDown className="text-lg" />,
      color: "red"
    },
    {
      key: "Thống kê người dùng",
      icon: <FiUsers className="text-lg" />,
      color: "blue"
    }
  ];

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') {
        setTabIndex((prev) => (prev + 1) % keyTab.length);
        setActiveTab(keyTab[(tabIndex + 1) % keyTab.length].key);
      } else if (e.key === 'ArrowLeft') {
        setTabIndex((prev) => (prev - 1 + keyTab.length) % keyTab.length);
        setActiveTab(keyTab[(tabIndex - 1 + keyTab.length) % keyTab.length].key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tabIndex]);

  const getTabColor = (color) => {
    const colors = {
      amber: "text-amber-600 border-amber-500 bg-amber-50",
      green: "text-green-600 border-green-500 bg-green-50",
      red: "text-red-600 border-red-500 bg-red-50",
      blue: "text-blue-600 border-blue-500 bg-blue-50"
    };
    return colors[color];
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Thống kê doanh thu":
        return <RevenueChart />;
      case "Thống kê sản phẩm bán chạy":
        return <ProductChart />;
      case "Thống kê sản phẩm bán chậm":
        return <ProductSlowChart />;
      case "Thống kê người dùng":
        return <UserChart />;
      default:
        return null;
    }
  };

  const tabVariants = {
    active: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    inactive: {
      scale: 0.95,
      opacity: 0.7
    }
  };

  const contentVariants = {
    enter: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3
      }
    },
    center: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <motion.div 
        className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {keyTab.map((tab, index) => (
          <motion.button
            key={index}
            variants={tabVariants}
            initial="inactive"
            animate={activeTab === tab.key ? "active" : "inactive"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab(tab.key);
              setTabIndex(index);
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              activeTab === tab.key 
                ? getTabColor(tab.color) + " shadow-sm" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
            role="tab"
            aria-selected={activeTab === tab.key}
            tabIndex={0}
          >
            {tab.icon}
            <span className="whitespace-nowrap">{tab.key}</span>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="bg-gray-50/50 rounded-xl p-6 border border-gray-100"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Statistics;
