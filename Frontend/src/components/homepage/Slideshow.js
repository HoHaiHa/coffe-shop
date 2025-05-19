import React from "react";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import slide1 from "../../assets/img/slide1.jpg"; 
import slide2 from "../../assets/img/slide2.jpg";
import slide3 from "../../assets/img/slide3.jpg";
import { motion } from "framer-motion";
import { GiCoffeeCup } from "react-icons/gi";

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full mt-[60px] mb-12"
    >
      {/* Section Title */}
      <div className="container mx-auto px-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3 mb-2">
            <GiCoffeeCup className="text-3xl text-amber-600" />
            <h2 className="text-3xl font-bold text-gray-800">Khám Phá Hacafe</h2>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl"
        >
          <Carousel ref={carouselRef} {...settings}>
            {slides.map((slide) => (
              <div key={slide.id} className="relative">
                {/* Image Container */}
                <div className="relative w-full h-[280px] sm:h-[400px] md:h-[520px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
                  <motion.img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>

                {/* Content */}
                <div className="absolute inset-0 z-20 flex flex-col items-start justify-center text-left p-8 md:p-16 lg:p-20">
                  <div className="max-w-xl space-y-6">
                    <motion.h2 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-3xl sm:text-4xl md:text-5xl font-bold text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_30%)]"
                    >
                      {slide.title}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="text-base sm:text-lg md:text-xl text-white/95 max-w-lg [text-shadow:_1px_1px_2px_rgb(0_0_0_/_30%)]"
                    >
                      {slide.description}
                    </motion.p>
                    {slide.buttonText && (
                      <motion.a 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        href={slide.link}
                        className="inline-block px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-base md:text-lg rounded-full 
                                 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl 
                                 transform hover:scale-105"
                      >
                        {slide.buttonText}
                      </motion.a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Carousel>

          {/* Navigation Arrows */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => carouselRef.current.prev()}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md 
                     hover:bg-white/20 transition-all duration-300 text-white
                     shadow-lg hover:shadow-xl border border-white/20"
          >
            <LeftOutlined className="text-2xl" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => carouselRef.current.next()}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md 
                     hover:bg-white/20 transition-all duration-300 text-white
                     shadow-lg hover:shadow-xl border border-white/20"
          >
            <RightOutlined className="text-2xl" />
          </motion.button>
        </motion.div>
      </div>

      {/* Custom styles for Ant Design Carousel */}
      <style jsx global>{`
        .ant-carousel .slick-dots {
          bottom: 32px;
          z-index: 30;
        }
        
        .ant-carousel .slick-dots li {
          margin: 0 6px;
        }
        
        .ant-carousel .slick-dots li button {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transition: all 0.4s ease;
          backdrop-filter: blur(4px);
        }
        
        .ant-carousel .slick-dots li.slick-active button {
          width: 28px;
          border-radius: 14px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .ant-carousel .slick-slide {
          pointer-events: none;
        }
        
        .ant-carousel .slick-slide.slick-active {
          pointer-events: auto;
        }
      `}</style>
    </motion.div>
  );
};

export default Slideshow; 