import React, { useEffect, useState } from "react";

import summaryApi from "../../common";
import BrandCard from "../layout/BrandCard";
const ListBrand = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandResponse = await fetch(summaryApi.allBrand.url, {
          method: summaryApi.allBrand.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResult = await brandResponse.json();
        if (dataResult.respCode === "000") {
          setBrands(dataResult.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchBrands();
  }, []);

  return (
    <>
      <div className="container mx-auto bg-white p-2  md:p-4  shadow-md md:rounded-md">
        <div className="mt-4 grid md:grid-cols-1 grid-cols-2 gap-1 lg:gap-2   ">
          {brands.map((brand, index) => (
            <BrandCard key={index} brand={brand} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ListBrand;
