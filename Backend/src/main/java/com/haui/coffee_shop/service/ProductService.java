package com.haui.coffee_shop.service;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.enums.Status;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.model.*;
import com.haui.coffee_shop.payload.request.ProductRequest;
import com.haui.coffee_shop.payload.response.ProductResponse;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.payload.response.ReviewResponse;
import com.haui.coffee_shop.repository.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductItemRepository productItemRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final TypeProductRepository typeProductRepository;
    private final ReviewRepository reviewRepository;
    private final MessageBuilder messageBuilder;
    private final CloudinaryService cloudinaryService;
    private final ImageRepository imageRepository;
    private final OrderItemRepository orderItemRepository;
    public RespMessage getAllProduct() {
        List<Product> products = productRepository.findAll();
        List<Product> activeProducts = products.stream().filter(product -> product.getStatus() == Status.ACTIVE).toList();
        List<ProductResponse> productResponseList = new ArrayList<>();
        for (Product product : activeProducts) {
            List<Image> images = imageRepository.findByProduct(product);
            ProductResponse productResponse = getProductResponse(product);
            productResponse.setImages(images);
            productResponseList.add(productResponse);
        }
        return messageBuilder.buildSuccessMessage(productResponseList);
    }


    public RespMessage getProductById(Long id) {
        Optional<Product> productOp = productRepository.findById(id);

        if (productOp.isPresent()) {
            Product product = productOp.get();
            if (product.getStatus() == Status.INACTIVE) {
                throw new CoffeeShopException(Constant.FIELD_NOT_VALID, new Object[]{"product"}, "Product not active");
            }
            ProductResponse productResponse = getProductResponse(product);
            List<Image> images = imageRepository.findByProduct(product);
            productResponse.setImages(images);
            return messageBuilder.buildSuccessMessage(productResponse);
        } else {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"product"}, "Product not found");
        }
    }
    public RespMessage getProductsByCategoryId(Long categoryId) {
        try {
            List<Product> tempProducts = productRepository.findByCategoryId(categoryId);
            List<Product> products = tempProducts.stream().filter(product -> product.getStatus() == Status.ACTIVE).toList();
            List<ProductResponse> productResponseList = new ArrayList<>();
            for (Product product : products) {
                ProductResponse productResponse = getProductResponse(product);
                productResponseList.add(productResponse);
            }
            return messageBuilder.buildSuccessMessage(productResponseList);
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, null , null);
        }
    }
    
    public RespMessage getProductsByBrandId(Long brandId) {
        try {
            List<Product> tempProducts = productRepository.findByBrandId(brandId);
            List<Product> products = tempProducts.stream().filter(product -> product.getStatus() == Status.ACTIVE).toList();
            List<ProductResponse> productResponseList = new ArrayList<>();
            for (Product product : products) {
                ProductResponse productResponse = getProductResponse(product);
                productResponseList.add(productResponse);
            }
            return messageBuilder.buildSuccessMessage(productResponseList);
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, null , null);
        }
    }


    // Tìm kiếm sản phẩm theo từ khóa và trả về RespMessage
    public RespMessage searchProductsByKeyword(String keyword) {
        try {
            List<Product> products = productRepository
                    .searchByKeyword(keyword)
                    .stream().filter(product -> product.getStatus() == Status.ACTIVE).toList();
            if (products.isEmpty()) {
                return messageBuilder.buildFailureMessage(Constant.FIELD_NOT_FOUND, null, null);
            }
            List<ProductResponse> productResponseList = new ArrayList<>();
            for (Product product : products) {
                ProductResponse productResponse = getProductResponse(product);
                productResponseList.add(productResponse);
            }
            return messageBuilder.buildSuccessMessage(productResponseList);
        } catch (Exception e) {
            // Xây dựng phản hồi thất bại khi có lỗi
            return messageBuilder.buildFailureMessage(Constant.SYSTEM_ERROR, null, null);
        }
    }


    public RespMessage addProduct(ProductRequest productRequest) {
        if (productRequest.getName() == null || productRequest.getName().isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[]{"name"}, "Product name must be not null");
        }
        if (productRequest.getCategoryId() <= 0) {
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[]{"categoryId"}, "Category id invalid");
        }
        if (productRequest.getBrandId() <= 0) {
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[]{"brandId"}, "Brand id invalid");
        }

        Optional<Category> categoryOptional = categoryRepository.findById(productRequest.getCategoryId());
        if (categoryOptional.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"categoryId"}, "Category id not found");
        }
        Optional<Brand> brandOptional = brandRepository.findById(productRequest.getBrandId());
        if (brandOptional.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"brandId"}, "Brand id not found");
        }
        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setCategory(categoryOptional.get());
        product.setBrand(brandOptional.get());
        product.setNetWeight(productRequest.getNetWeight());
        product.setBeanType(productRequest.getBeanType());
        product.setOrigin(productRequest.getOrigin());
        product.setRoadLevel(productRequest.getRoadLevel());
        product.setFlavoNotes(productRequest.getFlavoNotes());
        product.setCaffeineContents(productRequest.getCaffeineContents());
        product.setCafeForm(productRequest.getCafeForm());
        product.setArticleTitle(productRequest.getArticleTitle());
        product.setArticle(productRequest.getArticle());
        try {
            productRepository.save(product);
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{e.getMessage()}, "Error when add product");
        }
        return messageBuilder.buildSuccessMessage(getProductResponse(product));
    }

    @Transactional
    public RespMessage addBrand(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[]{"name"}, "Brand name must be not null");
        }
        if (brandRepository.findByName(name).isPresent()) {
            throw new CoffeeShopException(Constant.FIELD_EXISTED, new Object[]{"name"}, "Brand name is duplicate");
        }
        Brand brand = new Brand();
        brand.setName(name);
        try {
            brandRepository.save(brand);
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{e.getMessage()}, "Error when add brand");
        }
        return messageBuilder.buildSuccessMessage(brand);
    }

    @Transactional
    public RespMessage addTypeProduct(String name) {
        if (name == null || name.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[]{"name"}, "Type product name must be not null");
        }
        if (typeProductRepository.findByName(name).isPresent()) {
            throw new CoffeeShopException(Constant.FIELD_EXISTED, new Object[]{"name"}, "Type product name is duplicate");
        }
        TypeProduct typeProduct = new TypeProduct();
        typeProduct.setName(name);
        try {
            typeProductRepository.save(typeProduct);
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{e.getMessage()}, "Error when add type product");
        }
        return messageBuilder.buildSuccessMessage(typeProduct);
    }

    public RespMessage deleteProduct(Long id) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"product"}, "Product not found");
        }
        Product product = productOptional.get();
        product.setStatus(Status.INACTIVE);
        productRepository.save(product);
        return messageBuilder.buildSuccessMessage(getProductResponse(product));
    }

    public RespMessage updateProduct(Long id, ProductRequest request) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"product"}, "Product not found");
        }

        Product product = productOptional.get();

        if (request.getName() != null && !request.getName().isEmpty()) {
            product.setName(request.getName());
        }

        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            product.setDescription(request.getDescription());
        }

        if (request.getCategoryId() > 0) {
            Optional<Category> categoryOptional = categoryRepository.findById(request.getCategoryId());
            if (categoryOptional.isEmpty()) {
                throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"categoryId"}, "Category not found");
            }
            product.setCategory(categoryOptional.get());
        }

        if (request.getBrandId() > 0) {
            Optional<Brand> brandOptional = brandRepository.findById(request.getBrandId());
            if (brandOptional.isEmpty()) {
                throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"brandId"}, "Brand not found");
            }
            product.setBrand(brandOptional.get());
        }

        if (request.getNetWeight() != null) {
            product.setNetWeight(request.getNetWeight());
        }

        if (request.getBeanType() != null) {
            product.setBeanType(request.getBeanType());
        }

        if (request.getOrigin() != null) {
            product.setOrigin(request.getOrigin());
        }

        if (request.getRoadLevel() != null) {
            product.setRoadLevel(request.getRoadLevel());
        }

        if (request.getFlavoNotes() != null) {
            product.setFlavoNotes(request.getFlavoNotes());
        }

        if (request.getCaffeineContents() != null) {
            product.setCaffeineContents(request.getCaffeineContents());
        }

        if (request.getCafeForm() != null) {
            product.setCafeForm(request.getCafeForm());
        }

        if (request.getArticleTitle() != null) {
            product.setArticleTitle(request.getArticleTitle());
        }

        if (request.getArticle() != null) {
            product.setArticle(request.getArticle());
        }

        productRepository.save(product);
        return messageBuilder.buildSuccessMessage(getProductResponse(product));
    }


    public RespMessage getAllTypeProduct() {
        List<TypeProduct> typeProducts = typeProductRepository.findAll().stream()
                .filter(typeProduct -> typeProduct.getStatus() == Status.ACTIVE).toList();
        return messageBuilder.buildSuccessMessage(typeProducts);
    }

    public RespMessage uploadImage(Long id, MultipartFile file) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"product"}, "Product not found");
        }
        Product product = productOptional.get();
        try {
            Map<String, Object> data = cloudinaryService.upload(file, "Product");
            String url = (String) data.get("secure_url");
            Image image = new Image();
            image.setUrl(url);
            image.setProduct(product);
            imageRepository.save(image);
            return messageBuilder.buildSuccessMessage(getProductResponse(product));
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{e.getMessage()}, "Error when upload image");
        }

    }

    public ProductResponse getProductResponse(Product product) {
        try {
            ProductResponse productResponse = new ProductResponse();
            productResponse.setId(product.getId());
            productResponse.setName(product.getName());
            productResponse.setDescription(product.getDescription());
            productResponse.setCategory(product.getCategory());
            productResponse.setBrand(product.getBrand());
            productResponse.setNetWeight(product.getNetWeight());
            productResponse.setBeanType(product.getBeanType());
            productResponse.setOrigin(product.getOrigin());
            productResponse.setRoadLevel(product.getRoadLevel());
            productResponse.setFlavoNotes(product.getFlavoNotes());
            productResponse.setCaffeineContents(product.getCaffeineContents());
            productResponse.setCafeForm(product.getCafeForm());
            productResponse.setArticleTitle(product.getArticleTitle());
            productResponse.setArticle(product.getArticle());
            productResponse.setCreatedAt(product.getCreatedAt());

            List<Image> images = imageRepository.findByProduct(product);
            productResponse.setImages(images);

            List<Review> reviews = reviewRepository.findByProductId(product.getId());
            double rating = 0;
            int totalReview = 0;

            if (!reviews.isEmpty()) {
                rating = reviews.stream().mapToDouble(Review::getRating).average().getAsDouble();
                totalReview = reviews.size();
            }
            productResponse.setRating(rating);
            productResponse.setTotalReview(totalReview);

            Integer totalSold = orderItemRepository.findTotalSold(product.getId())
                    .orElse(0);
            productResponse.setTotalSold(totalSold);

            Double maxPrice = productRepository.maxPrice(product.getId())
                    .orElse(0.0);
            productResponse.setMaxPrice(maxPrice);

            Double minPrice = productRepository.minPrice(product.getId())
                    .orElse(0.0);
            productResponse.setMinPrice(minPrice);

            return productResponse;
        }
        catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{e.getMessage()}, "Error when get product response");
        }
    }

    public RespMessage deleteImage(Long id) {
        Optional<Image> imageOptional = imageRepository.findById(id);
        if (imageOptional.isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[]{"image"}, "Image not found");
        }
        Image image = imageOptional.get();
        imageRepository.delete(image);
        cloudinaryService.delete(image.getUrl());
        ProductResponse productResponse = getProductResponse(image.getProduct());

        return messageBuilder.buildSuccessMessage(productResponse);
    }
    	
    public RespMessage getBestSellingProducts(Long brandId, Long CategoryId ) {
    	LocalDate localDate = LocalDate.now().minusDays(90);
    	Date fromDate = java.util.Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

    	Pageable  pageable = PageRequest.of(0, 15);
    	List<Long> ids = orderItemRepository.findTop15ActiveBestSellingProductsInLast90Days(CategoryId, brandId, fromDate, pageable);
        List<ProductResponse> productResponses = new ArrayList<>();
        
        for (Long id : ids) {
            try {
                Optional<Product> productOp = productRepository.findById(id);
                if (productOp.isPresent()) {
                    Product product = productOp.get();
                    if (product.getStatus() == Status.ACTIVE) {
                        ProductResponse productResponse = getProductResponse(product);
                        List<Image> images = imageRepository.findByProduct(product);
                        productResponse.setImages(images);
                        productResponses.add(productResponse);
                    }
                }
            } catch (Exception e) {
                continue;
            }
        }
        
        return messageBuilder.buildSuccessMessage(productResponses);
    }
    
    public void exportToExcel(HttpServletResponse response) throws IOException {
        List<Product> products = productRepository.findAll();
        List<Product> productList = products.stream()
                .filter(product -> product.getStatus() == Status.ACTIVE)
                .toList();

        // Lấy ngày hiện tại và format thành dd-MM-yyyy
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String fileName = "Total-products-" +today.format(formatter);
        
        

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(fileName);

        // Tạo style căn giữa theo chiều dọc
        CellStyle verticalCenterStyle = workbook.createCellStyle();
        verticalCenterStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "STT", "ID sản phẩm", "Tên sản phẩm", "Mô tả", "Danh mục", "Thương hiệu", "Trạng thái",
            "Khối lượng tịnh", "Loại hạt", "Xuất xứ", "Mức độ rang",
            "Ghi chú hương vị", "Hàm lượng caffeine", "Dạng cà phê", "Ngày tạo",
            "ID từng phiên bản", "Loại sản phẩm", "Giá", "Số lượng", "Giảm giá", "Trạng thái phiên bản"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(verticalCenterStyle); // Căn giữa header nếu muốn
        }

        int rowIdx = 1;
        int stt = 1;

        for (Product product : productList) {
            List<ProductItem> items = productItemRepository.findByProductId(product.getId());
            int itemCount = items.size();
            int startRow = rowIdx;
            int endRow = rowIdx + itemCount - 1;

            // Tạo các dòng cho từng ProductItem
            for (ProductItem item : items) {
                Row row = sheet.createRow(rowIdx++);
                int col = 15;
                row.createCell(col++).setCellValue(item.getId());
                row.createCell(col++).setCellValue(item.getType().getName());
                row.createCell(col++).setCellValue(item.getPrice());
                row.createCell(col++).setCellValue(item.getStock());
                row.createCell(col++).setCellValue(item.getDiscount());
                row.createCell(col++).setCellValue(item.getStatus().toString());
            }

            // Đưa dữ liệu của Product vào các ô gộp và áp dụng style căn giữa dọc
            for (int i = 0; i < 15; i++) {
                Cell cell = sheet.getRow(startRow).createCell(i);
                cell.setCellStyle(verticalCenterStyle);

                switch (i) {
                    case 0 -> cell.setCellValue(stt++);
                    case 1 -> cell.setCellValue(product.getId());
                    case 2 -> cell.setCellValue(product.getName());
                    case 3 -> cell.setCellValue(product.getDescription());
                    case 4 -> cell.setCellValue(product.getCategory().getName());
                    case 5 -> cell.setCellValue(product.getBrand().getName());
                    case 6 -> cell.setCellValue(product.getStatus().toString());
                    case 7 -> cell.setCellValue(product.getNetWeight());
                    case 8 -> cell.setCellValue(product.getBeanType());
                    case 9 -> cell.setCellValue(product.getOrigin());
                    case 10 -> cell.setCellValue(product.getRoadLevel());
                    case 11 -> cell.setCellValue(product.getFlavoNotes());
                    case 12 -> cell.setCellValue(product.getCaffeineContents());
                    case 13 -> cell.setCellValue(product.getCafeForm());
                    case 14 -> cell.setCellValue(product.getCreatedAt().toString());
                }

                // Nếu product có nhiều productitem thì gộp các ô lại
                if (itemCount > 1) {
                    sheet.addMergedRegion(new CellRangeAddress(startRow, endRow, i, i));
                }
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Thiết lập header cho response với tên file có ngày tháng
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"; filename*=UTF-8''" + encodedFileName);

        workbook.write(response.getOutputStream());
        workbook.close();
        
    }

}
