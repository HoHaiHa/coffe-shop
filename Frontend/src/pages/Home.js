import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Spin, Switch } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Slideshow from "../components/homepage/Slideshow";
import ListProduct from "../components/homepage/ListProduct";
import { useDispatch, useSelector } from "react-redux";
import fetchWithAuth from "../helps/fetchWithAuth";
import summaryApi from "../common";
import Cookies from "js-cookie";
import BreadcrumbNav from "../components/layout/BreadcrumbNav";
import { setCartItems } from "../store/cartSlice";
import { selectFavorites, addToFavorites } from "../store/favoritesSlice ";
import ChatWidget from "../components/layout/ChatWidget";
import FilterAdvanced from "../components/homepage/FilterAdvanced";
import ProductSlider from "../components/layout/ProductSlider";
import SortProduct from "../components/layout/SortProduct";

const Home = () => {
  const location = useLocation();
  const user = useSelector(
    (state) => state.user.user,
    (prev, next) => prev === next
  );
  const [products, setProducts] = useState([]);

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const [onClickFilter, setOnClickFilter] = useState(false);
  const favorites = useSelector(selectFavorites);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [newProducts, setNewProducts] = useState([])
  const [bestSellingProducts, setBestSellingProducts] = useState([])

  const [sortingCriteria , setSortingCriteria] = useState('CreatedAtDesc')

  useEffect(() => {
    const fetchCartItems = async () => {
      setIsCartLoading(true);
      try {
        const response = await fetchWithAuth(
          summaryApi.getAllCartItems.url + user.id,
          { method: summaryApi.getAllCartItems.method }
        );
        const dataResponse = await response.json();

        if (dataResponse.data) {
          dispatch(setCartItems(dataResponse.data));
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setIsCartLoading(false);
      }
    };

    if (user) {
      if (!Cookies.get("cart-item-list") && cartItems.length === 0) {
        fetchCartItems();
      }
    }
  }, [user, dispatch, cartItems.length]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetchWithAuth(
          summaryApi.allFavorites.url + user.id,
          {
            method: summaryApi.allFavorites.method,
          }
        );

        const dataResponse = await response.json();

        if (dataResponse.data) {
          if (dataResponse.data.length > 0) {
            for (const favoriteProduct of dataResponse.data) {
              dispatch(addToFavorites(favoriteProduct.product));
            }
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    if (user) {
      if (!localStorage.getItem("favorites") && favorites.length === 0) {
        fetchFavorites();
      }
    }
  }, [user, dispatch, favorites.length]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsProductsLoading(true);
        const productResponse = await fetch(summaryApi.allProduct.url, {
          method: summaryApi.allProduct.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const productResult = await productResponse.json();

        if (productResult.respCode === "000") {
          setProducts(productResult.data);
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        setIsProductsLoading(false);
      }
    };
    fetchProduct();
  }, []);

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
          setBestSellingProducts(productResult.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchBestSellingProduct();
  }, []);

  useEffect(() => {
    setNewProducts(products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20))
  }, [products]);

  const handleFilterProducts = (filtered) => {
    setFilteredProducts(filtered);

  };
  const handleClickFilter = () => {
    setOnClickFilter(true);
  };


  const productList = useMemo(() => {
    const list = filteredProducts.length > 0 ? filteredProducts : products;
    switch (sortingCriteria) {
      case 'createdAtAsc':
        return [...list].sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt))*-1);
        break;
      case 'createdAtDesc':
        return [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priceAsc':
        return [...list].sort((a, b) => new Date(a.minPrice) - new Date(b.minPrice));
        break;
        case 'priceDesc':
        return [...list].sort((a, b) => (new Date(a.minPrice) - new Date(b.minPrice))*-1);
        break;
      case 'soldAsc':
        return [...list].sort((a, b) => new Date(a.totalSold) - new Date(b.totalSold));
        break;
        case 'soldDesc':
        return [...list].sort((a, b) => (new Date(a.totalSold) - new Date(b.totalSold))*-1);
        break;
      case 'rateAsc':
        return [...list].sort((a, b) => new Date(a.rating) - new Date(b.rating));
        break;
        case 'rateDesc':
        return [...list].sort((a, b) => (new Date(a.rating) - new Date(b.rating))*-1);
        break;
      default:
        return [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
    }
  }, [products, filteredProducts,sortingCriteria]);

  const onSortChange = (value) => {
    setSortingCriteria(value);
  };

  if (user?.roleName === "ROLE_ADMIN" || user?.roleName === "ROLE_STAFF") {
    navigate("/admin/messages");
  } else if (isCartLoading) {
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    return (
      <>
        <Header />
        <div className="flex justify-center h-screen mt-3">
          <Spin indicator={antIcon} />
        </div>
        <Footer />
      </>
    );
  } else {
    return (
      <>
        <Header />
        
        <div className="mt-24"></div>
        {/* {location.pathname !== "/profile" && <BreadcrumbNav />} */}
        <main className="container mx-auto ">
          {location.pathname === "/" && (
            <>
              <Slideshow />
              <div className="container  mx-auto ">
                {isProductsLoading && (
                  <div className="flex justify-center items-center h-screen">
                    <LoadingOutlined style={{ fontSize: 48, color: 'red' }} spin />
                  </div>
                )}

                <div className=" grid grid-cols-12 lg:gap-x-10 gap-x-3">
                  <div className="lg:col-span-3 md:col-span-4 col-span-12 mt-10 sm:min-h-screen ">
                    <div className=" top-28 ">
                      <FilterAdvanced onFilter={handleFilterProducts} onClickFilter={handleClickFilter} products={products} />
                    </div>
                  </div>
                  
                  {((filteredProducts.length === 0 && onClickFilter) || productList.length === 0) ? (
                    <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8 bg-white shadow-md mt-10 rounded-2xl">
                      <p className="text-center text-lg font-bold text-gray-500 ">
                        Không tìm thấy sản phẩm
                      </p>
                    </div>
                  ) : (
                    <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8  col-span-12">
                  
                      <ListProduct products={productList} onSortChange={onSortChange} />
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8  col-span-12">
                <ProductSlider productList={newProducts} title={'Sản phẩm mới'} />
              </div>
              <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8  col-span-12">
                <ProductSlider productList={bestSellingProducts} title={'Sản phẩm bán chạy'} />
              </div>
            </>
          )}
          <section className=" mb-8">
            <Outlet />
            <ChatWidget />
          </section>
        </main>
        <Footer />
      </>
    );
  }
};

export default Home;
