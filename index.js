// Verificar si el usuario ha iniciado sesión
const usuarioLogueado = sessionStorage.getItem('usuario');

if (!usuarioLogueado) {
    // Redirigir al login si no ha iniciado sesión
    window.location.href = 'login/login.html';
} else {
    // Opcional: Puedes mostrar información del usuario en la consola
    const usuario = JSON.parse(usuarioLogueado);
    console.log(`Usuario conectado: ${usuario.nombre}`);
}

// Obtener referencias a los botones
const nuevoCuadreBtn = document.getElementById('nuevo-cuadre-btn');
const cuadresRealizadosBtn = document.getElementById('cuadres-realizados-btn');
const logoutBtn = document.getElementById('logout-btn');

// Evento para el botón "Realizar Nuevo Cuadre"
nuevoCuadreBtn.addEventListener('click', () => {
    window.location.href = 'CrearCuadre/Cuadre.html';
});

// Evento para el botón "Cuadres Realizados"
cuadresRealizadosBtn.addEventListener('click', () => {
    window.location.href = 'MostrarCuadre/MostrarCuadre.html';
});

// Evento para el botón "Cerrar Sesión"
logoutBtn.addEventListener('click', () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Cerrarás tu sesión actual.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar la sesión
            sessionStorage.removeItem('usuario');
            Swal.fire(
                'Sesión Cerrada',
                'Has cerrado tu sesión correctamente.',
                'success'
            ).then(() => {
                // Redirigir al login
                window.location.href = 'login/login.html';
            });
        }
    });
});
