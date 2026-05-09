package com.payment.service;

import com.payment.dto.OrderRequest;
import com.payment.dto.OrderResponse;
import com.payment.dto.PaymentVerificationRequest;
import com.payment.entity.OrderEntity;
import com.payment.entity.PaymentEntity;
import com.payment.exception.PaymentException;
import com.payment.repository.OrderRepository;
import com.payment.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Formatter;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    private static final String HMAC_SHA256 = "HmacSHA256";

    private final RazorpayClient razorpayClient;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final String razorpayKeyId;
    private final String razorpayKeySecret;

    public PaymentService(
            RazorpayClient razorpayClient,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            @Qualifier("razorpayKeyId") String razorpayKeyId,
            @Qualifier("razorpayKeySecret") String razorpayKeySecret) {
        this.razorpayClient = razorpayClient;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
    }

    /**
     * Creates a Razorpay order and persists it in the database.
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        try {
            // Convert rupees to paise
            long amountInPaise = Math.round(request.getAmount() * 100);

            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());
            orderRequest.put("payment_capture", 1); // Auto-capture

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            logger.info("Razorpay order created: {}", razorpayOrderId);

            // Save to database
            OrderEntity orderEntity = OrderEntity.builder()
                    .orderId(razorpayOrderId)
                    .customerName(request.getCustomerName())
                    .amount(amountInPaise)
                    .currency("INR")
                    .status(OrderEntity.OrderStatus.CREATED)
                    .build();

            orderRepository.save(orderEntity);
            logger.info("Order saved to database: {}", orderEntity.getId());

            // Build response
            return OrderResponse.builder()
                    .orderId(razorpayOrderId)
                    .amount(amountInPaise)
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .customerName(request.getCustomerName())
                    .status("CREATED")
                    .build();

        } catch (RazorpayException e) {
            logger.error("Failed to create Razorpay order: {}", e.getMessage(), e);
            throw new PaymentException("Failed to create payment order: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies the Razorpay payment signature using HMAC SHA256
     * and updates the order/payment records.
     */
    @Transactional
    public OrderResponse verifyPayment(PaymentVerificationRequest request) {
        // Step 1: Verify signature using HMAC SHA256
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        String generatedSignature = calculateHmacSha256(payload, razorpayKeySecret);

        boolean isValid = generatedSignature.equals(request.getRazorpaySignature());

        // Step 2: Find the order
        OrderEntity order = orderRepository.findByOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new PaymentException(
                        "Order not found: " + request.getRazorpayOrderId()));

        if (isValid) {
            // Payment verified successfully
            logger.info("Payment signature verified for order: {}", request.getRazorpayOrderId());

            order.setStatus(OrderEntity.OrderStatus.PAID);
            orderRepository.save(order);

            // Save payment record
            PaymentEntity payment = PaymentEntity.builder()
                    .paymentId(request.getRazorpayPaymentId())
                    .razorpayOrderId(request.getRazorpayOrderId())
                    .razorpaySignature(request.getRazorpaySignature())
                    .amount(order.getAmount())
                    .status(PaymentEntity.PaymentStatus.SUCCESS)
                    .build();

            paymentRepository.save(payment);
            logger.info("Payment saved: {}", payment.getPaymentId());

            return OrderResponse.builder()
                    .orderId(order.getOrderId())
                    .amount(order.getAmount())
                    .currency(order.getCurrency())
                    .customerName(order.getCustomerName())
                    .status("PAID")
                    .build();
        } else {
            // Signature verification failed
            logger.warn("Payment signature verification FAILED for order: {}",
                    request.getRazorpayOrderId());

            order.setStatus(OrderEntity.OrderStatus.FAILED);
            orderRepository.save(order);

            // Save failed payment record
            PaymentEntity payment = PaymentEntity.builder()
                    .paymentId(request.getRazorpayPaymentId())
                    .razorpayOrderId(request.getRazorpayOrderId())
                    .razorpaySignature(request.getRazorpaySignature())
                    .amount(order.getAmount())
                    .status(PaymentEntity.PaymentStatus.FAILED)
                    .build();

            paymentRepository.save(payment);

            throw new PaymentException("Payment verification failed. Invalid signature.");
        }
    }

    /**
     * Fetches the payment status for a given order ID.
     */
    public OrderResponse getPaymentStatus(String orderId) {
        OrderEntity order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentException("Order not found: " + orderId));

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .customerName(order.getCustomerName())
                .status(order.getStatus().name())
                .build();
    }

    /**
     * Calculates HMAC SHA256 hash to verify Razorpay payment signature.
     */
    private String calculateHmacSha256(String data, String secret) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(), HMAC_SHA256);
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes());

            // Convert to hex string
            Formatter formatter = new Formatter();
            for (byte b : hash) {
                formatter.format("%02x", b);
            }
            String result = formatter.toString();
            formatter.close();
            return result;
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Error calculating HMAC SHA256: {}", e.getMessage(), e);
            throw new PaymentException("Signature verification error", e);
        }
    }
}
