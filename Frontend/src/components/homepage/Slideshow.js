import React from "react";
import { Carousel } from "antd";
import slide1 from "../../assets/img/slide1.jpg"; 
import slide2 from "../../assets/img/slide2.jpg";
import slide3 from "../../assets/img/slide3.jpg";

const slides = [
  { id: 1, image: slide1 },
  { id: 2, image: slide2 },
  { id: 3, image: slide3 }
];
const Slideshow = () => {
  return (
    <div className="w-full mt-10 px-4">
      <Carousel autoplay effect="fade" dots className="rounded-md">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative w-full sm:h-64 md:h-80 overflow-hidden rounded-md"
          >
            <img
              src={slide.image}
              alt="Slideshow"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Slideshow;
