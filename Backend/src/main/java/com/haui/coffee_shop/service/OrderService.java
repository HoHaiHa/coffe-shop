package com.haui.coffee_shop.service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.Workbook;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.enums.OrderStatus;
import com.haui.coffee_shop.common.enums.PaymentMethod;
import com.haui.coffee_shop.common.enums.Status;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.model.*;
import com.haui.coffee_shop.payload.request.OrderItemRequest;
import com.haui.coffee_shop.payload.request.OrderRequest;
import com.haui.coffee_shop.payload.response.OrderItemResponse;
import com.haui.coffee_shop.payload.response.OrderResponse;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.payload.response.ShippingAddressResponse;
import com.haui.coffee_shop.repository.*;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private MessageBuilder messageBuilder;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private ProductItemRepository productItemRepository;
    @Autowired
    private ShippingAddressRepository shippingAddressRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private ImageRepository imageRepository;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private UserRepository userRepository;

    public RespMessage getAllOrders(Date startDate,Date endDate) {
        List<Order> orders = orderRepository.findAllFilterOrderDate(startDate,endDate);
        List<OrderResponse> orderResponses = new ArrayList<>();
        for (Order order : orders) {
            OrderResponse orderResponse = new OrderResponse();
            orderResponse.setOrderId(order.getId());
            orderResponse.setOrderDate(order.getOrderDate());
            orderResponse.setOrderStatus(order.getStatus().toString());
            orderResponse.setPaymentMethod(order.getPaymentMethod().toString());
            orderResponse.setShippingAddress(order.getShippingAddress().toResponse());
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
            List<OrderItemResponse> orderItemResponses = orderItems.stream().map(this::toOrderItemResponse).toList();
            double totalPrice = 0;
            for (OrderItem orderItem : orderItems) {
                totalPrice += (orderItem.getPrice() - orderItem.getDiscount())*orderItem.getAmount();
            }
            totalPrice += 10000;
            orderResponse.setOrderItems(orderItemResponses);
            orderResponse.setTotal(totalPrice);
            orderResponses.add(orderResponse);
        }
        return messageBuilder.buildSuccessMessage(orderResponses);
    }

    public RespMessage getOrderById(long orderId) {
        Optional<Order> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
            OrderResponse orderResponse = new OrderResponse();
            orderResponse.setOrderId(order.getId());
            orderResponse.setOrderDate(order.getOrderDate());
            List<OrderItemResponse> orderItemResponses = orderItems.stream().map(this::toOrderItemResponse).toList();
            double totalPrice = 0;
            for (OrderItem orderItem : orderItems) {
                totalPrice += (orderItem.getPrice() - orderItem.getDiscount())*orderItem.getAmount();
            }
            totalPrice += 10000;
            orderResponse.setOrderItems(orderItemResponses);
            orderResponse.setTotal(totalPrice);
            orderResponse.setOrderStatus(order.getStatus().toString());
            orderResponse.setShippingAddress(order.getShippingAddress().toResponse());
            orderResponse.setPaymentMethod(order.getPaymentMethod().toString());
            return messageBuilder.buildSuccessMessage(orderResponse);
        }
        throw new RuntimeException("Order not found");
    }

    @Transactional
    public RespMessage addOrder(OrderRequest orderRequest){
        if (orderRequest.getOrderItems().isEmpty()) {
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[] {"order_items"}, "OrderItems cannot be empty");
        }
        Optional<ShippingAddress> shippingAddress = shippingAddressRepository.findById(orderRequest.getShippingAddressId());
        if ( shippingAddress.isEmpty() ){
            throw new CoffeeShopException(Constant.FIELD_NOT_NULL, new Object[] {"shipping_address"}, "ShippingAddress cannot be null");
        }
        Status shippingAddressStatus = shippingAddress.get().getStatus();
        if ( shippingAddressStatus.equals(Status.INACTIVE)){
            throw new CoffeeShopException(Constant.NOT_FOUND, new Object[] {"shipping_address"}, "ShippingAddress not found");
        }
        Order order = new Order();
        order.setShippingAddress(shippingAddress.get());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setStatus(OrderStatus.Processing);
        order.setOrderDate(new Date());
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequest orderItemRequest : orderRequest.getOrderItems()) {
            long productItemId = orderItemRequest.getProductItemId();
            Optional<ProductItem> productItemOptional = productItemRepository.findById(productItemId);

            if (productItemOptional.isEmpty()) {
                throw new CoffeeShopException(Constant.NOT_FOUND,  new Object[] {"product_item"}, "ProductItem not found");
            }

            int stock = productItemOptional.get().getStock();
            int orderedAmount = orderItemRequest.getAmount();

            if (orderedAmount > stock) {
                throw new CoffeeShopException(Constant.FIELD_NOT_VALID, new Object[] {"order_amount"}, "Amount Item cannot be greater than stock");
            }
            try {
                ProductItem productItem = productItemOptional.get();
                productItem.setStock(productItem.getStock() - orderedAmount);
                productItemRepository.save(productItem);
            } catch (Exception e) {
                throw new CoffeeShopException(Constant.UNDEFINED, new Object[] {"product_item"}, "Product item cannot be update at stock");
            }
            OrderItem orderItem = new OrderItem();
            orderItem.setProductItem(productItemOptional.get());
            orderItem.setPrice(orderItemRequest.getPrice());
            orderItem.setDiscount(orderItemRequest.getDiscount());
            orderItem.setAmount(orderItemRequest.getAmount());
            orderItems.add(orderItem);
        }
        try {
            Order order1 = orderRepository.save(order);
            for (OrderItem orderItem : orderItems) {
                orderItem.setOrder(order1);
                orderItemRepository.save(orderItem);
            }
            return messageBuilder.buildSuccessMessage(order1.getId());
        } catch (Exception e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{"order"}, "Order can not be added");
        }
    }

    public RespMessage updateOrderStatus(long orderId) {
        Optional<Order> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            if (order.getStatus().equals(OrderStatus.Processing)){
                order.setStatus(OrderStatus.Processed);
            } else if (order.getStatus().equals(OrderStatus.Processed)) {
                order.setStatus(OrderStatus.Shipping);
            } else if (order.getStatus().equals(OrderStatus.Shipping)) {
                order.setStatus(OrderStatus.Completed);
            } else {
                throw new RuntimeException("Order can not be updated");
            }
            try {
                orderRepository.save(order);
                return messageBuilder.buildSuccessMessage(order.getStatus());
            } catch (CoffeeShopException e){
                throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{order}, "Order can not be updated");
            }
        }
        throw new RuntimeException("Order not found");
    }

    @Transactional
    public RespMessage cancelOrder(long orderId) {
        Optional<Order> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            if (order.getStatus().equals(OrderStatus.Processing)) {
                order.setStatus(OrderStatus.Cancelled);

                // ✅ Cộng lại số lượng vào kho
                List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
                for (OrderItem orderItem : orderItems) {
                    ProductItem productItem = orderItem.getProductItem();
                    productItem.setStock(productItem.getStock() + orderItem.getAmount());
                    productItemRepository.save(productItem);
                }

            } else {
                throw new CoffeeShopException(Constant.UNDEFINED, new Object[]{order}, "Order can not be cancelled");
            }

            String paymentMethod = order.getPaymentMethod().toString();
            if (paymentMethod.equals(PaymentMethod.VNPay.toString())) {
                Transaction transaction1 = new Transaction();
                Optional<Transaction> transactionOptional = transactionRepository.findByOrderId(orderId);
                if (transactionOptional.isPresent()) {
                    Transaction transaction = transactionOptional.get();
                    transaction1.setTransactionNo(transaction.getTransactionNo());
                    transaction1.setAmount(transaction.getAmount());
                    transaction1.setOrder(transaction.getOrder());
                    transaction1.setCommand("refund");
                    transaction1.setTxnRef(transaction.getTxnRef());
                    transaction1.setPayDate(new Date());
                } else {
                    throw new CoffeeShopException(Constant.NOT_FOUND, null, "Transaction not found");
                }

                try {
                    orderRepository.save(order);
                    transactionRepository.save(transaction1);
                    return messageBuilder.buildSuccessMessage(order.getStatus());
                } catch (CoffeeShopException e) {
                    throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{order}, "Order can not be cancelled");
                }

            } else {
                try {
                    orderRepository.save(order);
                    return messageBuilder.buildSuccessMessage(order.getStatus());
                } catch (CoffeeShopException e) {
                    throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[]{order}, "Order can not be cancelled");
                }
            }
        }
        throw new RuntimeException("Order not found");
    }

    public RespMessage getOrdersByUser() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        if (userOptional.isEmpty())
            throw new CoffeeShopException(Constant.UNAUTHORIZED, null, "User not found by email: " + userEmail + "get from token!");
        User user = userOptional.get();
        List<Order> orders = orderRepository.findByUserId(user.getId());
        List<OrderResponse> orderResponses = new ArrayList<>();
        for (Order order : orders) {
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
            List<OrderItemResponse> orderItemResponses = orderItems.stream().map(this::toOrderItemResponse).toList();
            OrderResponse orderResponse = new OrderResponse();
            orderResponse.setOrderId(order.getId());
            orderResponse.setOrderDate(order.getOrderDate());
            orderResponse.setOrderItems(orderItemResponses);
            orderResponse.setOrderStatus(order.getStatus().toString());
            orderResponse.setShippingAddress(order.getShippingAddress().toResponse());
            orderResponse.setPaymentMethod(order.getPaymentMethod().toString());
            orderResponses.add(orderResponse);
        }

        return messageBuilder.buildSuccessMessage(orderResponses);
    }

    public RespMessage getOrderByStatus(OrderStatus status) {
        try {
            List<Order> orders = orderRepository.findByStatus(status);
            List<OrderResponse> orderResponses = new ArrayList<>();
            for (Order order : orders) {
                OrderResponse orderResponse = new OrderResponse();
                orderResponse.setOrderId(order.getId());
                orderResponse.setOrderDate(order.getOrderDate());
                orderResponse.setOrderStatus(order.getStatus().toString());
                orderResponse.setPaymentMethod(order.getPaymentMethod().toString());
                orderResponse.setShippingAddress(order.getShippingAddress().toResponse());
                List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
                List<OrderItemResponse> orderItemResponses = orderItems.stream().map(this::toOrderItemResponse).toList();
                double totalPrice = 0;
                for (OrderItem orderItem : orderItems) {
                    totalPrice += (orderItem.getPrice() - orderItem.getDiscount())*orderItem.getAmount();
                }
                totalPrice += 10000;
                orderResponse.setOrderItems(orderItemResponses);
                orderResponse.setTotal(totalPrice);
                orderResponses.add(orderResponse);
            }
            return messageBuilder.buildSuccessMessage(orderResponses);
        } catch (CoffeeShopException e) {
            throw new CoffeeShopException(Constant.UNDEFINED, null, "Order not found");
        }
    }

    public OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        List<Image> productImages = imageRepository.findByProduct(orderItem.getProductItem().getProduct());
        
        String productImageUrl = productImages.isEmpty() ? "" : productImages.get(0).getUrl();
        
        return OrderItemResponse.builder()
                .orderItemId(orderItem.getId())
                .productItemId(orderItem.getProductItem().getId())
                .productId(orderItem.getProductItem().getProduct().getId())
                .productName(orderItem.getProductItem().getProduct().getName())
                .productType(orderItem.getProductItem().getType().getName())
                .amount(orderItem.getAmount())
                .price(orderItem.getPrice())
                .discount(orderItem.getDiscount())
                .isReviewed(orderItem.isReviewed())
                .productImage(productImageUrl)
                .build();
    }
    
    public void exportOrdersToExcel(HttpServletResponse response, Date startDate, Date endDate) throws IOException {
        List<Order> orders = orderRepository.findAllFilterOrderDate(startDate,endDate);
        List<OrderResponse> orderResponses = new ArrayList<>();
        for (Order order : orders) {
            OrderResponse orderResponse = new OrderResponse();
            orderResponse.setOrderId(order.getId());
            orderResponse.setOrderDate(order.getOrderDate());
            orderResponse.setOrderStatus(order.getStatus().toString());
            orderResponse.setPaymentMethod(order.getPaymentMethod().toString());
            orderResponse.setShippingAddress(order.getShippingAddress().toResponse());
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
            List<OrderItemResponse> orderItemResponses = orderItems.stream().map(this::toOrderItemResponse).toList();
            double totalPrice = 0;
            for (OrderItem orderItem : orderItems) {
                totalPrice += (orderItem.getPrice() - orderItem.getDiscount())*orderItem.getAmount();
            }
            totalPrice += 10000;
            orderResponse.setOrderItems(orderItemResponses);
            orderResponse.setTotal(totalPrice);
            orderResponses.add(orderResponse);
        };
        
        // Tên file theo ngày hiện tại
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String fileName = "danh_sach_don_hang.xlsx";

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(fileName);

        // Style căn giữa dọc và ngang
        CellStyle centerStyle = workbook.createCellStyle();
        centerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        centerStyle.setAlignment(HorizontalAlignment.CENTER);

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "STT", "ID Đơn hàng", "Trạng thái đơn hàng", "Phương thức thanh toán", "Ngày đặt", "Tổng giá trị",
            "Địa chỉ", "Người nhận", "Số điện thoại", "Tên từng sản phẩm trong đơn", "Số lượng","Loại","Giá","Giảm giá"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(centerStyle);
        }

        int rowIdx = 1;
        int stt = 1;

        for (OrderResponse order : orderResponses) {

        	int itemCount = order.getOrderItems().size();
            int startRow = rowIdx;
            int endRow = rowIdx + itemCount - 1;

            // Tạo dòng cho từng OrderItem
            for (OrderItemResponse item : order.getOrderItems()) {
                Row row = sheet.createRow(rowIdx++);
                int col = 9; // cột bắt đầu OrderItem info

                row.createCell(col++).setCellValue(item.getProductName());
                row.createCell(col++).setCellValue(item.getAmount());
                row.createCell(col++).setCellValue(item.getProductType());
                row.createCell(col++).setCellValue(item.getPrice());
                row.createCell(col++).setCellValue(item.getDiscount());

            }

            // Thêm thông tin Order vào ô merged
            for (int i = 0; i < 9; i++) {
                Row row = sheet.getRow(startRow);
                Cell cell = row.createCell(i);
                cell.setCellStyle(centerStyle);

                switch (i) {
                    case 0 -> cell.setCellValue(stt++);
                    case 1 -> cell.setCellValue(order.getOrderId());
                    case 2 -> cell.setCellValue(order.getOrderStatus());
                    case 3 -> cell.setCellValue(order.getPaymentMethod());
                    case 4 -> cell.setCellValue(order.getOrderDate());
                    case 5 -> cell.setCellValue(order.getTotal());
                    case 6 -> cell.setCellValue(order.getShippingAddress().getLocation());
                    case 7 -> cell.setCellValue(order.getShippingAddress().getReceiverName());
                    case 8 -> cell.setCellValue(order.getShippingAddress().getReceiverPhone());
                }

                if (itemCount > 1) {
                    sheet.addMergedRegion(new CellRangeAddress(startRow, endRow, i, i));
                }
            }
        }

        // Tự động chỉnh kích thước cột
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Thiết lập header HTTP để tải file về
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"; filename*=UTF-8''" + encodedFileName);

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    public void printInvoiceAndSendEmail(Long orderId, HttpServletResponse response) throws Exception {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        double totalPrice = 0;

        for (OrderItem item : orderItems) {
            OrderItemResponse itemResponse = new OrderItemResponse();
            itemResponse.setProductName(item.getProductItem().getProduct().getName());
            itemResponse.setAmount(item.getAmount());  
            itemResponse.setProductType(item.getProductItem().getType().getName());
            itemResponse.setPrice(item.getPrice());
            itemResponse.setDiscount(item.getDiscount());
            itemResponses.add(itemResponse);

            totalPrice += (item.getPrice() - item.getDiscount()) * item.getAmount();
        }

        // Phí vận chuyển
        double shippingFee = 10000;
        totalPrice += shippingFee;

        // Tạo PDF
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        String fileName = "hoa_don_" + orderId + ".pdf";
        File tempFile = File.createTempFile("invoice_" + orderId + "_", ".pdf");
        
        PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(tempFile));
        document.open();

        // Định dạng font và màu sắc
        BaseFont baseFont = BaseFont.createFont("fonts/Arial-Unicode-MS.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        Font titleFont = new Font(baseFont, 20, Font.BOLD, BaseColor.BLUE);
        Font headerFont = new Font(baseFont, 14, Font.BOLD, BaseColor.BLACK);
        Font normalFont = new Font(baseFont, 11, Font.NORMAL, BaseColor.BLACK);
        Font boldFont = new Font(baseFont, 11, Font.BOLD, BaseColor.BLACK);
        Font totalFont = new Font(baseFont, 12, Font.BOLD, BaseColor.RED);

        DecimalFormat currencyFormat = new DecimalFormat("#,###");
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");

        // === HEADER ===
        // Logo và thông tin công ty (nếu có)
        Paragraph companyInfo = new Paragraph();
        companyInfo.add(new Chunk("CỬA HÀNG HACAFE\n", headerFont));
        companyInfo.add(new Chunk("Địa chỉ: Số 11, đường Hồ Tùng mậu, Cầu Giấy, Hà Nội\n", normalFont));
        companyInfo.add(new Chunk("Điện thoại: 0386331126 | Email: hohaiha0210@gmail.com\n", normalFont));
        companyInfo.setAlignment(Element.ALIGN_LEFT);
        document.add(companyInfo);

        // Đường kẻ phân cách
        
        document.add(Chunk.NEWLINE);

        // Tiêu đề hóa đơn
        Paragraph title = new Paragraph("HÓA ĐƠN MUA HÀNG", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        // === THÔNG TIN ĐƠN HÀNG ===
        PdfPTable infoTable = new PdfPTable(4);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingBefore(10);
        infoTable.setSpacingAfter(15);
        infoTable.setWidths(new float[]{1.5f, 2f, 1.5f, 2f});

        // Thêm thông tin đơn hàng vào bảng 2 cột
        addInfoCell(infoTable, "Mã đơn hàng:", String.valueOf(order.getId()), boldFont, normalFont);
        addInfoCell(infoTable, "Ngày đặt:", dateFormat.format(order.getOrderDate()), boldFont, normalFont);
        
        addInfoCell(infoTable, "Trạng thái:", order.getStatus().toString(), boldFont, normalFont);
        addInfoCell(infoTable, "Thanh toán:", order.getPaymentMethod().toString(), boldFont, normalFont);

        document.add(infoTable);

        // === THÔNG TIN NGƯỜI NHẬN ===
        Paragraph customerTitle = new Paragraph("THÔNG TIN NGƯỜI NHẬN", headerFont);
        customerTitle.setSpacingBefore(10);
        customerTitle.setSpacingAfter(5);
        document.add(customerTitle);

        PdfPTable customerTable = new PdfPTable(2);
        customerTable.setWidthPercentage(100);
        customerTable.setSpacingAfter(15);
        customerTable.setWidths(new float[]{1f, 3f});

        addCustomerInfo(customerTable, "Họ tên:", order.getShippingAddress().getReceiverName(), boldFont, normalFont);
        addCustomerInfo(customerTable, "Số điện thoại:", order.getShippingAddress().getReceiverPhone(), boldFont, normalFont);
        addCustomerInfo(customerTable, "Địa chỉ:", order.getShippingAddress().getLocation(), boldFont, normalFont);

        document.add(customerTable);

        // === CHI TIẾT SẢN PHẨM ===
        Paragraph productTitle = new Paragraph("CHI TIẾT ĐƠN HÀNG", headerFont);
        productTitle.setSpacingBefore(10);
        productTitle.setSpacingAfter(10);
        document.add(productTitle);

        // Bảng sản phẩm
        PdfPTable productTable = new PdfPTable(7);
        productTable.setWidthPercentage(100);
        productTable.setWidths(new float[]{1f, 2.2f, 0.8f, 1.2f, 1.2f, 1f, 1.3f});

        // Header bảng
        String[] headers = {"STT", "Tên sản phẩm", "SL", "Loại", "Đơn giá", "Giảm giá", "Thành tiền"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, boldFont));
            cell.setBackgroundColor(new BaseColor(230, 230, 230));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
            productTable.addCell(cell);
        }

        // Dữ liệu sản phẩm
        int stt = 1;
        for (OrderItemResponse item : itemResponses) {
            double itemTotal = (item.getPrice() - item.getDiscount()) * item.getAmount();
            
            productTable.addCell(createProductCell(String.valueOf(stt++), normalFont, Element.ALIGN_CENTER));
            productTable.addCell(createProductCell(item.getProductName(), normalFont, Element.ALIGN_LEFT));
            productTable.addCell(createProductCell(String.valueOf(item.getAmount()), normalFont, Element.ALIGN_CENTER));
            productTable.addCell(createProductCell(item.getProductType(), normalFont, Element.ALIGN_CENTER));
            productTable.addCell(createProductCell(currencyFormat.format(item.getPrice()) + "₫", normalFont, Element.ALIGN_RIGHT));
            productTable.addCell(createProductCell(currencyFormat.format(item.getDiscount()) + "₫", normalFont, Element.ALIGN_RIGHT));
            productTable.addCell(createProductCell(currencyFormat.format(itemTotal) + "₫", boldFont, Element.ALIGN_RIGHT));
        }

        document.add(productTable);

        // === TỔNG TIỀN ===
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(50);
        summaryTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.setSpacingBefore(15);
        summaryTable.setWidths(new float[]{2f, 1.5f});

        double subtotal = totalPrice - shippingFee;
        
        addSummaryRow(summaryTable, "Tạm tính:", currencyFormat.format(subtotal) + "₫", normalFont, normalFont);
        addSummaryRow(summaryTable, "Thuế VAT:", 0 + "₫", normalFont, normalFont);
        addSummaryRow(summaryTable, "Phí vận chuyển:", currencyFormat.format(shippingFee) + "₫", normalFont, normalFont);
        addSummaryRow(summaryTable, "Ghi chú:","", normalFont, normalFont);
        // Đường kẻ tổng
        PdfPCell totalLine1 = new PdfPCell();
        totalLine1.setBorder(Rectangle.BOTTOM);
        totalLine1.setBorderWidth(1);
        summaryTable.addCell(totalLine1);
        
        PdfPCell totalLine2 = new PdfPCell();
        totalLine2.setBorder(Rectangle.BOTTOM);
        totalLine2.setBorderWidth(1);
        summaryTable.addCell(totalLine2);
        
        addSummaryRow(summaryTable, "TỔNG CỘNG:", currencyFormat.format(totalPrice) + "₫", totalFont, totalFont);

        document.add(summaryTable);

        // === FOOTER ===
        Paragraph footer = new Paragraph();
        footer.setSpacingBefore(30);
        footer.add(new Chunk("Cảm ơn quý khách đã mua hàng!\n", boldFont));
        footer.add(new Chunk("Mọi thắc mắc xin liên hệ: 0386331126\n", normalFont));
        footer.add(new Chunk("Ngày in: " + dateFormat.format(new java.util.Date()), normalFont));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();

        // Gửi file PDF về client
        sendPdfResponse(response, tempFile, fileName);
        
        // Gửi email với file đính kèm
        String userEmail = order.getShippingAddress().getUser().getEmail();
        sendInvoiceEmail(userEmail, order.getId(), tempFile, fileName);

        // Xóa file tạm
        tempFile.delete();
    }

    // Helper methods
    private void addInfoCell(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        table.addCell(createInfoCell(label, labelFont));
        table.addCell(createInfoCell(value, valueFont));
    }

    private PdfPCell createInfoCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        return cell;
    }

    private void addCustomerInfo(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }

    private PdfPCell createProductCell(String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(6);
        return cell;
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPadding(5);
        table.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }

    @Async
    private void sendInvoiceEmail(String userEmail, Long orderId, File pdfFile, String fileName) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(userEmail);
        helper.setSubject("Hóa đơn mua hàng #" + orderId);
        
        String emailContent = String.format(
            "<html><body>" +
            "<h3>Xin chào!</h3>" +
            "<p>Cảm ơn bạn đã mua hàng tại Hacafe.</p>" +
            "<p>Hóa đơn chi tiết đính kèm trong email này.</p>" +
            "<p>Mọi thắc mắc xin liên hệ: <strong>0386331126</strong></p>" +
            "<br><p>Trân trọng,<br>Đội ngũ hỗ trợ khách hàng</p>" +
            "</body></html>"
        );
        
        helper.setText(emailContent, true);
        helper.setFrom("hohaiha0210@gmail.com");

        FileSystemResource fileAttachment = new FileSystemResource(pdfFile);
        helper.addAttachment(fileName, fileAttachment);

        mailSender.send(message);
    }

    private void sendPdfResponse(HttpServletResponse response, File pdfFile, String fileName) throws IOException {
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"; filename*=UTF-8''" + encodedFileName);
        response.setContentLength((int) pdfFile.length());

        try (FileInputStream fis = new FileInputStream(pdfFile);
             ServletOutputStream os = response.getOutputStream()) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
            os.flush();
        }
    }

}
