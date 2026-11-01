package com.bankease.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class WithdrawRequest {

    @NotNull(message = "Withdrawal Amount is  Required")
    @DecimalMin(
            value = "0.01",
            message = "Withdrawal amount must be greater than zero"
    )
    @Digits(
            integer = 17,
            fraction = 2,
            message = "Withdrawal amount must have at most two decimal places"
    )
    private BigDecimal amount;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
