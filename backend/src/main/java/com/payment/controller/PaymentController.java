package com.payment.controller;

import com.payment.dto.ApiResponse;
import com.payment.dto.OrderRequest;
import com.payment.dto.OrderResponse;
import com.payment.dto.PaymentVerificationRequest;
import com.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * POST /api/payment/create-order
     * Creates a new Razorpay order.
     */
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request) {
        logger.info("Creating order for customer: {}, amount: ₹{}",
                request.getCustomerName(), request.getAmount());

        OrderResponse response = paymentService.createOrder(request);

        return ResponseEntity.ok(
                ApiResponse.success("Order created successfully", response));
    }

    /**
     * POST /api/payment/verify
     * Verifies Razorpay payment signature and updates order status.
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<OrderResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {
        logger.info("Verifying payment for order: {}", request.getRazorpayOrderId());

        OrderResponse response = paymentService.verifyPayment(request);

        return ResponseEntity.ok(
                ApiResponse.success("Payment verified successfully", response));
    }

    /**
     * GET /api/payment/status/{orderId}
     * Fetches the payment status for a given Razorpay order ID.
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getPaymentStatus(
            @PathVariable String orderId) {
        logger.info("Fetching payment status for order: {}", orderId);

        OrderResponse response = paymentService.getPaymentStatus(orderId);

        return ResponseEntity.ok(
                ApiResponse.success("Payment status fetched", response));
    }
}
