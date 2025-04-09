package com.haui.coffee_shop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.enums.Status;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.model.OrderItem;
import com.haui.coffee_shop.model.Review;
import com.haui.coffee_shop.payload.request.ReviewRequet;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.payload.response.ReviewResponse;
import com.haui.coffee_shop.repository.OrderItemRepository;
import com.haui.coffee_shop.repository.ProductItemRepository;
import com.haui.coffee_shop.repository.ProductRepository;
import com.haui.coffee_shop.repository.ReviewRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final MessageBuilder messageBuilder;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductItemRepository productItemRepository;

    public RespMessage addReview(ReviewRequet reviewRequet) {
        Optional<OrderItem> orderItemOptional = orderItemRepository.findById(reviewRequet.getOrderItemId());
        if (orderItemOptional.isPresent()) {
            OrderItem orderItem = orderItemOptional.get();
            Review review = new Review();
            review.setRating(reviewRequet.getRating());
            review.setComment(reviewRequet.getComment());
            review.setOrderItem(orderItem);
            orderItem.setReviewed(true);
            try {
                orderItemRepository.save(orderItem);
                reviewRepository.save(review);
                return messageBuilder.buildSuccessMessage(review.toResponse());
            } catch (CoffeeShopException e) {
                throw new CoffeeShopException(Constant.UNDEFINED, null, "Review could not be saved");
            }
        } else {
            throw new CoffeeShopException(Constant.NOT_FOUND, null, "OrderItem could not be found");
        }
    }

    public RespMessage getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        List<ReviewResponse> reviewResponses = reviews.stream().map(Review::toResponse).toList();
        return messageBuilder.buildSuccessMessage(reviewResponses);
    }

    public RespMessage deleteReview(long reviewId) {
        Optional<Review> reviewOptional = reviewRepository.findById(reviewId);
        if (reviewOptional.isPresent()) {
            Review review = reviewOptional.get();
            review.setStatus(Status.INACTIVE);
            try {
                reviewRepository.save(review);
                return messageBuilder.buildSuccessMessage(review.toResponse());
            } catch (CoffeeShopException e) {
                throw new CoffeeShopException(Constant.UNDEFINED, null, "Review could not be saved");
            }
        } else {
            throw new CoffeeShopException(Constant.NOT_FOUND, null, "Review could not be found");
        }
    }

    public RespMessage getReviewByProductId(long productId) {
        try {
            List<Review> reviews = reviewRepository.findByProductId(productId)
                    .stream().filter(review -> review.getStatus().equals(Status.ACTIVE)).toList();
            List<ReviewResponse> reviewResponses = reviews.stream().map(Review::toResponse).toList();
            return messageBuilder.buildSuccessMessage(reviewResponses);
        } catch (CoffeeShopException e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, null, "Review not found");
        }
    }
}
