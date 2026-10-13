package com.project.bookmyshow.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private Date timeStamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
