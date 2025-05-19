import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { motion } from "framer-motion";

const ReviewItem = ({ username, rating, date, comment, avatar }) => {
  const renderStars = (rating) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<FaStar key={i} className="text-amber-500" />);
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<FaStarHalfAlt key={i} className="text-amber-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-amber-500" />);
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={avatar}
            alt={username}
            className="w-12 h-12 rounded-full object-cover border-2 border-amber-100"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-lg font-medium text-gray-900 truncate">
              {username}
            </h4>
            <time className="text-sm text-gray-500" dateTime={date}>
              {new Date(date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })}
            </time>
          </div>
          
          <div className="flex items-center space-x-1 mb-2">
            {renderStars(rating)}
            <span className="ml-2 text-sm text-gray-600">
              {rating.toFixed(1)}/5
            </span>
          </div>
          
          <p className="text-gray-700 whitespace-pre-line">
            {comment}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewItem;
