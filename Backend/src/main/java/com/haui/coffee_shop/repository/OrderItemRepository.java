package com.haui.coffee_shop.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.haui.coffee_shop.model.OrderItem;

import javax.swing.text.html.Option;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") long orderId);

    @Query("SELECT oi.productItem.product, " +
    	       "SUM(oi.amount) AS totalQuantity, " +
    	       "SUM(oi.amount * (oi.price - oi.discount)) AS totalRevenue " +
    	       "FROM OrderItem oi " +
    	       "JOIN oi.order o " +
    	       "WHERE o.status = 'Completed' " +
    	       "AND oi.productItem.product.status = 'ACTIVE' " +
    	       "AND o.orderDate BETWEEN :startDate AND :endDate " +
    	       "GROUP BY oi.productItem.product " +
    	       "ORDER BY totalQuantity DESC")
    	List<Object[]> findTop5MonthlySellingProducts(@Param("startDate") Date startDate,
    	                                              @Param("endDate") Date endDate,
    	                                              Pageable pageable);

    	@Query("SELECT oi.productItem.product, " +
    	       "SUM(oi.amount) AS totalQuantity, " +
    	       "SUM(oi.amount * (oi.price - oi.discount)) AS totalRevenue " +
    	       "FROM OrderItem oi " +
    	       "JOIN oi.order o " +
    	       "WHERE o.status = 'Completed' " +
    	       "AND oi.productItem.product.status = 'ACTIVE' " +
    	       "GROUP BY oi.productItem.product " +
    	       "ORDER BY totalQuantity DESC")
    	List<Object[]> findTop5BestSellingProducts(Pageable pageable);


    @Query("SELECT p, COALESCE(SUM(oi.amount), 0) AS totalQuantity, " +
    	       "COALESCE(SUM(oi.amount * (oi.price - oi.discount)), 0) AS totalRevenue " +
    	       "FROM Product p " +
    	       "LEFT JOIN ProductItem pi ON pi.product = p " +
    	       "LEFT JOIN OrderItem oi ON oi.productItem = pi " +
    	       "LEFT JOIN oi.order o " +
    	       "WHERE p.status = 'ACTIVE' AND (o IS NULL OR o.status = 'Completed') " +
    	       "GROUP BY p " +
    	       "ORDER BY totalQuantity ASC")
    	List<Object[]> findTop5SlowSellingProducts(Pageable pageable);

    	@Query("SELECT p, COALESCE(SUM(oi.amount), 0) AS totalQuantity, " +
    		       "COALESCE(SUM(oi.amount * (oi.price - oi.discount)), 0) AS totalRevenue " +
    		       "FROM Product p " +
    		       "LEFT JOIN ProductItem pi ON pi.product = p " +
    		       "LEFT JOIN OrderItem oi ON oi.productItem = pi " +
    		       "LEFT JOIN oi.order o " +
    		       "WHERE p.status = 'ACTIVE' AND (o IS NULL OR (o.status = 'Completed' AND o.orderDate BETWEEN :startDate AND :endDate)) " +
    		       "GROUP BY p " +
    		       "ORDER BY totalQuantity ASC")
    		List<Object[]> findTop5MonthlySlowSellingProducts(
    		        @Param("startDate") Date startDate,
    		        @Param("endDate") Date endDate,
    		        Pageable pageable);


    @Query("SELECT oi.order.shippingAddress.user, SUM(oi.amount * (oi.price - oi.discount)) AS total " +
            "FROM OrderItem oi " +
            "JOIN oi.order o " +
            "WHERE o.status = 'Completed'" +
            "GROUP BY oi.order.shippingAddress.user " +
            "ORDER BY total DESC")
    List<Object[]> findTop5BestCustomers();

    @Query("SELECT oi.order.shippingAddress.user, SUM(oi.amount * (oi.price - oi.discount)) AS totalQuantity " +
            "FROM OrderItem oi " +
            "JOIN oi.order o " +
            "WHERE o.status = 'Completed' AND MONTH(o.orderDate) = :month AND YEAR(o.orderDate) = :year " +
            "GROUP BY oi.order.shippingAddress.user " +
            "ORDER BY totalQuantity DESC")
    List<Object[]> findTop5MonthlyCustomers(@Param("month") int month,
                                                   @Param("year") int year,
                                                   Pageable pageable);

    @Query("SELECT SUM(oi.amount) FROM OrderItem oi WHERE oi.productItem.product.id = :productId")
    Optional<Integer> findTotalSold(long productId);
    
    @Query("SELECT oi.productItem.product.id " +
    	       "FROM OrderItem oi " +
    	       "JOIN oi.order o " +
    	       "JOIN oi.productItem pi " +
    	       "JOIN pi.product p " +
    	       "WHERE o.status = 'Completed' " +
    	       "AND p.status = 'ACTIVE' " +
    	       "AND o.orderDate >= :fromDate " +
    	       "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
    	       "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
    	       "GROUP BY oi.productItem.product.id " +
    	       "ORDER BY SUM(oi.amount) DESC")
    	List<Long> findTop15ActiveBestSellingProductsInLast90Days(
    	        @Param("categoryId") Long categoryId,
    	        @Param("brandId") Long brandId,
    	        @Param("fromDate") Date fromDate,
    	        Pageable pageable);

 

}
