    package com.bankease.dto;

    import jakarta.validation.constraints.DecimalMin;
    import jakarta.validation.constraints.Digits;
    import jakarta.validation.constraints.NotNull;
    import java.math.BigDecimal;

    public class DepositRequest {

        @NotNull(message = "Deposit amount is required")
        @DecimalMin( value = "0.01",
                message = "Deposit amount must be greater than zero"
        )
        @Digits(
                integer = 17,
                fraction = 2,
                message = "Deposit amount must have at most two decimal places"
        )
        private BigDecimal amount;

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
    }