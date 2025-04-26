package com.haui.coffee_shop.payload.response;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import com.haui.coffee_shop.common.enums.Status;
import com.haui.coffee_shop.model.Brand;
import com.haui.coffee_shop.model.Category;
import com.haui.coffee_shop.model.Image;
import com.haui.coffee_shop.model.Product;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductResponse {
    private long id;

    private String name;

    private String description;

    private Category category;

    private Brand brand;

    private Status status;

    private BigDecimal price;

    private List<Image> images;

    private double rating;

    private int totalReview;

    private int totalSold;

    private double maxPrice;

    private double minPrice;
    private String netWeight;
    private String beanType;
    private String origin;
    private String roadLevel;
    private String flavoNotes;
    private String caffeineContents;
    private String cafeForm;
    private String articleTitle;
    private String article;
    private Date createdAt;


}
