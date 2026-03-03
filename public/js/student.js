import { db } from './firebase-config.js';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const studentEmail = localStorage.getItem('studentEmail');

document.addEventListener('DOMContentLoaded', async () => {
    if (!studentEmail) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('studentNameDisplay').textContent = studentEmail;

    // Configurar estado inicial del estudiante en Firestore
    const studentRef = doc(db, 'students', studentEmail);
    const docSnap = await getDoc(studentRef);
    if (!docSnap.exists()) {
        await setDoc(studentRef, {
            email: studentEmail,
            momentsData: {
                moment1: { dudas: "" },
                moment2: { q1: "", q2: "", q3: "" },
                moment3: { q1: "", q2: "", q3: "" },
                moment4: { rating: null, comments: "" }
            },
            lastUpdated: serverTimestamp()
        });
    }

    // Elementos UI
    const statusText = document.getElementById('activityStatusText');

    // Contenedores
    const moment1Container = document.getElementById('moment1Container');
    const moment2Container = document.getElementById('moment2Container');
    const moment3Container = document.getElementById('moment3Container');
    const moment4Container = document.getElementById('moment4Container');

    // Escuchar el Estado Global de la App (Control del Docente)
    const appStateRef = doc(db, 'appState', 'config');
    onSnapshot(appStateRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const activeMoment = parseInt(data.activeMoment) || 0;
            updateUIForMoment(activeMoment);
        } else {
            // Si no existe, lo creamos (idealmente esto lo hace el monitor, pero por si acaso)
            setDoc(appStateRef, { activeMoment: 0 });
            updateUIForMoment(0);
        }
    });

    function updateUIForMoment(activeMoment) {
        // Ocultar todos los momentos primero
        moment1Container.classList.add('hidden');
        moment2Container.classList.add('hidden');
        moment3Container.classList.add('hidden');
        moment4Container.classList.add('hidden');

        switch (activeMoment) {
            case 0:
                statusText.textContent = "La actividad está en pausa o aún no ha comenzado. Por favor espera a que el docente habilite el paso.";
                break;
            case 1:
                statusText.textContent = "Estás en el Momento 1. Complete la información solicitada abajo.";
                moment1Container.classList.remove('hidden');
                break;
            case 2:
                statusText.textContent = "Estás en el Momento 2. Lea los PDFs y responda la prueba de comprensión.";
                moment2Container.classList.remove('hidden');
                break;
            case 3:
                statusText.textContent = "Estás en el Momento 3. Analiza la información externa y responde las preguntas.";
                moment3Container.classList.remove('hidden');
                break;
            case 4:
                statusText.textContent = "Estás en el Momento 4. Por favor, califica la actividad y déjanos tus comentarios.";
                moment4Container.classList.remove('hidden');
                break;
            default:
                statusText.textContent = "Esperando instrucciones...";
        }
    }

    // Funciones de guardado - Creadores genéricos
    async function saveMomentData(updateObj, statusElementId) {
        try {
            await updateDoc(studentRef, {
                ...updateObj,
                lastUpdated: serverTimestamp()
            });
            const statusEl = document.getElementById(statusElementId);
            if (statusEl) {
                statusEl.classList.remove('hidden');
                setTimeout(() => statusEl.classList.add('hidden'), 3000);
            }
        } catch (error) {
            console.error("Error guardando datos:", error);
            alert("Hubo un error al guardar. Intenta de nuevo.");
        }
    }

    // Guardar Momento 1
    document.getElementById('saveMoment1Btn').addEventListener('click', () => {
        saveMomentData({
            "momentsData.moment1.dudas": document.getElementById('moment1Input').value
        }, 'moment1Status');
    });

    // Guardar Momento 2
    document.getElementById('saveMoment2Btn').addEventListener('click', () => {
        saveMomentData({
            "momentsData.moment2.q1": document.getElementById('moment2Q1').value,
            "momentsData.moment2.q2": document.getElementById('moment2Q2').value,
            "momentsData.moment2.q3": document.getElementById('moment2Q3').value
        }, 'moment2Status');
    });

    // Guardar Momento 3
    document.getElementById('saveMoment3Btn').addEventListener('click', () => {
        saveMomentData({
            "momentsData.moment3.q1": document.getElementById('moment3Q1').value,
            "momentsData.moment3.q2": document.getElementById('moment3Q2').value,
            "momentsData.moment3.q3": document.getElementById('moment3Q3').value
        }, 'moment3Status');
    });

    // Guardar Momento 4
    document.getElementById('saveMoment4Btn').addEventListener('click', () => {
        saveMomentData({
            "momentsData.moment4.rating": document.getElementById('moment4Rating').value,
            "momentsData.moment4.comments": document.getElementById('moment4Comments').value
        }, 'moment4Status');
    });

    // Cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('studentEmail');
        window.location.href = 'index.html';
    });
});
