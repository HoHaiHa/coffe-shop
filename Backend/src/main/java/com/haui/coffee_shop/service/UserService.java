package com.haui.coffee_shop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.haui.coffee_shop.common.Constant;
import com.haui.coffee_shop.common.enums.RoleEnum;
import com.haui.coffee_shop.common.enums.Status;
import com.haui.coffee_shop.config.MessageBuilder;
import com.haui.coffee_shop.exception.CoffeeShopException;
import com.haui.coffee_shop.model.Role;
import com.haui.coffee_shop.model.User;
import com.haui.coffee_shop.payload.request.UserRequest;
import com.haui.coffee_shop.payload.response.RespMessage;
import com.haui.coffee_shop.payload.response.UserDTO;
import com.haui.coffee_shop.repository.RoleRepository;
import com.haui.coffee_shop.repository.UserRepository;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MessageBuilder messageBuilder;
    @Autowired
    private RoleRepository roleRepository;

    public RespMessage getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOS = new ArrayList<>();
        for (User user : users) {
            if (!"ROLE_ADMIN".equals(user.getRole().getName().toString())) {
                UserDTO userDTO = new UserDTO();
                userDTO.setId(user.getId());
                userDTO.setName(user.getName());
                userDTO.setEmail(user.getEmail());
                userDTO.setPhone(user.getPhone());
                userDTO.setProfile_img(user.getProfile_img());
                userDTO.setRoleName(user.getRole().getName().toString());
                userDTO.setStatus(user.getStatus().toString());
                userDTOS.add(userDTO);
            }
        }
        return messageBuilder.buildSuccessMessage(userDTOS);
    }

    public RespMessage getUserById() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[] { "User" },
                        "User not found when change password"));
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        userDTO.setProfile_img(user.getProfile_img());
        userDTO.setStatus(user.getStatus().toString());
        userDTO.setRoleName(user.getRole().getName().toString());
        return messageBuilder.buildSuccessMessage(userDTO);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public RespMessage banUser(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setStatus(Status.INACTIVE);
            UserDTO newUserDTO = new UserDTO();
            newUserDTO.setId(user.getId());
            newUserDTO.setName(user.getName());
            newUserDTO.setEmail(user.getEmail());
            newUserDTO.setPhone(user.getPhone());
            newUserDTO.setProfile_img(user.getProfile_img());
            newUserDTO.setStatus(Status.INACTIVE.toString());
            try {
                userRepository.save(user);
                return messageBuilder.buildSuccessMessage(newUserDTO);
            } catch (CoffeeShopException e) {
                throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[] { "user" },
                        "User could not be banned");
            }
        }
        throw new RuntimeException("User not found with ID: " + userId);
    }

    public RespMessage unbanUser(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setStatus(Status.ACTIVE);
            UserDTO updatedUserDTO = new UserDTO();
            updatedUserDTO.setId(user.getId());
            updatedUserDTO.setName(user.getName());
            updatedUserDTO.setEmail(user.getEmail());
            updatedUserDTO.setPhone(user.getPhone());
            updatedUserDTO.setProfile_img(user.getProfile_img());
            updatedUserDTO.setStatus(Status.ACTIVE.toString());
            try {
                userRepository.save(user);
                return messageBuilder.buildSuccessMessage(updatedUserDTO);
            } catch (CoffeeShopException e) {
                throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[] { "user" },
                        "User could not be unbanned");
            }
        }
        throw new RuntimeException("User not found with ID: " + userId);
    }

    public RespMessage updateUserInfo(UserRequest updatedUser) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new CoffeeShopException(Constant.FIELD_NOT_FOUND, new Object[] { "User" },
                        "User not found when change password"));
        currentUser.setName(updatedUser.getName());
        currentUser.setPhone(updatedUser.getPhone());
        currentUser.setUpdated_at(new Date());
        currentUser.setProfile_img(updatedUser.getProfileImg());
        try {
            userRepository.save(currentUser);
            return messageBuilder.buildSuccessMessage(updatedUser);
        } catch (CoffeeShopException e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[] { "user" },
                    "UserInfo could not be updated");
        }
    }

    public RespMessage updateUserRole(Long userId, String roleName) {
        try {
            Role role = new Role();
            if("ROLE_ADMIN".equals(roleName)){
                role = roleRepository.findByName(RoleEnum.ROLE_ADMIN)
                    .orElseThrow(() -> new CoffeeShopException("Role not found: " + roleName));
            }
            else if("ROLE_STAFF".equals(roleName)){
                role = roleRepository.findByName(RoleEnum.ROLE_STAFF)
                    .orElseThrow(() -> new CoffeeShopException("Role not found: " + roleName));
            }
            else{
                role = roleRepository.findByName(RoleEnum.ROLE_USER)
                    .orElseThrow(() -> new CoffeeShopException("Role not found: " + roleName));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CoffeeShopException("User not found with ID: " ));

            user.setRole(role);
            userRepository.save(user);
            return messageBuilder.buildSuccessMessage(true);
        } catch (CoffeeShopException e) {
            throw new CoffeeShopException(Constant.SYSTEM_ERROR, new Object[] { "user" },
                    "UserInfo could not be updated");
        }
    }
}
