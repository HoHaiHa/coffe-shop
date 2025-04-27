import React from "react";
import { useNavigate } from "react-router-dom";

const BrandCard = ({brand}) => {

  const navigate = useNavigate();

  const handleCategoryClick = () => {
    navigate(`/brand/${brand.name}/${brand.id}`);
  };

  return (
    <div 
    onClick={handleCategoryClick}
    className="flex items-center overflow-hidden p-2 hover:bg-gray-200 rounded ">
      <div className=" lg:px-4 md:px-2 px-4 py-2">
        <div className=" font-medium lg:text-base  text-sm ">{brand.name}</div>
      </div>
    </div>
  );
};

export default BrandCard;
