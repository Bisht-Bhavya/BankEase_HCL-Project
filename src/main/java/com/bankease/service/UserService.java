package com.bankease.service;

import com.bankease.dto.LoginRequest;
import com.bankease.entity.User;
import com.bankease.exception.UserHasAccountsException;
import com.bankease.exception.UserNotFoundException;
import com.bankease.repository.AccountRepository;
import com.bankease.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import com.bankease.dto.UpdateUserRequest;

@Service
public class UserService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, AccountRepository accountRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user){
        if(userRepository.existsByEmail(user.getEmail())){
            throw new IllegalArgumentException("Email is already Registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    return userRepository.save(user);
    }

    public User getUserById(Long id){
        return userRepository.findById(id).orElseThrow((()-> new UserNotFoundException(id)));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(Long id, UpdateUserRequest request) {

        User existingUser = getUserById(id);

        if (existingUser == null) {
            return null;
        }

        if (request.getName() != null) {
            existingUser.setName(request.getName());
        }

        if (request.getPhone() != null) {
            existingUser.setPhone(request.getPhone());
        }

        if (request.getDateOfBirth() != null) {
            existingUser.setDateOfBirth(request.getDateOfBirth());
        }

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        User existingUser = getUserById(id);
        if(accountRepository.existsByUserId(id)){
            throw new UserHasAccountsException(id);
        }
        userRepository.delete(existingUser);
    }

    public User Login(LoginRequest request){
        User user =  userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new IllegalArgumentException("Invalid Email or Password"));
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new IllegalArgumentException("Invalid Email or Password");
        }
        return user;
    }
}
