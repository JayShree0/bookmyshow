package com.project.bookmyshow.repository;

import com.project.bookmyshow.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {

    Optional<City> findByNameIgnoreCase(String name);

    List<City> findByActiveTrue();

    boolean existsByNameIgnoreCase(String name);
}

