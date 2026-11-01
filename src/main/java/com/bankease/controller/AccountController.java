
package com.bankease.controller;

import com.bankease.dto.*;
import com.bankease.entity.User;
import com.bankease.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @PostMapping
    public AccountResponse createAccount(
            Authentication authentication,
            @Valid @RequestBody CreateAccountRequest request) {

        Long userid = getAuthenticatedUserId(authentication);
        return accountService.createAccount(userid, request);
    }

    @GetMapping
    public List<AccountResponse> getAccounts(Authentication authentication){
        Long userid = getAuthenticatedUserId(authentication);
        return accountService.getAccountsByUserId(userid);
    }

    @GetMapping("/{id}")
    public AccountResponse getAccountById(
            @PathVariable Long id,
            Authentication authentication) {

        Long userid = getAuthenticatedUserId(authentication);
        return accountService.getAccountById(id, userid);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> closeAccount(
            @PathVariable Long id,
            Authentication authentication) {

        Long userid = getAuthenticatedUserId(authentication);
        accountService.closeAccount(id, userid);
        return ResponseEntity.ok("Account Closed Successfully");
    }

    @PostMapping("/{id}/deposit")
    public AccountResponse deposit(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody DepositRequest request) {

        Long userid = getAuthenticatedUserId(authentication);
        return accountService.deposit(id, userid, request);
    }

    @PostMapping("/{id}/withdraw")
    public AccountResponse withdraw(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody WithdrawRequest request) {

        Long userid = getAuthenticatedUserId(authentication);
        return accountService.withdrawal(id, userid, request);
    }

    @GetMapping("/{id}/transactions")
    public List<TransactionResponse> getTransactionHistory(
            @PathVariable Long id,
            Authentication authentication) {

        Long userid = getAuthenticatedUserId(authentication);
        return accountService.getTransactionHistory(id, userid);
    }

    @PostMapping("/transfer")
    public TransferResponse transfer(
            Authentication authentication,
            @Valid @RequestBody TransferRequest request) {

        Long userid = getAuthenticatedUserId(authentication);
        return accountService.transfer(userid, request);
    }
}
