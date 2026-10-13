package com.project.bookmyshow.controller;

import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.model.Coupon;
import com.project.bookmyshow.repository.CouponRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        return ResponseEntity.ok(couponRepository.findByActiveTrue());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Coupon> createCoupon(@Valid @RequestBody Coupon coupon) {
        coupon.setCode(coupon.getCode().trim().toUpperCase());
        return new ResponseEntity<>(couponRepository.save(coupon), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Coupon> deactivateCoupon(@PathVariable Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        coupon.setActive(false);
        return ResponseEntity.ok(couponRepository.save(coupon));
    }
}

