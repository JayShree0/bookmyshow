package com.project.bookmyshow.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.bookmyshow.dto.auth.ChangePasswordRequest;
import com.project.bookmyshow.dto.auth.LoginRequest;
import com.project.bookmyshow.dto.auth.RefreshTokenRequest;
import com.project.bookmyshow.dto.auth.RegisterRequest;
import com.project.bookmyshow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.project.bookmyshow.repository.RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testRegisterUser_Success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alice Wonder")
                .email("alice@example.com")
                .password("Password123")
                .phoneNumber("9876543210")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.email", is("alice@example.com")))
                .andExpect(jsonPath("$.role", is("ROLE_CUSTOMER")));
    }

    @Test
    void testRegisterUser_DuplicateEmail_Fails() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alice Wonder")
                .email("alice@example.com")
                .password("Password123")
                .phoneNumber("9876543210")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    void testLogin_Success() throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .name("Bob Builder")
                .email("bob@example.com")
                .password("Secret@123")
                .phoneNumber("9876543211")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest("bob@example.com", "Secret@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.email", is("bob@example.com")));
    }

    @Test
    void testLogin_WrongPassword_Fails() throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .name("Bob Builder")
                .email("bob@example.com")
                .password("Secret@123")
                .phoneNumber("9876543211")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest("bob@example.com", "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    void testRefreshToken_Success() throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .name("Charlie Brown")
                .email("charlie@example.com")
                .password("Secret@123")
                .phoneNumber("9876543212")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        String refreshToken = objectMapper.readTree(responseStr).get("refreshToken").asText();

        RefreshTokenRequest refreshReq = new RefreshTokenRequest(refreshToken);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", not(equalTo(refreshToken))));
    }

    @Test
    void testProtectedProfileEndpoint_RequiresAuth() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testProtectedProfileEndpoint_WithBearerToken_Success() throws Exception {
        RegisterRequest register = RegisterRequest.builder()
                .name("Diana Prince")
                .email("diana@example.com")
                .password("WonderWoman@123")
                .phoneNumber("9876543213")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        String accessToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("diana@example.com")))
                .andExpect(jsonPath("$.name", is("Diana Prince")));
    }
}
