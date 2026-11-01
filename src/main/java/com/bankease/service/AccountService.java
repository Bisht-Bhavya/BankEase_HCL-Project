package com.bankease.service;

import com.bankease.dto.*;
import com.bankease.entity.*;
import com.bankease.exception.AccountBalanceNotZeroException;
import com.bankease.exception.AccountClosedException;
import com.bankease.exception.AccountNotFoundException;
import com.bankease.exception.InsufficientBalanceException;
import com.bankease.repository.AccountRepository;
import com.bankease.repository.TransactionRepository;
import com.bankease.repository.TransferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final UserService userService;

    private final AccountRepository accountRepository;

    private final TransactionRepository transactionRepository;

    private final TransferRepository transferRepository;

    public AccountService(UserService userService, AccountRepository accountRepository, TransactionRepository transactionRepository, TransferRepository transferRepository) {
        this.userService = userService;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.transferRepository = transferRepository;
    }

    private String generateAccountNumber() {
        Random random = new Random();

        String accountNumber;

        do {
            accountNumber = String.valueOf(
                    1000000000L + random.nextLong(9000000000L)
            );
        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }

    public AccountResponse createAccount(Long userid, CreateAccountRequest request) {
        User user = userService.getUserById(userid);

        Account account = new Account();

        account.setUser(user);
        account.setStatus(AccountStatus.ACTIVE);
        account.setAccountNumber(generateAccountNumber());
        account.setAccountType(request.getAccountType());
        account.setBalance(BigDecimal.ZERO);
        account.setCreatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);

        return new AccountResponse(account);
    }

    public AccountResponse getAccountById(Long id, Long userid) {

        User user = userService.getUserById(userid);

        Account account = accountRepository
                .findByIdAndUserId(id, userid)
                .orElseThrow(() -> new AccountNotFoundException(id));

        return new AccountResponse(account);
    }

    public List<AccountResponse> getAccountsByUserId(Long userid) {
        User user = userService.getUserById(userid);
        return user.getAccounts()
                .stream()
                .map(AccountResponse::new)
                .toList();
    }

    public void closeAccount(Long id, Long userid)  {
        Account account = accountRepository
                .findByIdAndUserId(id, userid)
                .orElseThrow(() -> new AccountNotFoundException(id));

        if(account.getBalance().compareTo(BigDecimal.ZERO) > 0){
            throw new AccountBalanceNotZeroException(account.getBalance());
        }
        account.setStatus(AccountStatus.CLOSED);
        accountRepository.save(account);
    }

    @Transactional
    public AccountResponse deposit(Long id,Long userid,DepositRequest request) {
        //To be removed during authentication
        userService.getUserById(userid);

        Account account = accountRepository
                .findByIdAndUserId(id, userid)
                .orElseThrow(() -> new AccountNotFoundException(id));

        //Checking for Exception
        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new AccountClosedException(id);
        }

        BigDecimal newBalance = account.getBalance()
                .add(request.getAmount());

        account.setBalance(newBalance);

        Account savedAccount = accountRepository.save(account);

        //Transaction Business Logic i.e adding transaction in the DB
        Transaction transaction = new Transaction();
        transaction.setAccount(savedAccount);
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setAmount(request.getAmount());
        transaction.setBalanceAfter(savedAccount.getBalance());
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);

        return new AccountResponse(savedAccount);
    }

    @Transactional
    public AccountResponse withdrawal(Long id, Long userid,WithdrawRequest request  ){
        //Temporary until authentication
        userService.getUserById(userid);

        Account account = accountRepository
                .findByIdAndUserId(id,userid)
                .orElseThrow(() -> new AccountNotFoundException(id));

        if(account.getStatus() == AccountStatus.CLOSED){
            throw new AccountClosedException(id);
        }

        BigDecimal amount = request.getAmount();
        BigDecimal currentBalance = account.getBalance();

        if (currentBalance.compareTo(amount) < 0){
            throw new InsufficientBalanceException(
                    currentBalance,
                    amount
            );
        }

        BigDecimal newBalance = currentBalance.subtract(amount);

        account.setBalance(newBalance);

        Account savedAccount = accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setAccount(savedAccount);
        transaction.setType(TransactionType.WITHDRAWAL);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(savedAccount.getBalance());
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);

        return new AccountResponse(savedAccount);
    }

    public List<TransactionResponse> getTransactionHistory(Long id, Long userid){

        userService.getUserById(userid);

        //Verify that the account belongs to the user
        accountRepository.findByIdAndUserId(id,userid)
                .orElseThrow(()-> new AccountNotFoundException(id));

        List<Transaction> transactions = transactionRepository
                .findByAccountIdOrderByCreatedAtDesc(id);

        return transactions.stream()
                .map(TransactionResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransferResponse transfer(Long userid, TransferRequest request) {

        // To be removed during authentication
        userService.getUserById(userid);

        Long senderId = request.getSenderAccountId();
        Long receiverId = request.getReceiverAccountId();
        BigDecimal amount = request.getAmount();

        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException(
                    "Sender and receiver accounts must be different");
        }

        // Lock accounts in ascending ID order to reduce deadlock risk.
        Long firstId = Math.min(senderId, receiverId);
        Long secondId = Math.max(senderId, receiverId);

        Account firstAccount = accountRepository
                .findByIdForUpdate(firstId)
                .orElseThrow(() -> new AccountNotFoundException(firstId));

        Account secondAccount = accountRepository
                .findByIdForUpdate(secondId)
                .orElseThrow(() -> new AccountNotFoundException(secondId));

        Account sender = senderId.equals(firstId)
                ? firstAccount : secondAccount;

        Account receiver = receiverId.equals(firstId)
                ? firstAccount : secondAccount;

        // Verify sender ownership.
        if (!sender.getUser().getId().equals(userid)) {
            throw new AccountNotFoundException(senderId);
        }

        if (sender.getStatus() == AccountStatus.CLOSED) {
            throw new AccountClosedException(senderId);
        }

        if (receiver.getStatus() == AccountStatus.CLOSED) {
            throw new AccountClosedException(receiverId);
        }

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(sender.getBalance(), amount);
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        Transfer transfer = new Transfer();
        transfer.setSenderAccount(sender);
        transfer.setReceiverAccount(receiver);
        transfer.setAmount(amount);
        transfer.setCreatedAt(LocalDateTime.now());

        Transfer savedTransfer = transferRepository.save(transfer);

        Transaction outgoing = new Transaction();
        outgoing.setAccount(sender);
        outgoing.setType(TransactionType.TRANSFER_OUT);
        outgoing.setAmount(amount);
        outgoing.setBalanceAfter(sender.getBalance());
        outgoing.setTransfer(savedTransfer);
        outgoing.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(outgoing);

        Transaction incoming = new Transaction();
        incoming.setAccount(receiver);
        incoming.setType(TransactionType.TRANSFER_IN);
        incoming.setAmount(amount);
        incoming.setBalanceAfter(receiver.getBalance());
        incoming.setTransfer(savedTransfer);
        incoming.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(incoming);

        return new TransferResponse(savedTransfer);
    }

}