package com.haui.coffee_shop.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.haui.coffee_shop.common.enums.Status;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BrandRequest {
	@JsonProperty("Name")
	private String name;

	@JsonProperty("Status")
    private Status status;
    
	@JsonProperty( "Description")
    private String description;
    
	@JsonProperty("ArticleTitle")
    private String articleTitle;
    
	@JsonProperty("Article")
    private String article;
}
