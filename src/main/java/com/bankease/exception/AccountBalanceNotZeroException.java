package com.bankease.exception;

import java.math.BigDecimal;

public class AccountBalanceNotZeroException extends RuntimeException{
    public AccountBalanceNotZeroException(BigDecimal balance){
    super("Account Cannot Be Closed. Current Balance is "+balance);
    }
}
