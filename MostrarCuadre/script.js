// script.js para MostrarCuadre.html

// **Eliminada la re-declaración de 'db'** ya que se asume que 'db.js' lo declara.
// const db = firebase.firestore(); // Esta línea ha sido eliminada.

// Selección de Elementos del DOM
const listaCuadres = document.getElementById('lista-cuadres');
const detalleCuadre = document.getElementById('detalle-cuadre');
const detalleForm = document.getElementById('detalle-form');
const guardarDetalleBtn = document.getElementById('guardar-detalle-btn');
const cancelarDetalleBtn = document.getElementById('cancelar-detalle-btn');
const detalleCajasContainer = document.getElementById('detalle-cajas-container');
const detalleGastosTable = document.getElementById('detalle-gastos-table').getElementsByTagName('tbody')[0];
const detalleAgregarGastoBtn = document.getElementById('detalle-agregar-gasto-btn');
const detalleDatosEncargadoTable = document.getElementById('detalle-datos-encargado-table').getElementsByTagName('tbody')[0];
const detalleTotalCuentaEfectivo = document.getElementById('detalle-total-cuenta-efectivo');
const detalleTotalVentaTarjeta = document.getElementById('detalle-total-venta-tarjeta');
const detalleTotalVentaMotorista = document.getElementById('detalle-total-venta-motorista');
const detalleDatosSistemaTable = document.getElementById('detalle-datos-sistema-table').getElementsByTagName('tbody')[0];
const detalleTotalSistemaCuentaEfectivo = document.getElementById('detalle-total-sistema-cuenta-efectivo');
const detalleTotalSistemaVentaTarjeta = document.getElementById('detalle-total-sistema-venta-tarjeta');
const detalleTotalSistemaVentaMotorista = document.getElementById('detalle-total-sistema-venta-motorista');
const detalleVentaEfectivoCajas = document.getElementById('detalle-venta-efectivo-cajas');
const detalleVentaTarjetaTotal = document.getElementById('detalle-venta-tarjeta-total');
const detalleVentaMotoristaTotal = document.getElementById('detalle-venta-motorista-total');
const detalleVentaPedidosYaTotal = document.getElementById('detalle-venta-pedidos-ya-total');
const detalleTotalVentas = document.getElementById('detalle-total-ventas');
const detalleVentaEfectivo = document.getElementById('detalle-venta-efectivo');
const detalleTotalDepositar = document.getElementById('detalle-total-depositar');
const detalleSobranteAyer = document.getElementById('detalle-sobrante-ayer');
const detalleVentaTotalGastos = document.getElementById('detalle-venta-total-gastos');
const detalleDiferenciaEfectivo = document.getElementById('detalle-diferencia-efectivo');
const detalleDiferenciaTarjeta = document.getElementById('detalle-diferencia-tarjeta');
const detalleDiferenciaMotorista = document.getElementById('detalle-diferencia-motorista');
const detalleDiferenciaTotal = document.getElementById('detalle-diferencia-total');

// Denominaciones de Billetes
const denominaciones = [200, 100, 50, 20, 10, 5, 1];

/**
 * Función para crear una tarjeta de cuadre.
 * @param {Object} cuadre - Datos del cuadre.
 */
function crearTarjetaCuadre(cuadre) {
    // Depuración: Inspeccionar el objeto cuadre
    console.log("Datos del cuadre recibido:", cuadre);

    // Verificar que 'totalDepositar' exista y sea un número
    let totalDepositar = 0;
    if (cuadre.totalDepositar !== undefined && typeof cuadre.totalDepositar === 'number') {
        totalDepositar = cuadre.totalDepositar;
    } else {
        console.warn(`El campo 'totalDepositar' está ausente o no es un número en el cuadre ID: ${cuadre.idCuadre}`);
        // Opcional: Asignar un valor predeterminado o saltar la creación de la tarjeta
        // totalDepositar = 0; // Ya está establecido por defecto
    }

    // Verificar otros campos esenciales
    const idCuadre = cuadre.idCuadre !== undefined ? cuadre.idCuadre : "N/A";
    const sucursal = cuadre.sucursal !== undefined ? cuadre.sucursal : "N/A";
    const fecha = cuadre.fecha !== undefined ? cuadre.fecha : "N/A";

    // Evitar errores al usar 'toFixed' en un valor que no es número
    const totalDepositarFormateado = typeof totalDepositar === 'number' ? totalDepositar.toFixed(2) : "0.00";

    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta-cuadre');

    tarjeta.innerHTML = `
        <h3>Cuadre ID: ${idCuadre}</h3>
        <p><strong>Sucursal:</strong> ${sucursal}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Total a Depositar:</strong> Q${totalDepositarFormateado}</p>
        <button class="abrir-btn" data-id="${cuadre.id}">Abrir</button>
    `;

    // Evento para el botón "Abrir"
    const abrirBtn = tarjeta.querySelector('.abrir-btn');
    abrirBtn.addEventListener('click', () => {
        abrirCuadre(cuadre.id);
    });

    listaCuadres.appendChild(tarjeta);
}

/**
 * Función para listar todos los cuadres.
 */
function listarCuadres() {
    db.collection('cuadres').orderBy('fecha', 'desc').get()
        .then((querySnapshot) => {
            listaCuadres.innerHTML = ''; // Limpiar la lista antes de agregar
            querySnapshot.forEach((doc) => {
                const cuadre = doc.data();
                cuadre.id = doc.id; // Agregar el ID del documento
                crearTarjetaCuadre(cuadre);
            });
        })
        .catch((error) => {
            console.error("Error al listar cuadres: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar la lista de cuadres.',
            });
        });
}

/**
 * Función para abrir y mostrar los detalles de un cuadre.
 * @param {string} cuadreId - ID del documento Firestore.
 */
function abrirCuadre(cuadreId) {
    db.collection('cuadres').doc(cuadreId).get()
        .then((doc) => {
            if (doc.exists) {
                const cuadreData = doc.data();
                mostrarDetalleCuadre(cuadreData);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Cuadre no encontrado',
                    text: 'El cuadre seleccionado no existe.',
                });
            }
        })
        .catch((error) => {
            console.error("Error al obtener el cuadre: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar el cuadre.',
            });
        });
}

/**
 * Función para mostrar los detalles del cuadre en el formulario.
 * @param {Object} cuadre - Datos del cuadre.
 */
function mostrarDetalleCuadre(cuadre) {
    // Mostrar la sección de detalle y ocultar la lista
    detalleCuadre.style.display = 'block';
    listaCuadres.style.display = 'none';

    // Rellenar los campos del formulario con los datos del cuadre
    document.getElementById('detalle-sucursal').value = cuadre.sucursal || "";
    document.getElementById('detalle-fecha').value = cuadre.fecha || "";
    document.getElementById('detalle-caja-chica-inicial').value = cuadre.cajaChicaInicial || 0;
    document.getElementById('detalle-id-cuadre').textContent = cuadre.idCuadre || "N/A";

    // Rellenar Ventas
    document.getElementById('detalle-venta-motorista').value = cuadre.ventas?.ventaMotorista || 0;
    document.getElementById('detalle-venta-pedidos-ya').value = cuadre.ventas?.pedidosYa || 0;

    // Rellenar Cajas
    detalleCajasContainer.innerHTML = ''; // Limpiar las cajas existentes
    if (cuadre.cajas && Array.isArray(cuadre.cajas)) {
        cuadre.cajas.forEach((caja, index) => {
            crearCajaDetalle(caja, index + 1);
        });
    } else {
        console.warn("No hay cajas definidas para este cuadre.");
    }

    // Rellenar Gastos
    detalleGastosTable.innerHTML = ''; // Limpiar gastos existentes
    if (cuadre.gastos && Array.isArray(cuadre.gastos)) {
        cuadre.gastos.forEach((gasto) => {
            agregarGastoDetalle(gasto);
        });
    } else {
        console.warn("No hay gastos definidos para este cuadre.");
    }

    // Rellenar Datos Encargado
    detalleDatosEncargadoTable.innerHTML = ''; // Limpiar datos existentes
    if (cuadre.datosEncargado && Array.isArray(cuadre.datosEncargado)) {
        cuadre.datosEncargado.forEach((encargado) => {
            crearFilaDatosEncargadoDetalle(encargado);
        });
    } else {
        console.warn("No hay datos de encargado definidos para este cuadre.");
    }

    // Rellenar Datos Sistema
    detalleDatosSistemaTable.innerHTML = ''; // Limpiar datos existentes
    if (cuadre.datosSistema && Array.isArray(cuadre.datosSistema)) {
        cuadre.datosSistema.forEach((sistema) => {
            crearFilaDatosSistemaDetalle(sistema);
        });
    } else {
        console.warn("No hay datos de sistema definidos para este cuadre.");
    }

    // Rellenar Totales
    detalleVentaEfectivoCajas.textContent = (cuadre.ventas?.ventaEfectivoCajas || 0).toFixed(2);
    detalleVentaTarjetaTotal.textContent = (cuadre.ventas?.ventaTarjetaTotal || 0).toFixed(2);
    detalleVentaMotoristaTotal.textContent = (cuadre.ventas?.ventaMotorista || 0).toFixed(2);
    detalleVentaPedidosYaTotal.textContent = (cuadre.ventas?.pedidosYa || 0).toFixed(2);
    detalleTotalVentas.textContent = (cuadre.ventas?.totalVentas || 0).toFixed(2);
    detalleVentaEfectivo.textContent = ((cuadre.ventas?.ventaEfectivoCajas || 0) + (cuadre.ventas?.ventaMotorista || 0)).toFixed(2);
    detalleTotalDepositar.textContent = (cuadre.totalDepositar || 0).toFixed(2);
    detalleSobranteAyer.value = cuadre.sobranteAyer || 0;

    // Rellenar Gastos Totales
    detalleVentaTotalGastos.textContent = (cuadre.gastos?.reduce((sum, gasto) => sum + (gasto.total || 0), 0) || 0).toFixed(2);

    // Rellenar Control Administrativo
    detalleDiferenciaEfectivo.textContent = (cuadre.controlAdministrativo?.diferenciaEfectivo || 0).toFixed(2);
    detalleDiferenciaTarjeta.textContent = (cuadre.controlAdministrativo?.diferenciaTarjeta || 0).toFixed(2);
    detalleDiferenciaMotorista.textContent = (cuadre.controlAdministrativo?.diferenciaMotorista || 0).toFixed(2);
    detalleDiferenciaTotal.textContent = (cuadre.controlAdministrativo?.diferenciaTotal || 0).toFixed(2);
}

/**
 * Función para crear una caja en el formulario de detalle.
 * @param {Object} caja - Datos de la caja.
 * @param {number} numero - Número de la caja.
 */
function crearCajaDetalle(caja, numero) {
    const cajaDiv = document.createElement('div');
    cajaDiv.classList.add('caja');
    cajaDiv.setAttribute('data-id', numero);

    let denominacionHTML = '';
    denominaciones.forEach(d => {
        denominacionHTML += `
            <div class="denomination">
                <label for="detalle-caja-${numero}-denom-${d}">Q${d}:</label>
                <input type="number" id="detalle-caja-${numero}-denom-${d}" min="0" step="1" data-denom="${d}" value="${caja.denominaciones['Q' + d] || 0}">
                <span class="subtotal">Q${(d * (caja.denominaciones['Q' + d] || 0)).toFixed(2)}</span>
            </div>
        `;
    });

    cajaDiv.innerHTML = `
        <h4>Caja #${numero}</h4>
        <div class="input-group">
            <label for="detalle-caja-${numero}-apertura">Apertura (Q):</label>
            <input type="number" id="detalle-caja-${numero}-apertura" class="apertura" min="0" step="0.01" value="${caja.apertura || 0}">
        </div>
        <div class="input-group">
            <label for="detalle-caja-${numero}-venta-tarjeta">Venta Tarjeta (Q):</label>
            <input type="number" id="detalle-caja-${numero}-venta-tarjeta" class="venta-tarjeta" min="0" step="0.01" value="${caja.ventaTarjeta || 0}">
        </div>
        ${denominacionHTML}
        <div class="totales-caja">
            <p>Total Billetes: Q<span class="total-caja" data-total="0">0.00</span></p>
            <p>Venta Caja: Q<span class="venta-caja">0.00</span></p>
        </div>
    `;

    detalleCajasContainer.appendChild(cajaDiv);

    // Eventos para calcular subtotales y totales de la caja
    const aperturaInput = cajaDiv.querySelector('.apertura');
    const ventaTarjetaInput = cajaDiv.querySelector('.venta-tarjeta');
    const denominacionInputs = cajaDiv.querySelectorAll('.denomination input');

    aperturaInput.addEventListener('input', () => {
        calcularTotalesCajaDetalle(cajaDiv);
    });

    ventaTarjetaInput.addEventListener('input', () => {
        calcularTotalesCajaDetalle(cajaDiv);
        actualizarTotalesDetalle();
    });

    denominacionInputs.forEach(input => {
        input.addEventListener('input', () => {
            const d = parseInt(input.getAttribute('data-denom'));
            const cantidad = parseInt(input.value) || 0;
            const subtotalSpan = input.nextElementSibling;
            subtotalSpan.textContent = `Q${(d * cantidad).toFixed(2)}`;
            calcularTotalesCajaDetalle(cajaDiv);
            actualizarTotalesDetalle();
        });
    });

    // Calcular totales de la caja inicialmente
    calcularTotalesCajaDetalle(cajaDiv);
}

/**
 * Función para calcular totales de una caja en detalle.
 * @param {HTMLElement} cajaDiv - Elemento div de la caja.
 */
function calcularTotalesCajaDetalle(cajaDiv) {
    const apertura = parseFloat(cajaDiv.querySelector('.apertura').value) || 0;
    let totalBilletes = 0;
    denominaciones.forEach(d => {
        const input = cajaDiv.querySelector(`input[data-denom="${d}"]`);
        const cantidad = parseInt(input.value) || 0;
        totalBilletes += d * cantidad;
    });
    const ventaCaja = totalBilletes - apertura;

    cajaDiv.querySelector('.total-caja').textContent = totalBilletes.toFixed(2);
    cajaDiv.querySelector('.venta-caja').textContent = ventaCaja.toFixed(2);
}

/**
 * Función para agregar una fila de gasto en detalle.
 * @param {Object} gasto - Datos del gasto (opcional).
 */
function agregarGastoDetalle(gasto = { descripcion: '', numeroFactura: '', total: 0 }) {
    const newRow = detalleGastosTable.insertRow();

    newRow.innerHTML = `
        <td><input type="text" class="descripcion-gasto-detalle" value="${gasto.descripcion}" required></td>
        <td><input type="text" class="numero-factura-gasto-detalle" value="${gasto.numeroFactura}" required></td>
        <td><input type="number" class="total-gasto-detalle" min="0" step="0.01" value="${gasto.total}" required></td>
    `;

    // Evento para recalcular gastos al cambiar el total
    const totalInput = newRow.querySelector('.total-gasto-detalle');
    totalInput.addEventListener('input', () => {
        calcularTotalGastosDetalle();
    });

    // Validaciones para los campos
    const descripcionInput = newRow.querySelector('.descripcion-gasto-detalle');
    const facturaInput = newRow.querySelector('.numero-factura-gasto-detalle');

    descripcionInput.addEventListener('input', () => {
        validarTexto(descripcionInput);
    });

    facturaInput.addEventListener('input', () => {
        validarTexto(facturaInput);
    });
}

/**
 * Función para calcular el total de gastos en detalle.
 */
function calcularTotalGastosDetalle() {
    let sumaGastos = 0;
    const totalGastoInputs = document.querySelectorAll('.total-gasto-detalle');
    totalGastoInputs.forEach(input => {
        const valor = parseFloat(input.value) || 0;
        sumaGastos += valor;
    });
    detalleVentaTotalGastos.textContent = sumaGastos.toFixed(2);
    actualizarTotalesDetalle();
}

/**
 * Función para crear una fila de Datos Encargado en detalle.
 * @param {Object} encargado - Datos del encargado.
 */
function crearFilaDatosEncargadoDetalle(encargado) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${encargado.caja || "N/A"}</td>
        <td><input type="number" class="datos-encargado-cuenta-efectivo-detalle" min="0" step="0.01" value="${encargado.cuentaEfectivo || 0}" required></td>
        <td><input type="number" class="datos-encargado-venta-tarjeta-detalle" min="0" step="0.01" value="${encargado.ventaTarjeta || 0}" required></td>
        <td><input type="number" class="datos-encargado-venta-motorista-detalle" min="0" step="0.01" value="${encargado.ventaMotorista || 0}" required></td>
    `;

    detalleDatosEncargadoTable.appendChild(row);

    // Eventos para actualizar totales al cambiar los valores
    const cuentaEfectivoInput = row.querySelector('.datos-encargado-cuenta-efectivo-detalle');
    const ventaTarjetaInput = row.querySelector('.datos-encargado-venta-tarjeta-detalle');
    const ventaMotoristaInput = row.querySelector('.datos-encargado-venta-motorista-detalle');

    cuentaEfectivoInput.addEventListener('input', () => {
        calcularTotalesDatosEncargadoDetalle();
    });

    ventaTarjetaInput.addEventListener('input', () => {
        calcularTotalesDatosEncargadoDetalle();
    });

    ventaMotoristaInput.addEventListener('input', () => {
        calcularTotalesDatosEncargadoDetalle();
    });
}

/**
 * Función para calcular totales de Datos Encargado en detalle.
 */
function calcularTotalesDatosEncargadoDetalle() {
    let totalCuentaEfectivo = 0;
    let totalVentaTarjeta = 0;
    let totalVentaMotorista = 0;

    const cuentaEfectivoInputs = document.querySelectorAll('.datos-encargado-cuenta-efectivo-detalle');
    cuentaEfectivoInputs.forEach(input => {
        totalCuentaEfectivo += parseFloat(input.value) || 0;
    });

    const ventaTarjetaInputs = document.querySelectorAll('.datos-encargado-venta-tarjeta-detalle');
    ventaTarjetaInputs.forEach(input => {
        totalVentaTarjeta += parseFloat(input.value) || 0;
    });

    const ventaMotoristaInputs = document.querySelectorAll('.datos-encargado-venta-motorista-detalle');
    ventaMotoristaInputs.forEach(input => {
        totalVentaMotorista += parseFloat(input.value) || 0;
    });

    detalleTotalCuentaEfectivo.textContent = totalCuentaEfectivo.toFixed(2);
    detalleTotalVentaTarjeta.textContent = totalVentaTarjeta.toFixed(2);
    detalleTotalVentaMotorista.textContent = totalVentaMotorista.toFixed(2);

    actualizarTotalesDetalle();
}

/**
 * Función para crear una fila de Datos Sistema en detalle.
 * @param {Object} sistema - Datos del sistema.
 */
function crearFilaDatosSistemaDetalle(sistema) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${sistema.caja || "N/A"}</td>
        <td><input type="number" class="datos-sistema-cuenta-efectivo-detalle" min="0" step="0.01" value="${sistema.cuentaEfectivo || 0}" required></td>
        <td><input type="number" class="datos-sistema-venta-tarjeta-detalle" min="0" step="0.01" value="${sistema.ventaTarjeta || 0}" required></td>
        <td><input type="number" class="datos-sistema-venta-motorista-detalle" min="0" step="0.01" value="${sistema.ventaMotorista || 0}" required></td>
    `;

    detalleDatosSistemaTable.appendChild(row);

    // Eventos para actualizar totales al cambiar los valores
    const cuentaEfectivoInput = row.querySelector('.datos-sistema-cuenta-efectivo-detalle');
    const ventaTarjetaInput = row.querySelector('.datos-sistema-venta-tarjeta-detalle');
    const ventaMotoristaInput = row.querySelector('.datos-sistema-venta-motorista-detalle');

    cuentaEfectivoInput.addEventListener('input', () => {
        calcularTotalesDatosSistemaDetalle();
    });

    ventaTarjetaInput.addEventListener('input', () => {
        calcularTotalesDatosSistemaDetalle();
    });

    ventaMotoristaInput.addEventListener('input', () => {
        calcularTotalesDatosSistemaDetalle();
    });
}

/**
 * Función para calcular totales de Datos Sistema en detalle.
 */
function calcularTotalesDatosSistemaDetalle() {
    let totalCuentaEfectivo = 0;
    let totalVentaTarjeta = 0;
    let totalVentaMotorista = 0;

    const cuentaEfectivoInputs = document.querySelectorAll('.datos-sistema-cuenta-efectivo-detalle');
    cuentaEfectivoInputs.forEach(input => {
        totalCuentaEfectivo += parseFloat(input.value) || 0;
    });

    const ventaTarjetaInputs = document.querySelectorAll('.datos-sistema-venta-tarjeta-detalle');
    ventaTarjetaInputs.forEach(input => {
        totalVentaTarjeta += parseFloat(input.value) || 0;
    });

    const ventaMotoristaInputs = document.querySelectorAll('.datos-sistema-venta-motorista-detalle');
    ventaMotoristaInputs.forEach(input => {
        totalVentaMotorista += parseFloat(input.value) || 0;
    });

    detalleTotalSistemaCuentaEfectivo.textContent = totalCuentaEfectivo.toFixed(2);
    detalleTotalSistemaVentaTarjeta.textContent = totalVentaTarjeta.toFixed(2);
    detalleTotalSistemaVentaMotorista.textContent = totalVentaMotorista.toFixed(2);

    actualizarTotalesDetalle();
}

/**
 * Función para validar texto (solo letras y números).
 * @param {HTMLElement} input - Campo de entrada a validar.
 */
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

/**
 * Función para marcar un campo como inválido.
 * @param {HTMLElement} input - Campo de entrada a marcar.
 */
function markInvalidField(input) {
    input.classList.add('input-invalid');
}

/**
 * Función para validar que todas las casillas estén llenas correctamente en el formulario de detalle.
 * @returns {boolean} - Retorna true si el formulario es válido, false en caso contrario.
 */
function validarFormularioDetalle() {
    let isValid = true;
    let firstInvalidField = null;

    // Resetear marcas de campos inválidos
    const allInputs = detalleForm.querySelectorAll('input');
    allInputs.forEach(input => {
        input.classList.remove('input-invalid');
    });

    // Validar Información de Cuadre
    const fecha = document.getElementById('detalle-fecha').value.trim();
    const cajaChicaInicial = document.getElementById('detalle-caja-chica-inicial').value.trim();

    if (fecha === '') {
        markInvalidField(document.getElementById('detalle-fecha'));
        isValid = false;
        if (!firstInvalidField) firstInvalidField = document.getElementById('detalle-fecha');
    }

    if (cajaChicaInicial === '' || isNaN(cajaChicaInicial) || parseFloat(cajaChicaInicial) < 0) {
        markInvalidField(document.getElementById('detalle-caja-chica-inicial'));
        isValid = false;
        if (!firstInvalidField) firstInvalidField = document.getElementById('detalle-caja-chica-inicial');
    }

    // Validar Gastos
    const descripcionGastos = document.querySelectorAll('.descripcion-gasto-detalle');
    const numeroFacturaGastos = document.querySelectorAll('.numero-factura-gasto-detalle');
    const totalGastos = document.querySelectorAll('.total-gasto-detalle');

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

    // Validar Datos Encargado
    const datosEncargadoInputs = document.querySelectorAll('.datos-encargado-cuenta-efectivo-detalle, .datos-encargado-venta-tarjeta-detalle, .datos-encargado-venta-motorista-detalle');
    datosEncargadoInputs.forEach(input => {
        if (isNaN(input.value) || parseFloat(input.value) < 0) {
            markInvalidField(input);
            isValid = false;
            if (!firstInvalidField) firstInvalidField = input;
        }
    });

    // Validar Datos Sistema
    const datosSistemaInputs = document.querySelectorAll('.datos-sistema-cuenta-efectivo-detalle, .datos-sistema-venta-tarjeta-detalle, .datos-sistema-venta-motorista-detalle');
    datosSistemaInputs.forEach(input => {
        if (isNaN(input.value) || parseFloat(input.value) < 0) {
            markInvalidField(input);
            isValid = false;
            if (!firstInvalidField) firstInvalidField = input;
        }
    });

    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: 'Campos Incompletos o Inválidos',
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

/**
 * Función para obtener los datos actualizados del formulario de detalle.
 * @returns {Object} - Objeto con los datos del cuadre.
 */
function obtenerDatosFormularioDetalle() {
    const fecha = document.getElementById('detalle-fecha').value;
    const cajaChicaInicial = parseFloat(document.getElementById('detalle-caja-chica-inicial').value) || 0;
    const idCuadre = parseInt(document.getElementById('detalle-id-cuadre').textContent);

    // Obtener Ventas
    const ventaMotorista = parseFloat(document.getElementById('detalle-venta-motorista').value) || 0;
    const ventaPedidosYa = parseFloat(document.getElementById('detalle-venta-pedidos-ya').value) || 0;

    // Calcular Total Ventas
    const ventaEfectivoCajas = parseFloat(detalleVentaEfectivoCajas.textContent) || 0;
    const ventaTarjetaTotal = parseFloat(detalleVentaTarjetaTotal.textContent) || 0;
    const totalVentas = parseFloat(detalleTotalVentas.textContent) || 0;

    // Obtener Sobrante Ayer y Gastos
    const sobranteAyer = parseFloat(detalleSobranteAyer.value) || 0;
    const gastosTotal = parseFloat(detalleVentaTotalGastos.textContent) || 0;

    // Obtener Total a Depositar
    const totalDepositar = parseFloat(detalleTotalDepositar.textContent) || 0;

    // Obtener Control Administrativo
    const diferenciaEfectivo = parseFloat(detalleDiferenciaEfectivo.textContent) || 0;
    const diferenciaTarjeta = parseFloat(detalleDiferenciaTarjeta.textContent) || 0;
    const diferenciaMotorista = parseFloat(detalleDiferenciaMotorista.textContent) || 0;
    const diferenciaTotal = parseFloat(detalleDiferenciaTotal.textContent) || 0;

    // Obtener Cajas
    const cajas = [];
    const cajasDivs = detalleCajasContainer.querySelectorAll('.caja');
    cajasDivs.forEach(cajaDiv => {
        const cajaId = parseInt(cajaDiv.getAttribute('data-id'));
        const apertura = parseFloat(cajaDiv.querySelector('.apertura').value) || 0;
        const ventaTarjeta = parseFloat(cajaDiv.querySelector('.venta-tarjeta').value) || 0;
        const denominacionesCaja = {};

        denominaciones.forEach(d => {
            denominacionesCaja[`Q${d}`] = parseInt(cajaDiv.querySelector(`input[data-denom="${d}"]`).value) || 0;
        });

        cajas.push({
            cajaId,
            apertura,
            ventaTarjeta,
            denominaciones: denominacionesCaja
        });
    });

    // Obtener Gastos
    const gastos = [];
    const gastoRows = detalleGastosTable.querySelectorAll('tr');
    gastoRows.forEach(row => {
        const descripcion = row.querySelector('.descripcion-gasto-detalle').value.trim();
        const numeroFactura = row.querySelector('.numero-factura-gasto-detalle').value.trim();
        const total = parseFloat(row.querySelector('.total-gasto-detalle').value) || 0;
        gastos.push({ descripcion, numeroFactura, total });
    });

    // Obtener Datos Encargado
    const datosEncargado = [];
    const encargadosRows = detalleDatosEncargadoTable.querySelectorAll('tr');
    encargadosRows.forEach(row => {
        const caja = row.querySelector('td:first-child').textContent || "N/A";
        const cuentaEfectivo = parseFloat(row.querySelector('.datos-encargado-cuenta-efectivo-detalle').value) || 0;
        const ventaTarjeta = parseFloat(row.querySelector('.datos-encargado-venta-tarjeta-detalle').value) || 0;
        const ventaMotorista = parseFloat(row.querySelector('.datos-encargado-venta-motorista-detalle').value) || 0;
        datosEncargado.push({ caja, cuentaEfectivo, ventaTarjeta, ventaMotorista });
    });

    // Obtener Datos Sistema
    const datosSistema = [];
    const sistemaRows = detalleDatosSistemaTable.querySelectorAll('tr');
    sistemaRows.forEach(row => {
        const caja = row.querySelector('td:first-child').textContent || "N/A";
        const cuentaEfectivo = parseFloat(row.querySelector('.datos-sistema-cuenta-efectivo-detalle').value) || 0;
        const ventaTarjeta = parseFloat(row.querySelector('.datos-sistema-venta-tarjeta-detalle').value) || 0;
        const ventaMotorista = parseFloat(row.querySelector('.datos-sistema-venta-motorista-detalle').value) || 0;
        datosSistema.push({ caja, cuentaEfectivo, ventaTarjeta, ventaMotorista });
    });

    return {
        fecha,
        cajaChicaInicial,
        ventas: {
            ventaMotorista,
            pedidosYa: ventaPedidosYa,
            ventaEfectivoCajas,
            ventaTarjetaTotal,
            totalVentas
        },
        sobranteAyer,
        ventaEfectivo: ventaEfectivoCajas + ventaMotorista,
        gastos,
        totalDepositar,
        controlAdministrativo: {
            diferenciaEfectivo,
            diferenciaTarjeta,
            diferenciaMotorista,
            diferenciaTotal
        },
        cajas,
        datosEncargado,
        datosSistema
    };
}

/**
 * Función para guardar el cuadre en Firebase.
 * @param {Object} cuadreData - Datos actualizados del cuadre.
 */
function guardarCuadreEnFirebase(cuadreData) {
    const cuadreId = parseInt(document.getElementById('detalle-id-cuadre').textContent);

    // Buscar el documento con el ID Cuadre correspondiente
    db.collection('cuadres').where('idCuadre', '==', cuadreId).get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                // Actualizar el documento con los datos actualizados
                doc.ref.update(cuadreData)
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: 'El cuadre ha sido actualizado correctamente.',
                        }).then(() => {
                            // Ocultar la sección de detalle y volver a listar los cuadres
                            detalleCuadre.style.display = 'none';
                            listaCuadres.style.display = 'flex';
                            listarCuadres();
                        });
                    })
                    .catch((error) => {
                        console.error("Error al actualizar el cuadre: ", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al actualizar el cuadre.',
                        });
                    });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Cuadre no encontrado',
                    text: 'No se encontró el cuadre para actualizar.',
                });
            }
        })
        .catch((error) => {
            console.error("Error al buscar el cuadre: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al buscar el cuadre para actualizar.',
            });
        });
}

/**
 * Función para validar y guardar los cambios en el cuadre.
 */
function guardarCambiosCuadre() {
    // Validar el formulario antes de guardar
    if (validarFormularioDetalle()) {
        // Obtener los datos actualizados del formulario
        const datosActualizados = obtenerDatosFormularioDetalle();

        // Guardar los cambios en Firebase
        guardarCuadreEnFirebase(datosActualizados);
    }
}

/**
 * Función para cancelar la edición y volver al listado.
 */
function cancelarEdicion() {
    detalleCuadre.style.display = 'none';
    listaCuadres.style.display = 'flex';
}

// Eventos de Botones
guardarDetalleBtn.addEventListener('click', guardarCambiosCuadre);
cancelarDetalleBtn.addEventListener('click', cancelarEdicion);
detalleAgregarGastoBtn.addEventListener('click', () => {
    agregarGastoDetalle();
});

/**
 * Función para calcular todos los totales en detalle.
 */
function actualizarTotalesDetalle() {
    // Calcular Venta Efectivo
    const ventaEfectivo = parseFloat(detalleVentaEfectivoCajas.textContent) || 0;
    const ventaMotorista = parseFloat(detalleVentaMotoristaTotal.textContent) || 0;
    const ventaEfectivoTotal = ventaEfectivo + ventaMotorista;
    detalleVentaEfectivo.textContent = ventaEfectivoTotal.toFixed(2);

    // Calcular Total Ventas
    const ventaTarjetaTotal = parseFloat(detalleVentaTarjetaTotal.textContent) || 0;
    const ventaPedidosYaTotal = parseFloat(detalleVentaPedidosYaTotal.textContent) || 0;
    const totalVentas = ventaEfectivoTotal + ventaTarjetaTotal + ventaPedidosYaTotal;
    detalleTotalVentas.textContent = totalVentas.toFixed(2);

    // Calcular Total a Depositar
    const sobranteAyer = parseFloat(detalleSobranteAyer.value) || 0;
    const gastosTotal = parseFloat(detalleVentaTotalGastos.textContent) || 0;
    const totalDepositar = ventaEfectivoTotal + sobranteAyer - gastosTotal;
    detalleTotalDepositar.textContent = totalDepositar.toFixed(2);

    // Calcular Diferencias (Control Administrativo)
    const totalEncargadoEfectivo = parseFloat(detalleTotalCuentaEfectivo.textContent) || 0;
    const totalSistemaEfectivo = parseFloat(detalleTotalSistemaCuentaEfectivo.textContent) || 0;
    const diferenciaEfectivo = totalEncargadoEfectivo - totalSistemaEfectivo;
    detalleDiferenciaEfectivo.textContent = diferenciaEfectivo.toFixed(2);

    const totalEncargadoTarjeta = parseFloat(detalleTotalVentaTarjeta.textContent) || 0;
    const totalSistemaTarjeta = parseFloat(detalleTotalSistemaVentaTarjeta.textContent) || 0;
    const diferenciaTarjeta = totalEncargadoTarjeta - totalSistemaTarjeta;
    detalleDiferenciaTarjeta.textContent = diferenciaTarjeta.toFixed(2);

    const totalEncargadoMotorista = parseFloat(detalleTotalVentaMotorista.textContent) || 0;
    const totalSistemaMotorista = parseFloat(detalleTotalSistemaVentaMotorista.textContent) || 0;
    const diferenciaMotorista = totalEncargadoMotorista - totalSistemaMotorista;
    detalleDiferenciaMotorista.textContent = diferenciaMotorista.toFixed(2);

    const diferenciaTotal = diferenciaEfectivo + diferenciaTarjeta + diferenciaMotorista;
    detalleDiferenciaTotal.textContent = diferenciaTotal.toFixed(2);
}

// Listar todos los cuadres al cargar la página
document.addEventListener('DOMContentLoaded', listarCuadres);
