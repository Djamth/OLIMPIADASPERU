package com.sistema.olimpiadas_peru.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Olimpiadas Peru API")
                .description("Backend SOA para la gestion de olimpiadas deportivas escolares")
                .version("1.0.0")
                .contact(new Contact().name("Equipo Olimpiadas Peru").email("soporte@olimpiadasperu.pe"))
                .license(new License().name("MIT")));
    }
}
