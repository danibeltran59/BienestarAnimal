package com.bienestaranimal.app.service;

import com.bienestaranimal.app.model.Role;
import com.bienestaranimal.app.model.Usuario;
import com.bienestaranimal.app.repository.UsuarioRepository;
import com.bienestaranimal.app.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public Map<String, String> register(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        // Por defecto asignamos rol CUIDADOR si no viene
        if (usuario.getRole() == null) {
            usuario.setRole(Role.CUIDADOR);
        }
        usuarioRepository.save(usuario);

        String token = jwtUtils.generateToken(usuario);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", usuario.getRole().name());
        return response;
    }

    public Map<String, String> login(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = jwtUtils.generateToken(usuario);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", usuario.getRole().name());
        return response;
    }

    public Map<String, String> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Map<String, String> response = new HashMap<>();
        response.put("email", usuario.getEmail());
        response.put("role", usuario.getRole().name());
        return response;
    }
}
