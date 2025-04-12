package com.haui.coffee_shop.payload.response;


import com.haui.coffee_shop.common.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BrandResponse {
    private long id;
    private String name;

    private Status status;

    private String description;
    
    private String articleTitle;
    
    private String article;
   
}
