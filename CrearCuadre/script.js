// Verificar si el usuario ha iniciado sesión
document.addEventListener('DOMContentLoaded', () => {
    const usuarioSesion = sessionStorage.getItem('usuario');

    if (!usuarioSesion) {
        // Si no hay usuario en sesión, redirigir al login
        window.location.href = '../login/login.html';
    } else {
        // Si hay usuario en sesión, continuar y cargar la aplicación
        inicializarAplicacion();
    }
});

function inicializarAplicacion() {
    // Obtener el usuario de la sesión
    const usuarioSesion = JSON.parse(sessionStorage.getItem('usuario'));
    const sucursal = usuarioSesion.sucursal;
    const sucursalInput = document.getElementById('sucursal');
    sucursalInput.value = sucursal;

    // Variables para las Cajas
    const cajasContainer = document.getElementById('cajas-container');
    const ventaEfectivoCajasDisplay = document.getElementById('venta-efectivo-cajas');
    const ventaTarjetaTotalDisplay = document.getElementById('venta-tarjeta-total');

    // Variables para los Gastos
    const gastosTable = document.getElementById('gastos-table').getElementsByTagName('tbody')[0];
    const agregarGastoBtn = document.getElementById('agregar-gasto-btn');
    const totalGastosDisplay = document.getElementById('venta-total-gastos');

    // Variables para Ventas
    const ventaMotoristaInput = document.getElementById('venta-motorista');
    const ventaPedidosYaInput = document.getElementById('venta-pedidos-ya');

    // Totales
    const totalVentasDisplay = document.getElementById('total-ventas');
    const sobranteAyerInput = document.getElementById('sobrante-ayer');
    const ventaEfectivoDisplay = document.getElementById('venta-efectivo');
    const totalDepositarDisplay = document.getElementById('total-depositar');

    // ID Cuadre
    const idCuadreText = document.getElementById('id-cuadre-text');
    let idCuadreActual = 0;

    // Variables para Instrucciones
    const instructionButtons = document.querySelectorAll('.instruction-btn');

    // Botón de Guardar Cuadre
    const guardarCuadreBtn = document.getElementById('guardar-cuadre-btn');

    // SweetAlert Configuración
    const SwalToast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    // Denominaciones de Billetes
    const denominaciones = [200, 100, 50, 20, 10, 5, 1];
    const totalCajasInicial = 3; // Número de cajas iniciales

    // Variables para Datos Encargado
    const datosEncargadoTable = document.getElementById('datos-encargado-table');
    const totalCuentaEfectivoDisplay = document.getElementById('total-cuenta-efectivo');
    const totalVentaTarjetaDisplay = document.getElementById('total-venta-tarjeta');
    const totalVentaMotoristaDisplay = document.getElementById('total-venta-motorista');

    // Variables para Datos Sistema
    const datosSistemaTable = document.getElementById('datos-sistema-table');
    const totalSistemaCuentaEfectivoDisplay = document.getElementById('total-sistema-cuenta-efectivo');
    const totalSistemaVentaTarjetaDisplay = document.getElementById('total-sistema-venta-tarjeta');
    const totalSistemaVentaMotoristaDisplay = document.getElementById('total-sistema-venta-motorista');

    // Variables para Control Administrativo
    const diferenciaEfectivoDisplay = document.getElementById('diferencia-efectivo');
    const diferenciaTarjetaDisplay = document.getElementById('diferencia-tarjeta');
    const diferenciaMotoristaDisplay = document.getElementById('diferencia-motorista');
    const diferenciaTotalDisplay = document.getElementById('diferencia-total');

    // Función para obtener el último ID Cuadre desde Firebase para la sucursal actual
    function obtenerUltimoIdCuadre(sucursal) {
        const sucursalRef = db.collection('ultimosIds').doc(sucursal);

        sucursalRef.get().then((doc) => {
            if (doc.exists) {
                const ultimoId = doc.data().ultimoId || 0;
                idCuadreActual = ultimoId + 1;
            } else {
                idCuadreActual = 1;
            }
            idCuadreText.textContent = idCuadreActual;
        }).catch((error) => {
            console.error("Error al obtener el último ID de cuadre: ", error);
        });
    }

    // Llamar a la función al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
        obtenerUltimoIdCuadre(sucursal);
        actualizarTotalesGlobales();
        actualizarTotalesDatosEncargado();
        actualizarTotalesDatosSistema();
        actualizarControlAdministrativo();
    });

    // Función para actualizar el último ID Cuadre en Firebase
    function actualizarUltimoIdCuadre(sucursal, idCuadreActual) {
        const sucursalRef = db.collection('ultimosIds').doc(sucursal);

        sucursalRef.set({ ultimoId: idCuadreActual })
            .then(() => {
                console.log('Último ID de cuadre actualizado correctamente.');
            })
            .catch((error) => {
                console.error('Error al actualizar el último ID de cuadre: ', error);
            });
    }

    // Función para actualizar los totales globales
    function actualizarTotalesGlobales() {
        let ventaEfectivoCajas = 0;
        let ventaTarjetaTotal = 0;
        let ventaMotorista = parseFloat(ventaMotoristaInput.value) || 0;
        let pedidosYa = parseFloat(ventaPedidosYaInput.value) || 0;
        let sobranteAyer = parseFloat(sobranteAyerInput.value) || 0;
        let sumaGastos = parseFloat(totalGastosDisplay.textContent) || 0;

        // Calcular Venta Efectivo Cajas y Venta Tarjeta Total
        const cajas = document.querySelectorAll('.caja');
        cajas.forEach(caja => {
            if (!caja.classList.contains('disabled')) {
                let totalBilletes = 0;
                let apertura = parseFloat(caja.querySelector('.apertura').value) || 0;
                let ventaTarjeta = parseFloat(caja.querySelector('.venta-tarjeta').value) || 0;

                denominaciones.forEach(d => {
                    const input = caja.querySelector(`input[data-denom="${d}"]`);
                    const cantidad = parseFloat(input.value) || 0;
                    totalBilletes += d * cantidad;
                });
                const ventaCaja = totalBilletes - apertura;
                ventaEfectivoCajas += ventaCaja;
                ventaTarjetaTotal += ventaTarjeta;

                // Actualizar Datos Encargado
                const cajaId = caja.getAttribute('data-id');
                const datosEncargadoRow = datosEncargadoTable.querySelector(`tbody tr:nth-child(${cajaId})`);
                const cuentaEfectivoCell = datosEncargadoRow.querySelector('.datos-encargado-cuenta-efectivo');
                const ventaTarjetaCell = datosEncargadoRow.querySelector('.datos-encargado-venta-tarjeta');

                cuentaEfectivoCell.textContent = ventaCaja.toFixed(2);
                ventaTarjetaCell.textContent = ventaTarjeta.toFixed(2);
            }
        });

        // Calcular Venta Efectivo
        let ventaEfectivo = ventaEfectivoCajas + ventaMotorista;

        // Calcular Total Ventas
        let totalVentas = ventaEfectivo + ventaTarjetaTotal + pedidosYa;

        // Calcular Total a Depositar
        let totalDepositar = ventaEfectivo + sobranteAyer - sumaGastos;

        // Actualizar displays
        ventaEfectivoCajasDisplay.textContent = ventaEfectivoCajas.toFixed(2);
        ventaTarjetaTotalDisplay.textContent = ventaTarjetaTotal.toFixed(2);
        document.getElementById('venta-motorista-total').textContent = ventaMotorista.toFixed(2);
        document.getElementById('venta-pedidos-ya-total').textContent = pedidosYa.toFixed(2);
        totalVentasDisplay.textContent = totalVentas.toFixed(2);
        ventaEfectivoDisplay.textContent = ventaEfectivo.toFixed(2);
        totalDepositarDisplay.textContent = totalDepositar.toFixed(2);

        actualizarTotalesDatosEncargado();
        actualizarControlAdministrativo();
    }

    // Función para crear una nueva caja
    function crearCaja(id) {
        const cajaDiv = document.createElement('div');
        cajaDiv.classList.add('caja');
        cajaDiv.setAttribute('data-id', id);

        let denominacionHTML = '';
        denominaciones.forEach(d => {
            denominacionHTML += `
                <div class="denomination">
                    <label for="caja-${id}-denom-${d}">Q${d}:</label>
                    <input type="number" id="caja-${id}-denom-${d}" min="0" step="0.01" data-denom="${d}">
                    <span class="subtotal">Q0.00</span>
                </div>
            `;
        });

        cajaDiv.innerHTML = `
            <h3>
                Caja #${id}
                <div>
                    <button class="disable-btn">Deshabilitar</button>
                    <button class="enable-btn" style="display: none;">Habilitar</button>
                </div>
            </h3>
            <div class="input-group">
                <label for="caja-${id}-apertura">Apertura (Q):</label>
                <input type="number" id="caja-${id}-apertura" class="apertura" min="0" step="0.01">
            </div>
            <div class="input-group">
                <label for="caja-${id}-venta-tarjeta">Venta Tarjeta (Q):</label>
                <input type="number" id="caja-${id}-venta-tarjeta" class="venta-tarjeta" min="0" step="0.01">
            </div>
            ${denominacionHTML}
            <div class="totales-caja">
                <p>Total: Q<span class="total-caja" data-total="0">0.00</span></p>
                <p>Venta: Q<span class="venta-caja">0.00</span></p>
            </div>
        `;

        cajasContainer.appendChild(cajaDiv);

        // Añadir eventos a los inputs de billetes, apertura y venta tarjeta
        const aperturaInput = cajaDiv.querySelector('.apertura');
        const ventaTarjetaInput = cajaDiv.querySelector('.venta-tarjeta');

        aperturaInput.addEventListener('input', () => {
            calcularTotalesCaja(cajaDiv);
        });

        ventaTarjetaInput.addEventListener('input', () => {
            calcularTotalesCaja(cajaDiv);
            actualizarTotalesGlobales();
        });

        denominaciones.forEach(d => {
            const input = cajaDiv.querySelector(`input[data-denom="${d}"]`);
            const subtotalSpan = input.nextElementSibling;
            input.addEventListener('input', () => {
                const cantidad = parseFloat(input.value) || 0;
                const subtotal = d * cantidad;
                subtotalSpan.textContent = `Q${subtotal.toFixed(2)}`;
                calcularTotalesCaja(cajaDiv);
            });
        });

        // Evento para deshabilitar la caja
        const disableBtn = cajaDiv.querySelector('.disable-btn');
        const enableBtn = cajaDiv.querySelector('.enable-btn');

        disableBtn.addEventListener('click', () => {
            deshabilitarCaja(cajaDiv, disableBtn, enableBtn);
        });

        // Evento para habilitar la caja
        enableBtn.addEventListener('click', () => {
            habilitarCaja(cajaDiv, disableBtn, enableBtn);
        });
    }

    // Función para calcular los totales de una caja individual
    function calcularTotalesCaja(cajaDiv) {
        const aperturaInput = cajaDiv.querySelector('.apertura');
        const apertura = parseFloat(aperturaInput.value) || 0;
        let totalCajaBilletes = 0;
        denominaciones.forEach(d => {
            const input = cajaDiv.querySelector(`input[data-denom="${d}"]`);
            const cantidad = parseFloat(input.value) || 0;
            totalCajaBilletes += d * cantidad;
        });
        const ventaCaja = totalCajaBilletes - apertura;

        // Actualizar el display de Total y Venta en la caja individual
        cajaDiv.querySelector('.total-caja').textContent = totalCajaBilletes.toFixed(2);
        cajaDiv.querySelector('.venta-caja').textContent = ventaCaja.toFixed(2);

        actualizarTotalesGlobales();
    }

    // Función para deshabilitar una caja
    function deshabilitarCaja(cajaDiv, disableBtn, enableBtn) {
        // Validar si hay datos ingresados antes de deshabilitar
        const apertura = cajaDiv.querySelector('.apertura').value;
        const billetes = cajaDiv.querySelectorAll('.denomination input');
        const ventaTarjeta = cajaDiv.querySelector('.venta-tarjeta').value;
        let hasData = false;

        if (apertura.trim() !== '' || ventaTarjeta.trim() !== '') {
            hasData = true;
        }

        billetes.forEach(input => {
            if (parseFloat(input.value) > 0) {
                hasData = true;
            }
        });

        if (hasData) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Esto limpiará todos los campos de la caja.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, deshabilitar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Establecer todos los campos a vacío y deshabilitarlos
                    cajaDiv.querySelector('.apertura').value = '';
                    cajaDiv.querySelector('.venta-tarjeta').value = '';
                    const inputs = cajaDiv.querySelectorAll('input');
                    inputs.forEach(input => {
                        input.value = '';
                        input.disabled = true;
                    });

                    // Establecer todos los subtotales a Q0.00
                    const subtotales = cajaDiv.querySelectorAll('.subtotal');
                    subtotales.forEach(span => {
                        span.textContent = 'Q0.00';
                    });

                    // Marcar la caja como deshabilitada
                    cajaDiv.classList.add('disabled');

                    // Mostrar el botón de habilitar y ocultar el de deshabilitar
                    disableBtn.style.display = 'none';
                    enableBtn.style.display = 'inline-block';

                    actualizarTotalesGlobales();

                    // Mostrar alerta de éxito
                    Swal.fire(
                        'Deshabilitada',
                        'La caja ha sido deshabilitada correctamente.',
                        'success'
                    );
                }
            });
        } else {
            // Si no hay datos, simplemente deshabilitar
            cajaDiv.classList.add('disabled');
            disableBtn.style.display = 'none';
            enableBtn.style.display = 'inline-block';
            actualizarTotalesGlobales();
        }
    }

    // Función para habilitar una caja
    function habilitarCaja(cajaDiv, disableBtn, enableBtn) {
        // Habilitar todos los campos
        const inputs = cajaDiv.querySelectorAll('input');
        inputs.forEach(input => {
            input.disabled = false;
        });

        // Marcar la caja como habilitada
        cajaDiv.classList.remove('disabled');

        // Mostrar el botón de deshabilitar y ocultar el de habilitar
        disableBtn.style.display = 'inline-block';
        enableBtn.style.display = 'none';

        actualizarTotalesGlobales();

        // Mostrar alerta de éxito
        Swal.fire(
            'Habilitada',
            'La caja ha sido habilitada correctamente.',
            'success'
        );
    }

    // Función para agregar una nueva fila de gasto
    function agregarGasto() {
        const newRow = gastosTable.insertRow();

        newRow.classList.add('gasto-row');

        // Descripción
        const descripcionCell = newRow.insertCell(0);
        const descripcionInput = document.createElement('input');
        descripcionInput.type = 'text';
        descripcionInput.classList.add('descripcion-gasto');
        descripcionInput.placeholder = 'Descripción';
        descripcionCell.appendChild(descripcionInput);

        // Número Factura
        const facturaCell = newRow.insertCell(1);
        const facturaInput = document.createElement('input');
        facturaInput.type = 'text';
        facturaInput.classList.add('numero-factura-gasto');
        facturaInput.placeholder = 'Número Factura';
        facturaCell.appendChild(facturaInput);

        // Total
        const totalCell = newRow.insertCell(2);
        const totalInput = document.createElement('input');
        totalInput.type = 'number';
        totalInput.classList.add('total-gasto');
        totalInput.min = '0';
        totalInput.step = '0.01';
        totalCell.appendChild(totalInput);

        // Añadir evento para recalcular gastos al cambiar el total
        totalInput.addEventListener('input', () => {
            calcularTotalGastos();
        });

        // Validaciones para los campos de la nueva fila
        descripcionInput.addEventListener('input', () => {
            validarTexto(descripcionInput);
        });

        facturaInput.addEventListener('input', () => {
            validarTexto(facturaInput);
        });

        // Recalcular gastos
        calcularTotalGastos();
    }

    // Función para calcular el total de gastos
    function calcularTotalGastos() {
        let sumaGastos = 0;
        const totalGastoInputs = document.querySelectorAll('.total-gasto');
        totalGastoInputs.forEach(input => {
            const valor = parseFloat(input.value) || 0;
            sumaGastos += valor;
        });
        totalGastosDisplay.textContent = sumaGastos.toFixed(2);
        actualizarTotalesGlobales();
    }

    // Función para validar texto (solo letras y números)
    function validarTexto(input) {
        const regex = /^[A-Za-z0-9\s]+$/;
        if (!regex.test(input.value)) {
            input.classList.add('input-invalid');
            Swal.fire({
                icon: 'error',
                title: 'Entrada Inválida',
                text: 'Por favor, ingresa solo letras y números.',
            });
        } else {
            input.classList.remove('input-invalid');
        }
    }

    // Validaciones para el Formulario de Información de Cuadre
    const infoForm = document.getElementById('info-form');

    infoForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validar el formulario
        if (validarFormulario()) {
            // Si todas las validaciones pasan
            Swal.fire({
                icon: 'success',
                title: 'Información Guardada',
                text: 'La información de cuadre ha sido guardada correctamente.',
            }).then(() => {
                // Resetear el formulario
                infoForm.reset();
                // Establecer el próximo ID Cuadre
                obtenerUltimoIdCuadre(sucursal);
                // Actualizar totales globales para reflejar el reset
                actualizarTotalesGlobales();
            });
        }
    });

    // Evento para el botón "Agregar Gasto"
    agregarGastoBtn.addEventListener('click', agregarGasto);

    // Inicializar con 3 cajas
    for (let i = 1; i <= totalCajasInicial; i++) {
        crearCaja(i);
    }

    // Añadir evento a la fila inicial de gastos
    const filaInicialGastos = gastosTable.querySelector('.gasto-row');
    const totalGastoInputInicial = filaInicialGastos.querySelector('.total-gasto');
    totalGastoInputInicial.addEventListener('input', () => {
        calcularTotalGastos();
    });

    // Función para mostrar instrucciones con datos ingresados
    function mostrarInstrucciones(seccion) {
        let mensaje = '';

        switch(seccion) {
            case 'ventas':
                mensaje = `<strong>Ventas:</strong><br>
                           En esta sección, registra las diferentes categorías de ventas realizadas.<br><br>
                           <strong>Venta Tarjeta:</strong><br>
                           Ingresa el monto total de ventas realizadas mediante tarjeta en cada caja.<br><br>
                           <strong>Venta Motorista:</strong><br>
                           Introduce el monto de ventas realizadas por los motoristas. Puedes deshabilitar este campo si no aplica.<br><br>
                           <strong>Pedidos Ya:</strong><br>
                           Registra el monto de ventas realizadas a través de la plataforma Pedidos Ya. Puedes deshabilitar este campo si no se utiliza.`;
                break;
            case 'gastos':
                mensaje = `<strong>Gastos:</strong><br>
                           En esta sección, ingresa todos los gastos realizados durante el periodo.<br><br>
                           <strong>Descripción:</strong><br>
                           Detalla el concepto del gasto.<br><br>
                           <strong>Número Factura:</strong><br>
                           Proporciona el número de factura correspondiente al gasto.<br><br>
                           <strong>Total (Q):</strong><br>
                           Indica el monto total del gasto en quetzales (Q).<br><br>
                           Puedes agregar más filas si hay múltiples gastos a registrar.`;
                break;
            case 'datos-sistema':
                mensaje = `<strong>Datos Sistema:</strong><br>
                           En esta sección, puedes ingresar manualmente los datos del sistema para cada caja.<br><br>
                           <strong>Cuenta Efectivo (Q):</strong><br>
                           Ingresa el monto de efectivo registrado en el sistema para cada caja.<br><br>
                           <strong>Venta Tarjeta (Q):</strong><br>
                           Ingresa el monto de ventas por tarjeta registrado en el sistema para cada caja.<br><br>
                           <strong>Venta Motorista (Q):</strong><br>
                           Ingresa el monto de ventas por motorista registrado en el sistema.`;
                break;
            default:
                mensaje = 'No se encontraron instrucciones para esta sección.';
        }

        Swal.fire({
            icon: 'info',
            title: 'Instrucciones',
            html: mensaje,
        });
    }

    // Evento para los botones de instrucciones
    instructionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const seccion = btn.getAttribute('data-seccion');
            mostrarInstrucciones(seccion);
        });
    });

    // Función para manejar la deshabilitación/habilitación de campos de venta
    const toggleButtons = document.querySelectorAll('.toggle-btn');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (targetInput.disabled) {
                targetInput.disabled = false;
                btn.textContent = 'Deshabilitar';
                actualizarTotalesGlobales();
                Swal.fire(
                    'Habilitado',
                    `El campo "${capitalizeWords(targetId.replace(/-/g, ' '))}" ha sido habilitado.`,
                    'success'
                );
            } else {
                targetInput.disabled = true;
                targetInput.value = '';
                btn.textContent = 'Habilitar';
                actualizarTotalesGlobales();
                Swal.fire(
                    'Deshabilitado',
                    `El campo "${capitalizeWords(targetId.replace(/-/g, ' '))}" ha sido deshabilitado y su valor ha sido reiniciado.`,
                    'success'
                );
            }
        });
    });

    // Función para capitalizar palabras
    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    // Evento para actualizar totales al cambiar las ventas y sobrante ayer
    ventaMotoristaInput.addEventListener('input', actualizarTotalesGlobales);
    ventaPedidosYaInput.addEventListener('input', actualizarTotalesGlobales);
    sobranteAyerInput.addEventListener('input', actualizarTotalesGlobales);

    // Función para marcar un campo como inválido
    function markInvalidField(input) {
        input.classList.add('input-invalid');
    }

    // Función para validar que todas las casillas estén llenas correctamente
    function validarFormulario() {
        let isValid = true;
        let firstInvalidField = null;

        // Resetear marcas de campos inválidos
        const allInputs = document.querySelectorAll('input');
        allInputs.forEach(input => {
            input.classList.remove('input-invalid');
        });

        // Validar Información de Cuadre
        const fecha = document.getElementById('fecha').value.trim();
        const cajaChicaInicial = document.getElementById('caja-chica-inicial').value.trim();

        if (fecha === '') {
            markInvalidField(document.getElementById('fecha'));
            isValid = false;
            if (!firstInvalidField) firstInvalidField = document.getElementById('fecha');
        }

        if (cajaChicaInicial === '' || isNaN(cajaChicaInicial) || parseFloat(cajaChicaInicial) < 0) {
            markInvalidField(document.getElementById('caja-chica-inicial'));
            isValid = false;
            if (!firstInvalidField) firstInvalidField = document.getElementById('caja-chica-inicial');
        }

        // Validar Sobrante Ayer
        if (isNaN(sobranteAyerInput.value) || parseFloat(sobranteAyerInput.value) < 0) {
            markInvalidField(sobranteAyerInput);
            isValid = false;
            if (!firstInvalidField) firstInvalidField = sobranteAyerInput;
        }

        // Validar Gastos
        const descripcionGastos = document.querySelectorAll('.descripcion-gasto');
        const numeroFacturaGastos = document.querySelectorAll('.numero-factura-gasto');
        const totalGastos = document.querySelectorAll('.total-gasto');

        for (let i = 0; i < descripcionGastos.length; i++) {
            if (descripcionGastos[i].value.trim() === '') {
                markInvalidField(descripcionGastos[i]);
                isValid = false;
                if (!firstInvalidField) firstInvalidField = descripcionGastos[i];
            }

            if (numeroFacturaGastos[i].value.trim() === '') {
                markInvalidField(numeroFacturaGastos[i]);
                isValid = false;
                if (!firstInvalidField) firstInvalidField = numeroFacturaGastos[i];
            }

            if (isNaN(totalGastos[i].value) || parseFloat(totalGastos[i].value) < 0) {
                markInvalidField(totalGastos[i]);
                isValid = false;
                if (!firstInvalidField) firstInvalidField = totalGastos[i];
            }
        }

        if (!isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Campos Incompletos',
                text: 'Por favor, completa todos los campos requeridos correctamente.',
            });

            if (firstInvalidField) {
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalidField.focus();
            }

            return false;
        }

        return true;
    }

    // Evento para el botón "Guardar Cuadre"
    guardarCuadreBtn.addEventListener('click', () => {
        if (validarFormulario()) {
            // Obtener datos del formulario
            const cuadreData = obtenerDatosCuadre();

            // Guardar en Firebase
            guardarCuadreEnFirebase(cuadreData);
        }
    });

    // Función para obtener los datos del cuadre
    function obtenerDatosCuadre() {
        const fecha = document.getElementById('fecha').value;
        const cajaChicaInicial = parseFloat(document.getElementById('caja-chica-inicial').value) || 0;
        const idCuadre = idCuadreActual;

        // Crear objeto con todos los datos necesarios
        const cuadreData = {
            idCuadre,
            sucursal,
            fecha,
            cajaChicaInicial,
            cajas: [],
            ventas: {
                ventaEfectivoCajas: parseFloat(ventaEfectivoCajasDisplay.textContent),
                ventaTarjetaTotal: parseFloat(ventaTarjetaTotalDisplay.textContent),
                ventaMotorista: parseFloat(document.getElementById('venta-motorista-total').textContent),
                pedidosYa: parseFloat(document.getElementById('venta-pedidos-ya-total').textContent),
                totalVentas: parseFloat(totalVentasDisplay.textContent)
            },
            sobranteAyer: parseFloat(sobranteAyerInput.value),
            ventaEfectivo: parseFloat(ventaEfectivoDisplay.textContent),
            gastos: obtenerGastos(),
            totalDepositar: parseFloat(totalDepositarDisplay.textContent),
            controlAdministrativo: {
                diferenciaEfectivo: parseFloat(diferenciaEfectivoDisplay.textContent),
                diferenciaTarjeta: parseFloat(diferenciaTarjetaDisplay.textContent),
                diferenciaMotorista: parseFloat(diferenciaMotoristaDisplay.textContent),
                diferenciaTotal: parseFloat(diferenciaTotalDisplay.textContent)
            },
            datosEncargado: obtenerDatosEncargado(),
            datosSistema: obtenerDatosSistema(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Obtener datos de las cajas
        const cajas = document.querySelectorAll('.caja');
        cajas.forEach(cajaDiv => {
            if (!cajaDiv.classList.contains('disabled')) {
                const cajaId = cajaDiv.getAttribute('data-id');
                const apertura = parseFloat(cajaDiv.querySelector('.apertura').value) || 0;
                const ventaTarjeta = parseFloat(cajaDiv.querySelector('.venta-tarjeta').value) || 0;
                let totalBilletes = 0;
                const denominacionesCaja = {};
                denominaciones.forEach(d => {
                    const input = cajaDiv.querySelector(`input[data-denom="${d}"]`);
                    const cantidad = parseFloat(input.value) || 0;
                    totalBilletes += d * cantidad;
                    denominacionesCaja[`Q${d}`] = cantidad;
                });
                const totalCaja = totalBilletes;
                const ventaCaja = totalCaja - apertura;

                cuadreData.cajas.push({
                    cajaId,
                    apertura,
                    ventaTarjeta,
                    totalBilletes,
                    ventaCaja,
                    denominaciones: denominacionesCaja
                });
            }
        });

        return cuadreData;
    }

    // Función para obtener los gastos
    function obtenerGastos() {
        const gastos = [];
        const gastoRows = document.querySelectorAll('.gasto-row');
        gastoRows.forEach(row => {
            const descripcion = row.querySelector('.descripcion-gasto').value.trim();
            const numeroFactura = row.querySelector('.numero-factura-gasto').value.trim();
            const total = parseFloat(row.querySelector('.total-gasto').value) || 0;
            gastos.push({ descripcion, numeroFactura, total });
        });
        return gastos;
    }

    // Función para obtener Datos Encargado
    function obtenerDatosEncargado() {
        const datos = [];
        const rows = datosEncargadoTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const caja = row.querySelector('td:first-child').textContent;
            const cuentaEfectivo = parseFloat(row.querySelector('.datos-encargado-cuenta-efectivo').textContent) || 0;
            const ventaTarjeta = parseFloat(row.querySelector('.datos-encargado-venta-tarjeta').textContent) || 0;
            const ventaMotorista = parseFloat(row.querySelector('.datos-encargado-venta-motorista').textContent) || 0;
            datos.push({ caja, cuentaEfectivo, ventaTarjeta, ventaMotorista });
        });
        return datos;
    }

    // Función para obtener Datos Sistema
    function obtenerDatosSistema() {
        const datos = [];
        const rows = datosSistemaTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const caja = row.querySelector('td:first-child').textContent;
            const cuentaEfectivo = parseFloat(row.querySelector('.datos-sistema-cuenta-efectivo').value) || 0;
            const ventaTarjeta = parseFloat(row.querySelector('.datos-sistema-venta-tarjeta').value) || 0;
            const ventaMotorista = parseFloat(row.querySelector('.datos-sistema-venta-motorista').value) || 0;
            datos.push({ caja, cuentaEfectivo, ventaTarjeta, ventaMotorista });
        });
        return datos;
    }

    // Función para guardar el cuadre en Firebase
    function guardarCuadreEnFirebase(cuadreData) {
        db.collection('cuadres').add(cuadreData)
            .then((docRef) => {
                // Actualizar el último ID de cuadre para la sucursal
                actualizarUltimoIdCuadre(sucursal, idCuadreActual);

                Swal.fire({
                    icon: 'success',
                    title: 'Cuadre Guardado',
                    text: 'El cuadre ha sido guardado correctamente en la base de datos.',
                }).then(() => {
                    // Resetear el formulario después de guardar
                    infoForm.reset();
                    // Establecer el próximo ID Cuadre
                    obtenerUltimoIdCuadre(sucursal);
                    // Actualizar totales globales para reflejar el reset
                    actualizarTotalesGlobales();
                    // Limpiar datos almacenados en el formulario
                    limpiarFormulario();
                });
            })
            .catch((error) => {
                console.error('Error al guardar el cuadre en Firebase: ', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al guardar el cuadre. Por favor, intenta de nuevo.',
                });
            });
    }

    // Función para limpiar el formulario después de guardar
    function limpiarFormulario() {
        // Limpiar inputs de las cajas
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'number' || input.type === 'text') {
                input.value = '';
            }
        });

        // Limpiar subtotales y totales
        const subtotales = document.querySelectorAll('.subtotal');
        subtotales.forEach(span => {
            span.textContent = 'Q0.00';
        });

        const totalCajas = document.querySelectorAll('.total-caja');
        totalCajas.forEach(span => {
            span.textContent = '0.00';
        });

        const ventaCajas = document.querySelectorAll('.venta-caja');
        ventaCajas.forEach(span => {
            span.textContent = '0.00';
        });

        // Limpiar tabla de gastos
        gastosTable.innerHTML = '';
        agregarGasto(); // Agregar una fila de gasto vacía

        // Limpiar Datos Encargado
        const cuentaEfectivoCells = datosEncargadoTable.querySelectorAll('.datos-encargado-cuenta-efectivo');
        cuentaEfectivoCells.forEach(cell => {
            cell.textContent = '0.00';
        });

        const ventaTarjetaCells = datosEncargadoTable.querySelectorAll('.datos-encargado-venta-tarjeta');
        ventaTarjetaCells.forEach(cell => {
            cell.textContent = '0.00';
        });

        const ventaMotoristaCells = datosEncargadoTable.querySelectorAll('.datos-encargado-venta-motorista');
        ventaMotoristaCells.forEach(cell => {
            cell.textContent = '0.00';
        });

        // Limpiar Datos Sistema
        const datosSistemaInputs = datosSistemaTable.querySelectorAll('input');
        datosSistemaInputs.forEach(input => {
            input.value = '';
        });

        // Actualizar totales
        actualizarTotalesDatosEncargado();
        actualizarTotalesDatosSistema();
        actualizarControlAdministrativo();
    }

    // Función para actualizar los totales de Datos Encargado
    function actualizarTotalesDatosEncargado() {
        let totalCuentaEfectivo = 0;
        let totalVentaTarjeta = 0;
        let totalVentaMotorista = 0;

        const cuentaEfectivoCells = datosEncargadoTable.querySelectorAll('.datos-encargado-cuenta-efectivo');
        cuentaEfectivoCells.forEach(cell => {
            totalCuentaEfectivo += parseFloat(cell.textContent) || 0;
        });

        const ventaTarjetaCells = datosEncargadoTable.querySelectorAll('.datos-encargado-venta-tarjeta');
        ventaTarjetaCells.forEach(cell => {
            totalVentaTarjeta += parseFloat(cell.textContent) || 0;
        });

        const ventaMotoristaCells = datosEncargadoTable.querySelectorAll('.datos-encargado-venta-motorista');
        ventaMotoristaCells.forEach(cell => {
            totalVentaMotorista += parseFloat(cell.textContent) || 0;
        });

        totalCuentaEfectivoDisplay.textContent = totalCuentaEfectivo.toFixed(2);
        totalVentaTarjetaDisplay.textContent = totalVentaTarjeta.toFixed(2);
        totalVentaMotoristaDisplay.textContent = totalVentaMotorista.toFixed(2);

        actualizarControlAdministrativo();
    }

    // Función para actualizar totales en Datos Sistema
    function actualizarTotalesDatosSistema() {
        let totalCuentaEfectivo = 0;
        let totalVentaTarjeta = 0;
        let totalVentaMotorista = 0;

        const cuentaEfectivoInputs = datosSistemaTable.querySelectorAll('.datos-sistema-cuenta-efectivo');
        cuentaEfectivoInputs.forEach(input => {
            totalCuentaEfectivo += parseFloat(input.value) || 0;
        });

        const ventaTarjetaInputs = datosSistemaTable.querySelectorAll('.datos-sistema-venta-tarjeta');
        ventaTarjetaInputs.forEach(input => {
            totalVentaTarjeta += parseFloat(input.value) || 0;
        });

        const ventaMotoristaInputs = datosSistemaTable.querySelectorAll('.datos-sistema-venta-motorista');
        ventaMotoristaInputs.forEach(input => {
            totalVentaMotorista += parseFloat(input.value) || 0;
        });

        totalSistemaCuentaEfectivoDisplay.textContent = totalCuentaEfectivo.toFixed(2);
        totalSistemaVentaTarjetaDisplay.textContent = totalVentaTarjeta.toFixed(2);
        totalSistemaVentaMotoristaDisplay.textContent = totalVentaMotorista.toFixed(2);

        actualizarControlAdministrativo();
    }

    // Eventos para los inputs en Datos Sistema
    datosSistemaTable.addEventListener('input', (e) => {
        if (
            e.target.classList.contains('datos-sistema-cuenta-efectivo') ||
            e.target.classList.contains('datos-sistema-venta-tarjeta') ||
            e.target.classList.contains('datos-sistema-venta-motorista')
        ) {
            actualizarTotalesDatosSistema();
        }
    });

    // Función para actualizar el Control Administrativo
    function actualizarControlAdministrativo() {
        const totalEncargadoEfectivo = parseFloat(totalCuentaEfectivoDisplay.textContent) || 0;
        const totalSistemaEfectivo = parseFloat(totalSistemaCuentaEfectivoDisplay.textContent) || 0;
        const diferenciaEfectivo = totalEncargadoEfectivo - totalSistemaEfectivo;
        diferenciaEfectivoDisplay.textContent = diferenciaEfectivo.toFixed(2);

        const totalEncargadoTarjeta = parseFloat(totalVentaTarjetaDisplay.textContent) || 0;
        const totalSistemaTarjeta = parseFloat(totalSistemaVentaTarjetaDisplay.textContent) || 0;
        const diferenciaTarjeta = totalEncargadoTarjeta - totalSistemaTarjeta;
        diferenciaTarjetaDisplay.textContent = diferenciaTarjeta.toFixed(2);

        const totalEncargadoMotorista = parseFloat(totalVentaMotoristaDisplay.textContent) || 0;
        const totalSistemaMotorista = parseFloat(totalSistemaVentaMotoristaDisplay.textContent) || 0;
        const diferenciaMotorista = totalEncargadoMotorista - totalSistemaMotorista;
        diferenciaMotoristaDisplay.textContent = diferenciaMotorista.toFixed(2);

        const diferenciaTotal = diferenciaEfectivo + diferenciaTarjeta + diferenciaMotorista;
        diferenciaTotalDisplay.textContent = diferenciaTotal.toFixed(2);
    }
}
