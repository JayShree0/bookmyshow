package com.project.bookmyshow.payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class PaymentGatewayFactory {

    private final Map<String, PaymentGateway> gatewayMap;

    @Autowired
    public PaymentGatewayFactory(List<PaymentGateway> gateways) {
        this.gatewayMap = gateways.stream()
                .collect(Collectors.toMap(g -> g.getName().toUpperCase(), Function.identity()));
    }

    public PaymentGateway getGateway(String name) {
        if (name == null || name.isBlank()) {
            return gatewayMap.getOrDefault("MOCK", gatewayMap.values().iterator().next());
        }
        PaymentGateway gateway = gatewayMap.get(name.toUpperCase());
        if (gateway == null) {
            return gatewayMap.getOrDefault("MOCK", gatewayMap.values().iterator().next());
        }
        return gateway;
    }
}

