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
    @JsonProperty("netWeight")
    private String netWeight;
    @JsonProperty("beanType")
    private String beanType;
    @JsonProperty("origin")
    private String origin;
    @JsonProperty("roadLevel")
    private String roadLevel;
    @JsonProperty("flavoNotes")
    private String flavoNotes;
    @JsonProperty("caffeineContents")
    private String caffeineContents;
    @JsonProperty("cafeForm")
    private String cafeForm;
    @JsonProperty("articleTitle")
    private String articleTitle;
    @JsonProperty("article")
    private String article;
}
