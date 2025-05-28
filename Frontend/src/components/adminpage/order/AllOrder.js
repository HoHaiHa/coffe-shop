import React, { useCallback, useEffect, useState } from "react";
import OrderTable from "./OrderTable";
import fetchWithAuth from "../../../helps/fetchWithAuth";
import summaryApi from "../../../common";

const AllOrder = () => {
  const [orderList, setOrderList] = useState([]);
  const [dateRange, setDateRange] = useState(null);

  const fetchAllOrder = useCallback(async () => {
    const params = new URLSearchParams();

    if (dateRange) {
      if (dateRange[0]) params.append('startDate', dateRange[0].toISOString());
      if (dateRange[1]) params.append('endDate', dateRange[1].toISOString());
    }

    const response = await fetchWithAuth(`${summaryApi.getAllOrder.url}?${params.toString()}`, {
      method: summaryApi.getAllOrder.method,
    });

    const result = await response.json();

    if (result.respCode === "000") {
      setOrderList(result.data);
    } else {
      console.log("error get all order");
    }
  }, [dateRange]
  )

  useEffect(() => {
    fetchAllOrder();
  }, [fetchAllOrder, dateRange]);

  const refreshOrderList = () => {
    fetchAllOrder();
  };

  const handleDateFilter = (value) => {
    setDateRange(value);
  }


  return (
    <div className="mt-12">
      <OrderTable orderList={orderList} refreshOrderList={refreshOrderList} handleDateFilter={handleDateFilter} />
    </div>
  );
};

export default AllOrder;
