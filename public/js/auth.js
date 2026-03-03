import { auth } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const TEACHER_EMAIL = "ricardomd2000@gmail.com";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return; // Si no estamos en index.html, salimos

    const errorMessage = document.getElementById('errorMessage');

    // Escuchar cambios de autenticación
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario está logueado, redirigir
            redirectUser(user.email);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (email === TEACHER_EMAIL) {
            // Para el docente requerimos contraseña
            if (!password) {
                showError("El docente debe ingresar una contraseña.");
                return;
            }
            try {
                await signInWithEmailAndPassword(auth, email, password);
                // La redirección ocurrirá en onAuthStateChanged
            } catch (error) {
                console.error("Error en login docente:", error);
                showError("Correo o contraseña incorrectos para el docente.");
            }
        } else {
            // Para el estudiante, usamos un flujo pseudo-anónimo asociando el correo al estado local
            // Dado que quieres que sea paso a paso, guardaremos el email en localStorage
            // y simularemos la sesión para no forzar creación de cuentas complejas con Auth
            localStorage.setItem('studentEmail', email);
            window.location.href = 'student.html';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function redirectUser(email) {
        if (email === TEACHER_EMAIL) {
            window.location.href = 'monitor.html';
        } else {
            window.location.href = 'student.html';
        }
    }
});
