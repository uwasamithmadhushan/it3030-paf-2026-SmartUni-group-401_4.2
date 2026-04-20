package com.example.demo.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private String recipientId;
    private String text;
}
