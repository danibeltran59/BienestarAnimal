package com.bienestaranimal.app.controller;

import com.bienestaranimal.app.model.Usuario;
import com.bienestaranimal.app.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.register(usuario));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        return ResponseEntity.ok(usuarioService.login(email, password));
    }
}
