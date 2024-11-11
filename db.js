// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC5mf4SnPFBCCJuPlBzD9wrXWVSXU2i-Wc",
    authDomain: "dbcuadres.firebaseapp.com",
    projectId: "dbcuadres",
    storageBucket: "dbcuadres.firebasestorage.app",
    messagingSenderId: "322809963002",
    appId: "1:322809963002:web:f24de9e406862d646c0443"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
