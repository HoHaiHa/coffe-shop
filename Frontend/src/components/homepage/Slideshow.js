import React from "react";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import slide1 from "../../assets/img/slide1.jpg"; 
import slide2 from "../../assets/img/slide2.jpg";
import slide3 from "../../assets/img/slide3.jpg";

const slides = [
  { 
    id: 1, 
    image: slide1,
    title: "Thưởng thức hương vị cà phê",
    description: "Khám phá các loại cà phê đặc biệt từ khắp nơi trên thế giới",
  },
  { 
    id: 2, 
    image: slide2,
    title: "Không gian thư giãn",
    description: "Tận hưởng những phút giây thư giãn cùng ly cà phê yêu thích",
    buttonText: "Xem thêm về chúng tôi",
    link: "/about-we"
  },
  { 
    id: 3, 
    image: slide3,
    title: "Chất lượng hoàn hảo",
    description: "Cam kết mang đến những sản phẩm chất lượng nhất",
  }
];

const Slideshow = () => {
  const carouselRef = React.useRef();

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    effect: "fade",
    arrows: false,
  };

  return (
    <div className="relative w-full mt-[60px] mb-8">
      {/* Section Title */}
      <div className="container mx-auto px-4 mb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Khám Phá Hacafe</h2>
          <div className="w-20 h-1 bg-amber-700 mx-auto"></div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <Carousel ref={carouselRef} {...settings}>
            {slides.map((slide) => (
              <div key={slide.id} className="relative">
                {/* Image Container */}
                <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20 z-10" /> {/* Gradient Overlay */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover transform scale-100 hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col items-start justify-center text-left p-8 md:p-12 lg:p-16">
                  <div className="max-w-xl">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white opacity-0 animate-fadeInUp">
                      {slide.title}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 max-w-lg opacity-0 animate-fadeInUp animation-delay-200">
                      {slide.description}
                    </p>
                    <a 
                      href={slide.link}
                      className="inline-block px-6 py-2 bg-gradient-to-r from-amber-700 to-stone-500 text-white text-sm md:text-base rounded-lg 
                               hover:opacity-90 transition-all duration-300 opacity-0 animate-fadeInUp animation-delay-400"
                    >
                      {slide.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>

          {/* Navigation Arrows */}
          <button
            onClick={() => carouselRef.current.prev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 text-white"
          >
            <LeftOutlined className="text-xl" />
          </button>
          <button
            onClick={() => carouselRef.current.next()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 text-white"
          >
            <RightOutlined className="text-xl" />
          </button>
        </div>
      </div>

      {/* Custom styles for Ant Design Carousel */}
      <style jsx global>{`
        .ant-carousel .slick-dots {
          bottom: 16px;
          z-index: 30;
        }
        .ant-carousel .slick-dots li {
          margin: 0 4px;
        }
        .ant-carousel .slick-dots li button {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }
        .ant-carousel .slick-dots li.slick-active button {
          width: 20px;
          border-radius: 10px;
          background: white;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default Slideshow; 