package com.bankease.exception;

public class AccountClosedException extends RuntimeException {
    public AccountClosedException(Long id){
        super("Cannot perform transaction on closed account with ID "+id);
    }
}
