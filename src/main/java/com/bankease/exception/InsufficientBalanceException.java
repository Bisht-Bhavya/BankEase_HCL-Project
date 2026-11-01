package com.bankease.exception;

import java.math.BigDecimal;

public class InsufficientBalanceException extends RuntimeException{
    public InsufficientBalanceException(BigDecimal balance,BigDecimal amount){
        super("Insufficient Balance.\n"+"Available Balance: " + balance +
                ", Requested Withdrawal: " + amount);
    }
}
