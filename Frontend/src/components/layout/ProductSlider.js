import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductCard from "./ProductCard";

const ProductSlider = ({ title, productList }) => {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1600,
    arrows: true,
    pauseOnHover: false,
    swipeToSlide: true,
    draggable: true,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
  };

  const handleMouseDown = (e) => {
    setDragStartX(e.clientX || e.touches?.[0]?.clientX);
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.slickPause();
    }
  };

  const handleMouseMove = (e) => {
    const currentX = e.clientX || e.touches?.[0]?.clientX;
    if (Math.abs(currentX - dragStartX) > 5) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPlay();
    }
  };

  const handleTouchEnd = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPlay();
    }
  };

  const handleClick = (e, product) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (

    <div className="product-slider-container">
      <h2 className="text-2xl font-bold mx-2 my-4 py-4">{title}</h2>
      {(productList.length === 0) ? (
        <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8 bg-white shadow-md mt-10 ">
          <p className="text-center text-lg font-bold text-gray-500 ">
            No results found
          </p>
        </div>
      ) :
        <Slider ref={sliderRef} {...settings}>
          {productList.map((product, index) => (
            <div
              key={index}
              className="p-2"
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchEnd={handleTouchEnd}
            >
              <div onClick={(e) => handleClick(e, product)}>
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </Slider>}
    </div>
  );
};

export default ProductSlider;
