import React, { useEffect, useState, useMemo } from "react";
import summaryApi from "../common";
import ListProduct from "../components/homepage/ListProduct";
import { useParams } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import FilterCategory from "../components/homepage/FilterCategory";
import ArticleComponent from "../components/layout/ArticleComponent";
import ProductSlider from "../components/layout/ProductSlider";

const CategoryPage = () => {
  const [products, setProducts] = useState([]);
  const { categoryName, categoryId } = useParams();
  const [loading, setLoading] = useState(false);
  const [onClickFilter, setOnClickFilter] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [newProducts, setNewProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([])

  const [sortingCriteria , setSortingCriteria] = useState('CreatedAtDesc')

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

  useEffect(() => {
    setLoading(true);
    const fetchProductByCategory = async () => {
      try {
        const categoryResponse = await fetch(
          summaryApi.getProductByCategory.url + `${categoryId}`,
          {
            method: summaryApi.getProductByCategory.method,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const dataResult = await categoryResponse.json();
        if (dataResult.respCode === "000") {
          setProducts(dataResult.data);
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductByCategory();
  }, [categoryId]);

  useEffect(() => {
    const fetchBestSellingProduct = async () => {
      try {
        const productResponse = await fetch(`${summaryApi.bestSellingProduct.url}?categoryId=${categoryId}`, {
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

  const onSortChange = (value) => {
    setSortingCriteria(value);
  };

  return (
    <>
      {products[0]?.category && (
        <ArticleComponent
          keyword={categoryName}
          title={products[0].category.articleTitle}
          article={products[0].category.article}
        />
      )}

      <div className="container  mx-auto ">
        {loading && (
          <div className="flex justify-center items-center h-screen">
            <LoadingOutlined style={{ fontSize: 48, color: 'red' }} spin />
          </div>
        )}

        <div className=" grid grid-cols-12 lg:gap-x-10 gap-x-3">
          <div className="lg:col-span-3 md:col-span-4 col-span-12 mt-10 sm:min-h-screen ">
            <div className=" top-28 ">
              <FilterCategory onFilter={handleFilterProducts} onClickFilter={handleClickFilter} products={products} />
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
              <ListProduct products={productList} title={categoryName}  onSortChange={onSortChange}/>
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8  col-span-12">
        <ProductSlider productList={newProducts} title={'Sản phẩm mới của danh mục'} />
      </div>
      <div className="lg:col-start-4 lg:col-span-9 md:col-start-5 md:col-span-8  col-span-12">
        <ProductSlider productList={bestSellingProducts} title={'Sản phẩm bán chạy của danh mục'} />
      </div>
      
    </>
  );
};

export default CategoryPage;
