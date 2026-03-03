import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const TEACHER_EMAIL = "ricardomd2000@gmail.com";

document.addEventListener('DOMContentLoaded', () => {
    // Validar autenticación
    onAuthStateChanged(auth, (user) => {
        if (!user || user.email !== TEACHER_EMAIL) {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('teacherEmailDisplay').textContent = user.email;
        initMonitor();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        });
    });

    async function initMonitor() {
        const activeMomentSelect = document.getElementById('activeMomentSelect');
        const studentsDashboard = document.getElementById('studentsDashboard');
        const appStateRef = doc(db, 'appState', 'config');

        // 1. Inicializar / Escuchar el estado de la App
        const stateSnap = await getDoc(appStateRef);
        if (!stateSnap.exists()) {
            await setDoc(appStateRef, { activeMoment: 0 });
        }

        onSnapshot(appStateRef, (doc) => {
            if (doc.exists()) {
                activeMomentSelect.value = doc.data().activeMoment || 0;
            }
        });

        activeMomentSelect.addEventListener('change', async (e) => {
            const newMoment = parseInt(e.target.value);
            await updateDoc(appStateRef, { activeMoment: newMoment });
            console.log(`Momento actualizado a: ${newMoment}`);
        });

        // 2. Escuchar a los estudiantes
        const studentsRef = collection(db, 'students');
        onSnapshot(studentsRef, (snapshot) => {
            if (snapshot.empty) {
                studentsDashboard.innerHTML = "<p>No hay estudiantes registrados aún.</p>";
                return;
            }

            studentsDashboard.innerHTML = ""; // Limpiar grid

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const card = createStudentCard(data);
                studentsDashboard.appendChild(card);
            });
        });
    }

    function createStudentCard(data) {
        const div = document.createElement('div');
        div.className = 'card student-card';
        // Verificar momento actual para color del borde
        const appStateSelect = document.getElementById('activeMomentSelect').value;
        const currentM = parseInt(appStateSelect);
        if (currentM > 0) {
            div.classList.add('active');
        }

        const email = data.email || 'Desconocido';
        const mData = data.momentsData || {};

        const m1Info = mData.moment1?.dudas || '<em>Sin respuesta</em>';
        const m2Info = mData.moment2?.q1 ? `<ul><li>Q1: ${mData.moment2.q1}</li><li>Q2: ${mData.moment2.q2}</li><li>Q3: ${mData.moment2.q3}</li></ul>` : '<em>Sin respuesta</em>';
        const m3Info = mData.moment3?.q1 ? `<ul><li>Q1: ${mData.moment3.q1}</li><li>Q2: ${mData.moment3.q2}</li><li>Q3: ${mData.moment3.q3}</li></ul>` : '<em>Sin respuesta</em>';
        const m4Info = mData.moment4?.rating ? `Calificación: <strong>${mData.moment4.rating}/10</strong><br>Comentarios: ${mData.moment4.comments}` : '<em>Sin respuesta</em>';

        div.innerHTML = `
            <h3>${email}</h3>
            <hr style="margin: 10px 0;">
            <div style="font-size: 0.9em;">
                <p><strong>Momento 1 (Dudas):</strong></p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #eee; margin-bottom:10px;">
                    ${m1Info}
                </div>
                
                <p><strong>Momento 2 (Comprensión):</strong></p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #eee; margin-bottom:10px;">
                    ${m2Info}
                </div>

                <p><strong>Momento 3 (Análisis):</strong></p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #eee; margin-bottom:10px;">
                    ${m3Info}
                </div>

                <p><strong>Momento 4 (Cierre):</strong></p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #eee;">
                    ${m4Info}
                </div>
            </div>
        `;
        return div;
    }
});
