package com.bankease.exception;

public class UserHasAccountsException extends RuntimeException{
    public UserHasAccountsException(Long id){
        super("User with id "+id+" cannot be deleted because they have accounts");
    }
}
