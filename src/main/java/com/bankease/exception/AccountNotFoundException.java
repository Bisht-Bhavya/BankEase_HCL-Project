package com.bankease.exception;

public class AccountNotFoundException extends RuntimeException{
    public AccountNotFoundException(Long id){
        super("Account Not Found With Id: "+ id);
    }
}
