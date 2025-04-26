package com.haui.coffee_shop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.haui.coffee_shop.common.enums.Status;
import com.haui.coffee_shop.payload.response.ProductResponse;
import com.haui.coffee_shop.payload.response.ProductStatisticResponse;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @ManyToOne()
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne()
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status;
    
    @Column(name = "netWeight")
    private String netWeight;
    
    @Column(name = "beanType")
    private String beanType;
    
    @Column(name = "origin")
    private String origin;
    
    @Column(name = "roadLevel")
    private String roadLevel;
    
    @Column(name = "flavoNotes")
    private String flavoNotes;
    
    
    @Column(name = "caffeineContents")
    private String caffeineContents;
    
    @Column(name = "cafeForm")
    private String cafeForm;
    
    @Column(name = "articleTitle")
    private String articleTitle;
    
    @Column(name = "article", columnDefinition = "TEXT")
    private String article;
    
    @CreationTimestamp
    @Column(updatable = false)
    private Date createdAt;
    
    
    @PrePersist
    public void prePersist() {
        if (status == null) status = Status.ACTIVE;
    }

    public ProductStatisticResponse toStatisticResponse() {
        return new ProductStatisticResponse(id, name, category.getName(), brand.getName(), 0, 0);
    }
}
