package com.haui.coffee_shop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.enums.Status;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.model.Brand;
import com.haui.coffee_shop.payload.request.BrandRequest;
import com.haui.coffee_shop.payload.response.BrandResponse;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.repository.BrandRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;
    private final MessageBuilder messageBuilder;

    public RespMessage addBrand(BrandRequest brandRequest) {
        if (brandRequest.getName() == null || brandRequest.getName().trim().isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[]{"name"}, "Brand name must be not null");
        }
        
        if (brandRepository.findByName(brandRequest.getName()).isPresent()) {
            throw new CoffeeShopException(Constant.FIELD_EXISTED, new Object[]{"name"}, "Brand name is duplicate");
        }
        
        Brand brand = new Brand();
        brand.setName(brandRequest.getName());
        brand.setStatus(brandRequest.getStatus() != null ? brandRequest.getStatus() : Status.ACTIVE);
        brand.setArticleTitle(brandRequest.getArticleTitle());
        brand.setArticle(brandRequest.getArticle());
        brand.setDescription(brandRequest.getDescription());
        try {
            Brand savedBrand = brandRepository.save(brand);
            BrandResponse brandResponse = convertToBrandResponse(savedBrand);
            return messageBuilder.buildSuccessMessage(brandResponse);
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.UNDEFINED, null, "Could not add brand");
        }
    }

    public RespMessage getAllBrands() {
        List<Brand> brands = brandRepository.getAll()
                .stream().filter(brand -> brand.getStatus().equals(Status.ACTIVE)).toList();
                
        List<BrandResponse> brandResponses = brands.stream()
                .map(this::convertToBrandResponse)
                .collect(Collectors.toList());
                
        return messageBuilder.buildSuccessMessage(brandResponses);
    }

    public RespMessage updateBrand(long id, BrandRequest brandRequest) {
        if (brandRequest.getName() == null || brandRequest.getName().trim().isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[]{"name"}, "Brand name must be not null");
        }
        
        Optional<Brand> brand = brandRepository.findById(id);
        if(brand.isPresent()) {
            Brand brandEntity = brand.get();
            if (!brandEntity.getName().equals(brandRequest.getName()) && brandRepository.findByName(brandRequest.getName()).isPresent()) {
                throw new CoffeeShopException(Constant.FIELD_EXISTED, new Object[]{"name"}, "Brand name is duplicate");
            }
            
            brandEntity.setName(brandRequest.getName());
            
            if (brandRequest.getStatus() != null) {
                brandEntity.setStatus(brandRequest.getStatus());
            }
            
            brandEntity.setArticleTitle(brandRequest.getArticleTitle());
            brandEntity.setArticle(brandRequest.getArticle());
            brandEntity.setDescription(brandRequest.getDescription());
            try {
                Brand savedBrand = brandRepository.save(brandEntity);
                BrandResponse brandResponse = convertToBrandResponse(savedBrand);
                return messageBuilder.buildSuccessMessage(brandResponse);
            } catch (Exception e) {
                throw new CoffeeShopException(Constant.UNDEFINED, null, "Could not update brand");
            }
        } else {
            throw new CoffeeShopException(Constant.NOT_FOUND, null, "Brand not found");
        }
    }

    public RespMessage deleteBrand(long id) {
        Optional<Brand> brand = brandRepository.findById(id);
        if (brand.isPresent()) {
            Brand brandToDelete = brand.get();
            brandToDelete.setStatus(Status.INACTIVE);
            try {
                Brand savedBrand = brandRepository.save(brandToDelete);
                BrandResponse brandResponse = convertToBrandResponse(savedBrand);
                return messageBuilder.buildSuccessMessage(brandResponse);
            } catch (Exception e) {
                throw new CoffeeShopException(Constant.UNDEFINED, null, "Could not delete brand");
            }
        } else {
            throw new CoffeeShopException(Constant.NOT_FOUND, null, "Brand not found");
        }
    }
    
    private BrandResponse convertToBrandResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .status(brand.getStatus())
                .description(brand.getDescription())
                .articleTitle(brand.getArticleTitle())
                .article(brand.getArticle())
                .build();
    }
}