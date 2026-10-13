package com.project.bookmyshow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class BookMyShowApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(BookMyShowApplication.class, args);
    }

    private static void loadDotenv() {
        File[] candidateFiles = new File[] {
            new File(".env"),
            new File("../.env"),
            new File("bookmyshow-backend/.env")
        };
        for (File file : candidateFiles) {
            if (file.exists() && file.isFile()) {
                try (FileInputStream fis = new FileInputStream(file)) {
                    Properties props = new Properties();
                    props.load(fis);
                    props.forEach((k, v) -> {
                        String key = k.toString().trim();
                        String value = v.toString().trim();
                        if (!key.isEmpty() && System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    });
                    break;
                } catch (IOException ignored) {
                }
            }
        }
    }
}
