import { FaLeaf, FaAward, FaGlobeAmericas, FaSeedling, FaCoffee } from 'react-icons/fa';
import { IoIosPeople } from 'react-icons/io';
import React, { useEffect, useState } from "react";


import organic_img from '../../src/assets/img/organic_chungnhan.png';
import cafeDacSan_img from '../../src/assets/img/caphedacsan.png';
import cafeCLC_img from '../../src/assets/img/chatluongcao.png';
import rainforest_img from '../../src/assets/img/rainforest.png';
import ceo_img from '../../src/assets/img/ceo.png';
import cafe_img from '../../src/assets/img/slide2.jpg';
import khach0_img from '../../src/assets/img/khach0.png';
import khach1_img from '../../src/assets/img/khach1.png';
import khach2_img from '../../src/assets/img/khach2.png';
import trungnguyen_img from '../../src/assets/img/trungnguyen.jpg';
import ProductCard from '../components/layout/ProductCard';
import summaryApi from '../common';



const AboutWe = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchBestSellingProduct = async () => {
      try {
        const productResponse = await fetch(summaryApi.bestSellingProduct.url, {
          method: summaryApi.allProduct.method,
          headers: {
            "Content-Type": "application/json",
          },
        });
        const productResult = await productResponse.json();

        if (productResult.respCode === "000") {
          console.log(productResult.data);
          setProducts(productResult.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchBestSellingProduct();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Phần 1: Câu chuyện của chúng tôi */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 relative h-96 rounded-xl overflow-hidden shadow-xl">
            <img
              src={ceo_img}
              alt="Hồ Hải Hà - Người sáng lập Hacafe"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Câu chuyện của chúng tôi</h2>
            <p className="text-lg text-gray-700 mb-4">
              "Tôi là <span className="font-semibold text-amber-800">Trần Thanh Hà</span>, người sáng lập Hacafe. Mọi chuyện bắt đầu từ năm 2015, khi tôi đặt chân đến những vùng đất xa xôi như Ethiopia, Colombia, Kenya, Brazil – nơi những hạt cà phê ngon nhất thế giới được sinh ra. Tôi bị mê hoặc bởi sự đa dạng và chiều sâu trong hương vị mà từng vùng mang lại – từ vị chua thanh tao của cà phê châu Phi cho tới hậu vị chocolate đậm đà của cà phê Nam Mỹ."
            </p>
            <p className="text-lg text-gray-700 mb-4">
              "Trở về Việt Nam với niềm đam mê cháy bỏng, tôi mang theo khát vọng đưa người Việt chạm tới trải nghiệm cà phê chuẩn quốc tế. Bắt đầu từ một quán nhỏ chỉ rộng 20m² tại Hà Nội, tôi và đội ngũ đã không ngừng học hỏi, nghiên cứu và thử nghiệm để tạo ra những công thức rang xay độc đáo, phù hợp với khẩu vị người Việt nhưng vẫn giữ nguyên tinh thần bản địa của từng loại hạt."
            </p>
            <p className="text-lg text-gray-700 mb-4">
              "Sau gần một thập kỷ phát triển, Hacafe giờ đây đã có mặt tại 3 thành phố lớn với hơn 6 cửa hàng. Chúng tôi không chỉ bán cà phê – chúng tôi kể những câu chuyện, truyền cảm hứng và kết nối những con người yêu cà phê trên khắp đất nước."
            </p>
            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
              <p className="italic text-amber-800">"Mỗi tách cà phê là một câu chuyện, mỗi hạt cà phê là một hành trình."</p>
            </div>
          </div>
        </div>
      </section>

      <section className="partner-section py-12 mb-10 bg-white rounded-2xl">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          {/* Ảnh */}
          <div className="md:w-1/2">
            <img
              src={trungnguyen_img}
              alt="Trung Nguyên Legend"
              className="w-full rounded-xl shadow-md object-cover"
            />
          </div>

          {/* Nội dung bài viết */}
          <div className="md:w-1/2">
            <h2 className="text-xl font-semibold text-primary">
              Thương hiệu đồng hành với Hacafe:
            </h2>
            <h2 className="text-4xl font-semibold text-primary mb-6">
              Trung Nguyên Legend
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Hacafe tự hào là đối tác lớn của Trung Nguyên Legend – thương hiệu cà phê hàng đầu Việt Nam với hơn 25 năm phát triển và danh tiếng. Sự đồng hành này đã góp phần làm nên thành công của Hacafe, khi chúng tôi chuyên cung cấp các dòng sản phẩm cà phê đặc biệt, chất lượng cao từ Trung Nguyên Legend. Qua đó, chúng tôi không chỉ nâng cao trải nghiệm thưởng thức cà phê cho khách hàng mà còn lan tỏa tinh thần văn hóa cà phê Việt đến rộng rãi trong và ngoài nước. Trung Nguyên Legend không chỉ nổi tiếng với hương vị cà phê thơm ngon mà còn là biểu tượng của sự sáng tạo và đổi mới trong ngành cà phê
            </p>
            <p className="mt-4 italic text-gray-500">
              “Cùng nhau kiến tạo giá trị, góp phần phát triển văn hóa cà phê Việt Nam.”
            </p>
          </div>
        </div>
      </section>


      {/* Phần 2: Hành trình phát triển */}
      <section className="mb-20 bg-amber-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">Hành trình phát triển</h2>
        <div className="relative">
          {/* Timeline */}
          <div className="border-l-4 border-amber-500 ml-16 space-y-12">
            {[
              {
                year: "2015",
                event: "Khởi nghiệp với cửa hàng đầu tiên tại Hà Nội",
                detail:
                  "Cửa hàng nhỏ 20m² ra đời ở trung tâm quận Hoàn Kiếm, mang theo ước mơ giới thiệu hương vị cà phê thế giới đến với người Việt. Menu ban đầu chỉ có 5 loại cà phê nhập khẩu thủ công từ các quốc gia nổi tiếng như Ethiopia, Brazil, Guatemala."
              },
              {
                year: "2017",
                event: "Chi nhánh mới đầu tiên",
                detail:
                  "Thành công bước đầu tạo động lực để Hacafe mở thêm chi nhánh tại Hà Nội. Đồng thời, lần đầu tiên hợp tác trực tiếp với một nông trại cà phê tại Đắk Lắk để phát triển dòng sản phẩm thuần Việt chất lượng cao."
              },
              {
                "year": "2019",
                "event": "Tiến đến thị trường thành phố Hồ Chí Minh, Thị trường mới",
                "detail": "Hacafe mở rộng hoạt động, mở thêm chi nhánh tại thành phố Hồ Chí Minh, đánh dấu bước tiến quan trọng trong chiến lược mở rộng ra các thị trường lớn."
              },
              {
                "year": "2021",
                "event": "Chính thức trở thành đối tác lớn của cafe Trung Nguyên",
                "detail": "Hacafe chính thức trở thành đối tác lớn của Trung Nguyên, tập trung phát triển và phân phối các dòng cà phê đặc trưng của thương hiệu này. Đồng thời, công ty cũng mở rộng danh mục sản phẩm với các loại cà phê nổi tiếng trên thế giới như Illy, Lavazza, và Starbucks, nhằm mang đến sự đa dạng và chất lượng vượt trội cho người tiêu dùng."
              },
              {
                "year": "2024",
                "event": "Mở rộng chi nhánh trong nước",
                "detail": "Hacafe tiếp tục mở rộng mạng lưới với việc khai trương chi nhánh mới tại TP. Hồ Chí Minh, Đà Nẵng và Vinh, mang đến cơ hội cho khách hàng trên cả ba thành phố trải nghiệm sản phẩm chất lượng cao."
              }
            ].map((item, index) => (
              <div key={index} className="relative pl-10">
                <div className="absolute -left-16 top-0 w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                  {item.year}
                </div>
                <h3 className="text-xl font-semibold text-amber-800">{item.event}</h3>
                <p className="text-gray-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Phần 3: Sứ mệnh & Giá trị cốt lõi */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-amber-900 mb-12 text-center">Sứ mệnh & Giá trị cốt lõi</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaCoffee className="text-4xl mb-4 text-amber-600" />,
              title: "Đa dạng hương vị",
              content:
                "Chúng tôi không chỉ cung cấp cà phê – chúng tôi mang đến hành trình khám phá. Với hơn 50 loại cà phê đến từ các vùng đất trứ danh như Ethiopia, Colombia, Việt Nam, Guatemala... mỗi ly cà phê tại Hacafe là một bản giao hưởng hương vị, phản ánh nét đặc trưng của từng vùng miền."
            },
            {
              icon: <IoIosPeople className="text-4xl mb-4 text-amber-600" />,
              title: "Văn hóa cà phê",
              content:
                "Hacafe hướng đến việc tạo ra không gian thưởng thức cà phê nơi con người có thể kết nối, chia sẻ và truyền cảm hứng. Mỗi cửa hàng là một không gian mở, nơi cà phê được nâng tầm thành một phần của đời sống tinh thần và tri thức hiện đại."
            },
            {
              icon: <FaLeaf className="text-4xl mb-4 text-amber-600" />,
              title: "Bền vững",
              content:
                "Chúng tôi cam kết sản xuất xanh, bảo vệ môi trường và hỗ trợ công bằng cho cộng đồng trồng cà phê. Từ việc sử dụng bao bì phân hủy sinh học đến việc tái đầu tư vào các nông trại địa phương, Hacafe luôn nỗ lực để mỗi hạt cà phê là một bước đi vững chắc hướng tới phát triển bền vững."
            }
          ].map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
              {item.icon}
              <h3 className="text-xl font-semibold mb-3 text-amber-800">{item.title}</h3>
              <p className="text-gray-600">{item.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Phần 4: Nguồn gốc cà phê */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
          <div className="md:w-1/2 h-96 rounded-xl overflow-hidden shadow-xl">
            <img
              src={cafe_img}
              alt="Nguồn gốc cà phê Hacafe"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Nguồn gốc cà phê</h2>
            <p className="text-lg text-gray-700 mb-4">
              Cà phê của Hacafe được tuyển chọn từ các nhà cung cấp danh tiếng toàn cầu – những thương hiệu biểu tượng cho chất lượng và bền vững trong ngành cà phê đặc sản:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Illy (Ý) – Arabica cao cấp từ 9 quốc gia, phối trộn hoàn hảo bởi công nghệ Ý lừng danh",
                "Lavazza (Ý) – Robusta và Arabica từ Brazil, Colombia và Việt Nam với công thức rang độc quyền",
                "Blue Bottle (Mỹ) – Cà phê hữu cơ truy xuất nguồn gốc từ các nông trại nhỏ ở Ethiopia, Kenya",
                "Starbucks Reserve (Mỹ) – Những dòng cà phê giới hạn từ các khu vực núi lửa như Hawaii, Jamaica",
                "Trung Nguyên Legend (Việt Nam) – Robusta hảo hạng từ Buôn Ma Thuột, công nghệ lên men đặc biệt"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-500 mr-2">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <p className="text-amber-800 font-medium">
                Chúng tôi tin rằng, nguồn gốc tạo nên giá trị. Bằng việc hợp tác với các thương hiệu hàng đầu, Hacafe cam kết mang đến cho bạn trải nghiệm cà phê chân thực và đẳng cấp quốc tế.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Phần 5: Quy trình sản xuất */}
      <section className="mb-20 bg-amber-900 text-white rounded-2xl p-12">
        <h2 className="text-3xl font-bold mb-12 text-center">Quy trình chọn lọc & phân phối 7 bước</h2>
        <div className="grid md:grid-cols-7 gap-4">
          {[
            { step: "1", title: "Nhập khẩu chính ngạch", icon: <FaSeedling />, desc: "Cà phê được nhập khẩu trực tiếp từ các thương hiệu uy tín như Lavazza (Ý), Blue Bottle (Mỹ), và UCC (Nhật Bản)." },
            { step: "2", title: "Kiểm tra nguồn gốc", icon: <FaGlobeAmericas />, desc: "Xác minh chứng nhận xuất xứ, quy trình rang xay và bảo quản của đối tác trước khi tiếp nhận." },
            { step: "3", title: "Bảo quản kho lạnh", icon: <FaCoffee />, desc: "Lưu trữ cà phê trong kho đạt chuẩn nhiệt độ và độ ẩm theo tiêu chuẩn quốc tế." },
            { step: "4", title: "Kiểm định chất lượng", icon: <FaAward />, desc: "Thử nếm và đo lường các chỉ số độ ẩm, hương vị để đảm bảo không có sai lệch từ lô gốc." },
            { step: "5", title: "Đóng gói bản địa", icon: <FaLeaf />, desc: "Cà phê được đóng gói tại Việt Nam với bao bì 3 lớp cao cấp có van 1 chiều giữ tươi lâu hơn." },
            { step: "6", title: "In nhãn thông tin", icon: <IoIosPeople />, desc: "Dán nhãn rõ ràng về nơi sản xuất, hãng cung cấp, thành phần, hạn sử dụng theo quy chuẩn." },
            { step: "7", title: "Phân phối toàn quốc", icon: <FaAward />, desc: "Hệ thống phân phối phủ khắp siêu thị, cửa hàng tiện lợi và nền tảng thương mại điện tử." }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-700 flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div className="font-bold mb-1">Bước {item.step}</div>
              <div className="text-sm">{item.title}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white bg-opacity-10 p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Đối tác quốc tế đáng tin cậy</h3>
          <p className="mb-4">
            Chúng tôi hợp tác với các thương hiệu cà phê nổi tiếng toàn cầu như <span className="text-amber-300 font-semibold">Illy</span>, <span className="text-amber-300 font-semibold">Starbucks Reserve</span>, và <span className="text-amber-300 font-semibold">Tchibo</span>,
            nhằm mang đến trải nghiệm hương vị nguyên bản từ chính dây chuyền của họ.
          </p>
          <p>
            Mỗi lô hàng đều được giám sát chặt chẽ từ nơi xuất phát cho đến tay khách hàng Việt Nam, đảm bảo độ tươi, chuẩn vị và minh bạch nguồn gốc.
          </p>
        </div>
      </section>


      {products?.length >= 3 && products[0] && products[1] && products[2] && (
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-amber-900 mb-12 text-center">Sản phẩm nổi bật</h2>
          <div className="grid md:grid-cols-3 gap-28 px-16">
            <ProductCard product={products[0]} />
            <ProductCard product={products[1]} />
            <ProductCard product={products[2]} />
          </div>
        </section>
      )}

      {/* Phần 7: Nhận xét từ khách hàng */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-amber-900 mb-12 text-center">Khách hàng nói về chúng tôi</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Anh Nguyễn Văn Toàn",
              role: "Doanh nhân",
              comment: "Tôi đã thử nhiều loại cà phê trên thế giới nhưng sản phẩm nhập khẩu từ Ethiopia mà Hacafe phân phối thật sự gây ấn tượng. Hương vị rất tinh tế!",
              avatar: khach0_img
            },
            {
              name: "Chị Trần Thị Thanh Hiền",
              role: "Barista",
              comment: "Nguyên liệu nhập từ các hãng lớn quốc tế do Hacafe chọn lọc luôn đạt chất lượng đồng đều – rất lý tưởng cho pha chế chuyên nghiệp.",
              avatar: khach1_img
            },
            {
              name: "Chị Lê Thị Quyên",
              role: "Nghệ sĩ",
              comment: "Tôi đánh giá cao cách Hacafe hợp tác cùng các thương hiệu cà phê hàng đầu thế giới để mang lại sản phẩm chuẩn mực và cảm hứng sáng tạo.",
              avatar: khach2_img
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.comment}"</p>
              <div className="flex mt-4 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Phần 8: Cam kết bền vững */}
      <section className="mb-20 bg-green-50 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Cam kết bền vững</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
              <FaLeaf className="mr-2" /> Với môi trường
            </h3>
            <ul className="space-y-3">
              {[
                "Chỉ nhập khẩu sản phẩm đạt chứng nhận Rainforest Alliance, Fair Trade hoặc Organic EU",
                "Các đối tác sử dụng bao bì phân hủy sinh học và công nghệ tiết kiệm nước",
                "Hợp tác với nhà cung cấp có quy trình sản xuất giảm phát thải CO₂ rõ ràng",
                "Ưu tiên sản phẩm sử dụng năng lượng tái tạo trong chế biến"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
              <IoIosPeople className="mr-2" /> Với cộng đồng quốc tế
            </h3>
            <ul className="space-y-3">
              {[
                "Chỉ làm việc với các hãng trả giá công bằng cho nông dân trồng cà phê",
                "Ủng hộ các chương trình giáo dục & y tế tại vùng trồng nguyên liệu",
                "Hợp tác với nhà cung cấp minh bạch chuỗi cung ứng và điều kiện lao động",
                "Tôn trọng văn hóa bản địa và phát triển kinh tế bền vững tại nguồn"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <img
            src={rainforest_img}
            alt="Chứng nhận bền vững"
            className="mx-auto"
            width={200}
            height={100}
          />
          <p className="text-sm text-gray-600 mt-2">Các sản phẩm đều đạt chứng nhận bền vững từ Rainforest Alliance, Fair Trade hoặc tương đương</p>
        </div>
      </section>


      {/* Phần 9: Chứng nhận & Giải thưởng */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">Chứng nhận & Giải thưởng</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: "Chứng Nhận Organic không sử dụng chất độc hại", image: organic_img },
            { title: "Giải vàng Cà phê đặc sản Việt Nam (do đối tác đạt được)", image: cafeDacSan_img },
            { title: "Chứng Nhận C.A.F.E. Practices đảm bảo chất lượng cao", image: cafeCLC_img },
            { title: "Chứng nhận Rainforest Alliance – Sản xuất bền vững", image: rainforest_img }
          ].map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
              <div className="w-32 h-32 relative mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="text-center font-medium text-sm">{item.title}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600 mt-6 text-sm">
          Các đối tác cung ứng của Hacafe đều được quốc tế công nhận về chất lượng và trách nhiệm với cộng đồng.
        </p>
      </section>


    </div>
  );
};

export default AboutWe;