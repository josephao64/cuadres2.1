// Variables para las Cajas
const cajasContainer = document.getElementById('cajas-container');
const ventaEfectivoCajasDisplay = document.getElementById('venta-efectivo-cajas');

// Variables para los Gastos
const gastosTable = document.getElementById('gastos-table').getElementsByTagName('tbody')[0];
const agregarGastoBtn = document.getElementById('agregar-gasto-btn');
const totalGastosDisplay = document.getElementById('venta-total-gastos');

// Variables para Ventas
const ventaTarjetaInput = document.getElementById('venta-tarjeta');
const ventaMotoristaInput = document.getElementById('venta-motorista');
const ventaPedidosYaInput = document.getElementById('venta-pedidos-ya');

// Totales
const totalVentasDisplay = document.getElementById('total-ventas');
const sobranteAyerInput = document.getElementById('sobrante-ayer');
const ventaEfectivoDisplay = document.getElementById('venta-efectivo');
const totalDepositarDisplay = document.getElementById('total-depositar');

// ID Cuadre
const idCuadreText = document.getElementById('id-cuadre-text');

// Variables para Totales
const totalesGlobales = document.getElementById('totales-globales');

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

// Función para obtener el próximo ID Cuadre
function obtenerProximoIdCuadre() {
    let ultimoId = localStorage.getItem('ultimoIdCuadre');
    if (ultimoId) {
        return parseInt(ultimoId) + 1;
    } else {
        return 1; // Inicio desde 1 si no existe ningún ID previo
    }
}

// Función para establecer el ID Cuadre en el texto
function establecerIdCuadre() {
    const proximoId = obtenerProximoIdCuadre();
    idCuadreText.textContent = proximoId;
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    establecerIdCuadre();
    actualizarTotalesGlobales();
});

// Función para actualizar el último ID Cuadre en localStorage
function actualizarUltimoIdCuadre() {
    const idCuadre = idCuadreText.textContent;
    localStorage.setItem('ultimoIdCuadre', idCuadre);
}

// Función para actualizar los totales globales
function actualizarTotalesGlobales() {
    let ventaEfectivoCajas = 0;
    let ventaTarjeta = parseFloat(ventaTarjetaInput.value) || 0;
    let ventaMotorista = parseFloat(ventaMotoristaInput.value) || 0;
    let pedidosYa = parseFloat(ventaPedidosYaInput.value) || 0;
    let sobranteAyer = parseFloat(sobranteAyerInput.value) || 0;
    let sumaGastos = parseFloat(totalGastosDisplay.textContent) || 0;

    // Calcular Venta Efectivo Cajas: Total Billetes - Aperturas
    const cajas = document.querySelectorAll('.caja');
    cajas.forEach(caja => {
        if (!caja.classList.contains('disabled')) {
            let totalBilletes = 0;
            let apertura = parseFloat(caja.querySelector('.apertura').value) || 0;
            denominaciones.forEach(d => {
                const input = caja.querySelector(`input[data-denom="${d}"]`);
                const cantidad = parseFloat(input.value) || 0;
                totalBilletes += d * cantidad;
            });
            ventaEfectivoCajas += (totalBilletes - apertura);
        }
    });

    // Calcular Total Ventas
    let totalVentas = ventaEfectivoCajas + ventaTarjeta + ventaMotorista + pedidosYa;

    // Calcular Venta Efectivo
    let ventaEfectivo = ventaEfectivoCajas + ventaMotorista;

    // Calcular Total a Depositar
    let totalDepositar = ventaEfectivo + sobranteAyer - sumaGastos;

    // Actualizar displays
    ventaEfectivoCajasDisplay.textContent = ventaEfectivoCajas.toFixed(2);
    document.getElementById('venta-tarjeta-total').textContent = ventaTarjeta.toFixed(2);
    document.getElementById('venta-motorista-total').textContent = ventaMotorista.toFixed(2);
    document.getElementById('venta-pedidos-ya-total').textContent = pedidosYa.toFixed(2);
    totalVentasDisplay.textContent = totalVentas.toFixed(2);
    ventaEfectivoDisplay.textContent = ventaEfectivo.toFixed(2);
    totalDepositarDisplay.textContent = totalDepositar.toFixed(2);
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
                <input type="number" id="caja-${id}-denom-${d}" min="0" step="0.01" value="" data-denom="${d}">
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
            <input type="number" id="caja-${id}-apertura" class="apertura" min="0" step="0.01" value="">
        </div>
        ${denominacionHTML}
        <div class="totales-caja">
            <p>Total: Q<span class="total-caja" data-total="0">0.00</span></p>
            <p>Venta: Q<span class="venta-caja">0.00</span></p>
        </div>
    `;

    cajasContainer.appendChild(cajaDiv);

    // Añadir eventos a los inputs de billetes y apertura
    const aperturaInput = cajaDiv.querySelector('.apertura');
    aperturaInput.addEventListener('input', () => {
        calcularTotalesCaja(cajaDiv);
    });

    denominaciones.forEach(d => {
        const input = cajaDiv.querySelector(`input[data-denom="${d}"]`);
        const subtotalSpan = cajaDiv.querySelector(`input[data-denom="${d}"] + .subtotal`);
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
    const ventaEfectivoCajas = totalCajaBilletes - apertura;

    // Actualizar el display de Total y Venta en la caja individual
    cajaDiv.querySelector('.total-caja').textContent = totalCajaBilletes.toFixed(2);
    cajaDiv.querySelector('.venta-caja').textContent = ventaEfectivoCajas.toFixed(2);

    // Actualizar el display de Venta Efectivo Cajas (global)
    ventaEfectivoCajasDisplay.textContent = ventaEfectivoCajas.toFixed(2);

    // Recalcular Total Ventas y Total a Depositar
    actualizarTotalesGlobales();
}

// Función para deshabilitar una caja
function deshabilitarCaja(cajaDiv, disableBtn, enableBtn) {
    // Validar si hay datos ingresados antes de deshabilitar
    const apertura = cajaDiv.querySelector('.apertura').value;
    const billetes = cajaDiv.querySelectorAll('.denomination input');
    let hasData = false;

    if (apertura.trim() !== '') {
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

                // Actualizar Venta Efectivo Cajas y Venta Efectivo
                ventaEfectivoCajasDisplay.textContent = '0.00';
                ventaEfectivoDisplay.textContent = '0.00';

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
    const aperturaInput = cajaDiv.querySelector('.apertura');
    aperturaInput.disabled = false;
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
    totalInput.value = '0.00';
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
            establecerIdCuadre();
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
                       Ingresa el monto total de ventas realizadas mediante tarjeta.<br><br>
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
            targetInput.value = '0.00';
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
ventaTarjetaInput.addEventListener('input', actualizarTotalesGlobales);
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
    const sucursal = document.getElementById('sucursal').value.trim();
    const fecha = document.getElementById('fecha').value.trim();
    const cajaChicaInicial = document.getElementById('caja-chica-inicial').value.trim();

    if (sucursal === '') {
        markInvalidField(document.getElementById('sucursal'));
        isValid = false;
        if (!firstInvalidField) firstInvalidField = document.getElementById('sucursal');
    }

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

    // Validar Ventas
    if (isNaN(ventaTarjetaInput.value) || parseFloat(ventaTarjetaInput.value) < 0) {
        markInvalidField(ventaTarjetaInput);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = ventaTarjetaInput;
    }

    if (!ventaMotoristaInput.disabled) {
        if (isNaN(ventaMotoristaInput.value) || parseFloat(ventaMotoristaInput.value) < 0) {
            markInvalidField(ventaMotoristaInput);
            isValid = false;
            if (!firstInvalidField) firstInvalidField = ventaMotoristaInput;
        }
    }

    if (!ventaPedidosYaInput.disabled) {
        if (isNaN(ventaPedidosYaInput.value) || parseFloat(ventaPedidosYaInput.value) < 0) {
            markInvalidField(ventaPedidosYaInput);
            isValid = false;
            if (!firstInvalidField) firstInvalidField = ventaPedidosYaInput;
        }
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

// Función para exportar una sección como imagen
function exportarSeccion(seccionId, nombreArchivo) {
    const seccion = document.getElementById(seccionId);
    html2canvas(seccion).then(canvas => {
        const link = document.createElement('a');
        link.download = `${nombreArchivo}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Evento para el botón "Guardar Cuadre"
guardarCuadreBtn.addEventListener('click', () => {
    if (validarFormulario()) {
        Swal.fire({
            title: 'Exportar Cuadre',
            text: "¿Qué deseas exportar?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Exportar Cuadre Completo',
            cancelButtonText: 'Exportar Totales'
        }).then((result) => {
            if (result.isConfirmed) {
                exportarSeccion('sections-container', 'Cuadre_Completo');
                Swal.fire(
                    'Exportado',
                    'El cuadre completo ha sido exportado como imagen.',
                    'success'
                ).then(() => {
                    // Actualizar el ID Cuadre para el próximo uso
                    actualizarUltimoIdCuadre();
                    // Resetear el formulario después de guardar
                    infoForm.reset();
                    // Establecer el próximo ID Cuadre
                    establecerIdCuadre();
                    // Actualizar totales globales para reflejar el reset
                    actualizarTotalesGlobales();
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                exportarSeccion('totales-wrapper', 'Totales');
                Swal.fire(
                    'Exportado',
                    'Los totales han sido exportados como imagen.',
                    'success'
                ).then(() => {
                    // Actualizar el ID Cuadre para el próximo uso
                    actualizarUltimoIdCuadre();
                    // Resetear el formulario después de guardar
                    infoForm.reset();
                    // Establecer el próximo ID Cuadre
                    establecerIdCuadre();
                    // Actualizar totales globales para reflejar el reset
                    actualizarTotalesGlobales();
                });
            }
        });
    }
});
