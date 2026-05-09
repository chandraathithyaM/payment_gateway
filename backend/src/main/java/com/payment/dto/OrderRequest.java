package com.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least ₹1")
    private Double amount; // Amount in rupees (will be converted to paise in service)
}
