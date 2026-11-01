package com.bankease.dto;

import com.bankease.entity.Transfer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransferResponse {

    private Long id;
    private Long senderAccountId;
    private Long receiverAccountId;
    private BigDecimal amount;
    private LocalDateTime createdAt;

    public TransferResponse(Transfer transfer) {
        this.id = transfer.getId();
        this.senderAccountId = transfer.getSenderAccount().getId();
        this.receiverAccountId = transfer.getReceiverAccount().getId();
        this.amount = transfer.getAmount();
        this.createdAt = transfer.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getSenderAccountId() {
        return senderAccountId;
    }

    public Long getReceiverAccountId() {
        return receiverAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}