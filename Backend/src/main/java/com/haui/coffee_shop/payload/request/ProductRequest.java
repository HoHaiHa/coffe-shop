package com.haui.coffee_shop.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductRequest {
    @JsonProperty("Name")
    private String name;
    @JsonProperty("Description")
    private String description;
    @JsonProperty("CategoryId")
    private long categoryId;
    @JsonProperty("BrandId")
    private long brandId;
    @JsonProperty("NetWeight")
    private String netWeight;
    @JsonProperty("BeanType")
    private String beanType;
    @JsonProperty("Origin")
    private String origin;
    @JsonProperty("RoadLevel")
    private String roadLevel;
    @JsonProperty("FlavoNotes")
    private String flavoNotes;
    @JsonProperty("CaffeineContents")
    private String caffeineContents;
    @JsonProperty("CafeForm")
    private String cafeForm;
    @JsonProperty("ArticleTitle")
    private String articleTitle;
    @JsonProperty("Article")
    private String article;
}
