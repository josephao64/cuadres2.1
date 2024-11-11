// login.js

// Definir los usuarios predefinidos
const usuarios = [
    { nombre: "Encargado JALAPA", sucursal: "JALAPA" },
    { nombre: "Encargado ZACAPA", sucursal: "ZACAPA" },
    { nombre: "Encargado PINULA", sucursal: "PINULA" },
    { nombre: "Encargado ESKALA", sucursal: "ESKALA" },
    { nombre: "Encargado SANTA ELENA", sucursal: "SANTA ELENA" },
    { nombre: "Encargado POPTUN", sucursal: "POPTUN" },
    { nombre: "Administración", sucursal: "ADMINISTRACION" }
];

document.addEventListener('DOMContentLoaded', () => {
    const usuarioSelect = document.getElementById('usuario');
    const loginForm = document.getElementById('login-form');

    // Poblar el select con los usuarios predefinidos
    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.nombre;
        option.textContent = usuario.nombre;
        usuarioSelect.appendChild(option);
    });

    // Manejar el evento de submit del formulario
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuarioSeleccionado = usuarioSelect.value;

        if (usuarioSeleccionado) {
            const usuario = usuarios.find(u => u.nombre === usuarioSeleccionado);
            if (usuario) {
                sessionStorage.setItem('usuario', JSON.stringify(usuario));

                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: `Has iniciado sesión como ${usuario.nombre}.`,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '../index.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usuario no encontrado.',
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, selecciona un usuario.',
            });
        }
    });
});
