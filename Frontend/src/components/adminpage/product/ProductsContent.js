import { useEffect, useMemo } from "react";
import ProductTable from "./ProductTable";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";
import { useState } from "react";
import SortProduct from "../../layout/SortProduct";
import { BiSortAlt2 } from "react-icons/bi";

const ProductsContent = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortingCriteria , setSortingCriteria] = useState('CreatedAtAsc')


    useEffect(() => {
        const fetchAllProducts = async () => {
            const response = await fetchWithAuth(
                summaryApi.allProduct.url,
                {
                    method: summaryApi.allProduct.method,
                }
            );
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                setProducts(data.data);
            }
            else {
                console.log(data);
            }
        }
        const fetchAllCategories = async () => {
            const response = await fetchWithAuth(
                summaryApi.allCategory.url,
                {
                    method: summaryApi.allCategory.method,
                }
            );
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                setCategories(data.data);
            }
            else {
                console.log(data);
            }
        }
        const fetchAllBrands = async () => {
            const response = await fetchWithAuth(
                summaryApi.allBrand.url,
                {
                    method: summaryApi.allBrand.method,
                }
            );
            const data = await response.json();
            if (data.respCode === '000' && data.data) {
                setBrands(data.data);
            }
            else {
                console.log(data);
            }
        }
        fetchAllProducts();
        fetchAllCategories();
        fetchAllBrands();
    }, []);

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
                return [...list].sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * -1);
                break;
        }
    }, [products, filteredProducts, sortingCriteria]);

    const onSortChange = (value) => {
        setSortingCriteria(value);
    };

    return (
        <>
            <ProductTable products={productList} setProducts={setProducts}
                categories={categories} setCategories={setCategories}
                brands={brands} setBrands={setBrands} onSortChange={onSortChange}/>
        </>
    );
}
export default ProductsContent;