import React from "react";
import cafeBean from '../../assets/img/cafe_bean.jpg';

const ArticleComponent = ({ keyword, title, article }) => {
  return (
    <div className="w-full mx-0 mt-8">
      {keyword && (
        <div className="relative w-full h-64 overflow-hidden mb-8">
          <img
            src={cafeBean}
            alt={keyword}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-7xl font-bold text-center px-4">
              {keyword}
            </h1>
          </div>
        </div>
      )}


      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        {title}
      </h1>


      <div className="bg-gray-50 p-6 rounded-lg">
        <pre className="whitespace-pre-wrap font-sans text-gray-700 text-base">
          {article}
        </pre>
      </div>
    </div>
  );
};

export default ArticleComponent;
