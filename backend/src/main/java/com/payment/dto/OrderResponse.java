package com.payment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private String orderId;
    private Long amount;
    private String currency;
    private String razorpayKeyId;
    private String customerName;
    private String status;
}
