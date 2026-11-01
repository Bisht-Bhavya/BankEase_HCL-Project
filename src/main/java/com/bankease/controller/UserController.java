package com.bankease.controller;

import com.bankease.dto.UpdateUserRequest;
import java.util.List;

import com.bankease.dto.UserResponse;
import com.bankease.entity.User;
import com.bankease.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService=userService;
    }

    @PostMapping
    public UserResponse createuser(@Valid @RequestBody User user){
        User savedUser = userService.createUser(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getDateOfBirth()  );
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getDateOfBirth()
        );
    }

    @GetMapping
    public List<UserResponse> getAllUser() {
        return userService.getAllUsers()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getDateOfBirth()
                ))
                .toList();
    }

    @PatchMapping("/{id}")
    public User updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request){
    return userService.updateUser(id,request);
    }

    @DeleteMapping("{id}")
    public void deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
    }



}
