package com.bienestaranimal.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. Recursos estáticos directos (Imágenes, Guías, etc.)
        registry.addResourceHandler("/guides/**")
                .addResourceLocations("classpath:/static/guides/", "classpath:/public/guides/");

        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        // 2. Fallback para SPA (Single Page Application)
        // Solo para rutas que NO sean de API ni ficheros con extensión
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/", "classpath:/public/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        // SPA fallback
                        if (!resourcePath.startsWith("api") && !resourcePath.contains(".")) {
                            return location.createRelative("index.html");
                        }
                        return null;
                    }
                });
    }
}
