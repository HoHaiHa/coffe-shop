import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Slideshow from "../components/homepage/Slideshow";
import ListCategory from "../components/homepage/ListCategory";
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

const Home = () => {
  const location = useLocation();
  const user = useSelector(
    (state) => state.user.user,
    (prev, next) => prev === next
  );
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const [onClickFilter , setOnClickFilter] = useState(false);
  const favorites = useSelector(selectFavorites);
  const [filteredProducts, setFilteredProducts] = useState([]);


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
    const fetchCategory = async () => {
      setIsCategoriesLoading(true);
      try {
        const categoryResponse = await fetch(summaryApi.allCategory.url, {
          method: summaryApi.allCategory.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResult = await categoryResponse.json();
        if (dataResult.respCode === "000") {
          setCategories(dataResult.data);
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategory();
  }, []);

  const handleFilterProducts = (filtered) => {
    setFilteredProducts(filtered);

  };
  const handleClickFilter = () => {
    setOnClickFilter(true);
  };
  const productList = useMemo(() => {
    return filteredProducts.length > 0 ? filteredProducts : products;
  }, [products, filteredProducts]);

  if (user?.roleName === "ROLE_ADMIN") {
    navigate("/admin");
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
        {location.pathname !== "/profile" && <BreadcrumbNav />}
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
                    <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8 bg-white shadow-md mt-10 ">
                      <p className="text-center text-lg font-bold text-gray-500 ">
                        No results found
                      </p>
                    </div>
                  ) : (
                    <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8  col-span-12">
                      <ListProduct products={productList}  />
                    </div>
                  )}
                </div>
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
