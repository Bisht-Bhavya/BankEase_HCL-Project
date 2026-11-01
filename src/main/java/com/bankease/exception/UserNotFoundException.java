package com.bankease.exception;

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException(Long id){
        super("User Not Found With Id "+ id);
    }
}
