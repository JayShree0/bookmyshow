package com.project.bookmyshow.service;

import com.project.bookmyshow.exception.BadRequestException;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.model.City;
import com.project.bookmyshow.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CityService {

    @Autowired
    private CityRepository cityRepository;

    public City createCity(City city) {
        if (cityRepository.existsByNameIgnoreCase(city.getName())) {
            throw new BadRequestException("City with name " + city.getName() + " already exists");
        }
        city.setActive(true);
        return cityRepository.save(city);
    }

    public List<City> getAllActiveCities() {
        return cityRepository.findByActiveTrue();
    }

    public City getCityById(Long id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City not found with id: " + id));
    }

    public City updateCity(Long id, City cityDetails) {
        City city = getCityById(id);
        city.setName(cityDetails.getName());
        city.setState(cityDetails.getState());
        if (cityDetails.getActive() != null) {
            city.setActive(cityDetails.getActive());
        }
        return cityRepository.save(city);
    }

    public void deactivateCity(Long id) {
        City city = getCityById(id);
        city.setActive(false);
        cityRepository.save(city);
    }
}

