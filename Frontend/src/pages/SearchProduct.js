import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import summaryApi from "../common";
import ListProduct from "../components/homepage/ListProduct";
import { Spin } from "antd";
import FilterAdvanced from "../components/homepage/FilterAdvanced";

const SearchProduct = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [onClickFilter, setOnClickFilter] = useState(false);

  const handleFilterProducts = (filtered) => {
    setFilteredProducts(filtered);
  };
  const handleClickFilter = () => {
    setOnClickFilter(true);
  };

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("q");

  const fetchSearchProduct = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (searchTerm !== null) {
        response = await fetch(
          summaryApi.searchProduct.url + `?q=${searchTerm}`,
          {
            method: summaryApi.searchProduct.method,
          }
        );
      } else if (searchTerm == null) {
        response = fetch(summaryApi.allProduct.url, {
          method: summaryApi.allProduct.method,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        response = fetch(summaryApi.allProduct.url, {
          method: summaryApi.allProduct.method,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const dataResponse = await response.json();
      if (dataResponse.respCode === "000") {
        setProducts(dataResponse.data);
      } else {
        setProducts([]);
        console.log("Error fetching data");
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);


  useEffect(() => {
    fetchSearchProduct();
  }, [fetchSearchProduct]);

  const title = `Sản Phẩm liên quan đến "${searchTerm}" :`;

  const [sortingCriteria, setSortingCriteria] = useState('CreatedAtDesc')


  const productList = useMemo(() => {
    const list = filteredProducts.length > 0 ? filteredProducts : products;
    switch (sortingCriteria) {
      case 'createdAtAsc':
        return [...list].sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * -1);
        break;
      case 'createdAtDesc':
        return [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priceAsc':
        return [...list].sort((a, b) => new Date(a.minPrice) - new Date(b.minPrice));
        break;
      case 'priceDesc':
        return [...list].sort((a, b) => (new Date(a.minPrice) - new Date(b.minPrice)) * -1);
        break;
      case 'soldAsc':
        return [...list].sort((a, b) => new Date(a.totalSold) - new Date(b.totalSold));
        break;
      case 'soldDesc':
        return [...list].sort((a, b) => (new Date(a.totalSold) - new Date(b.totalSold)) * -1);
        break;
      case 'rateAsc':
        return [...list].sort((a, b) => new Date(a.rating) - new Date(b.rating));
        break;
      case 'rateDesc':
        return [...list].sort((a, b) => (new Date(a.rating) - new Date(b.rating)) * -1);
        break;
      default:
        return [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
    }
  }, [products, filteredProducts, sortingCriteria]);

  const onSortChange = (value) => {
    setSortingCriteria(value);
  };

  return (
    <div className="container mx-auto">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className=" grid grid-cols-12 lg:gap-x-10 gap-x-3">
            <div className="lg:col-span-3 md:col-span-4 col-span-12 mt-10 sm:min-h-screen ">
              <div className=" top-28 ">
                <FilterAdvanced onFilter={handleFilterProducts} onClickFilter={handleClickFilter} products={products} />
              </div>
            </div>

            {(filteredProducts.length === 0 && onClickFilter) ||
              productList.length === 0 ? (
              <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8 bg-white shadow-md mt-10 rounded-2xl">
                <p className="text-center text-lg font-bold text-gray-500 ">
                  Không tìm thấy sản phẩm
                </p>
              </div>
            ) : (
              <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8  col-span-12">
                <ListProduct products={productList} title={title} onSortChange={onSortChange} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchProduct;
