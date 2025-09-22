// URL DE TU API
const URL_SCRIPT =
  "https://script.google.com/macros/s/AKfycbwM6fn0mou2i6iwcPoFNhOyRgsHBxE6KsiFsFDbPvYq3XmQoyqJw25P7Mp2mzXEZiww/exec";

// Función principal de búsqueda
function buscarPedido() {
  const codigo = document
    .getElementById("codigoPedido")
    .value.trim()
    .toUpperCase();
  const mensajeError = document.getElementById("mensajeError");
  const resultado = document.getElementById("resultado");
  const botonReiniciar = document.getElementById("botonReiniciar");

  // Limpiar resultados anteriores
  mensajeError.textContent = "";
  resultado.innerHTML = "";
  botonReiniciar.style.display = "none";

  if (!codigo) {
    mensajeError.textContent = "⚠️ Ingresa un código de pedido válido.";
    return;
  }

  // Mostrar mensaje de carga
  mensajeError.textContent = "🔍 Buscando pedido...";
  mensajeError.style.color = "blue";

  console.log("Buscando pedido:", codigo);

  // Usar XMLHttpRequest para evitar problemas CORS
  const xhr = new XMLHttpRequest();
  const url = URL_SCRIPT + "?codigo=" + encodeURIComponent(codigo);

  xhr.open("GET", url, true);
  xhr.timeout = 10000;

  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        const data = JSON.parse(xhr.responseText);
        console.log("Datos recibidos:", data);

        if (data.error) {
          mensajeError.textContent = "❌ " + data.error;
          mensajeError.style.color = "red";
        } else {
          mostrarResultado(data, codigo);
          mensajeError.textContent = "✅ Pedido encontrado!";
          mensajeError.style.color = "green";
          botonReiniciar.style.display = "block";
        }
      } catch (e) {
        mensajeError.textContent = "❌ Error al procesar los datos";
        mensajeError.style.color = "red";
        console.error("Error:", e);
      }
    } else {
      mensajeError.textContent = "❌ Error del servidor: " + xhr.status;
      mensajeError.style.color = "red";
    }
  };

  xhr.onerror = function () {
    mensajeError.textContent = "❌ Error de conexión";
    mensajeError.style.color = "red";
  };

  xhr.ontimeout = function () {
    mensajeError.textContent = "⏰ Tiempo de espera agotado";
    mensajeError.style.color = "red";
  };

  xhr.send();
}

// Función para mostrar los resultados
function mostrarResultado(pedido, codigo) {
  const resultado = document.getElementById("resultado");

  // Determinar el estado visual
  let estadoVisual = "";
  const estado = (pedido.estado || "").toLowerCase();

  if (estado.includes("registrado")) {
    estadoVisual = '<span class="status red">🟥 Pedido registrado</span>';
  } else if (estado.includes("corte")) {
    estadoVisual = '<span class="status orange">🟧 En corte</span>';
  } else if (estado.includes("confección") || estado.includes("confeccion")) {
    estadoVisual = '<span class="status yellow">🟨 En confección</span>';
  } else if (estado.includes("acabado")) {
    estadoVisual = '<span class="status blue">🟦 En acabado</span>';
  } else if (estado.includes("membretado")) {
    estadoVisual = '<span class="status purple">🟪 En membretado</span>';
  } else if (estado.includes("listo")) {
    estadoVisual = '<span class="status green">🟩 Pedido listo</span>';
  } else {
    estadoVisual =
      '<span class="status gray">' +
      (pedido.estado || "Desconocido") +
      "</span>";
  }

  // Generar barra de progreso
  const barraProgreso = generarBarraProgreso(estado);

  // Botón de modificación
  const botonModificar = pedido.link_del_formulario
    ? `<div class="modificar-pedido">
            <p>¿Quieres modificar tu pedido?</p>
            <button class="btn-modificar" onclick="window.open('${pedido.link_del_formulario}', '_blank')">
                ✏️ Haz click aquí
            </button>
        </div>`
    : "";

  resultado.innerHTML = `
        <div class="result-card">
            <p><strong>🔖 Código:</strong> ${codigo}</p>
            <p><strong>🏬 Tienda:</strong> ${
              pedido.tienda || "No especificado"
            }</p>
            <p><strong>👕 Modelo:</strong> ${
              pedido.modelo || "No especificado"
            }</p>
            <p><strong>📏 Tallas:</strong> ${
              pedido.tallas || "No especificado"
            }</p>
            <p><strong>🎨 Colores:</strong> ${
              pedido.colores_y_cantidades || "No especificado"
            }</p>
            <p><strong>📧 Correo:</strong> ${
              pedido.correo || "No especificado"
            }</p>
            <p><strong>📦 Estado:</strong> ${estadoVisual}</p>
            <p><strong>🎭 Combinación/Accesorio:</strong> ${
              pedido.combinacin_accesorio ||
              pedido.combinación_accesorio ||
              "Ninguna"
            }</p>
            <p><strong>✅ Estado del Pedido:</strong> ${
              pedido.estado_del_pedido || "⏳ En espera"
            }</p>
            <p><strong>📅 Fecha:</strong> ${
              pedido.fecha || "No especificada"
            }</p>
            <p><strong>⏰ Hora:</strong> ${pedido.hora || "No especificada"}</p>

            <div class="tracking-bar">
                ${barraProgreso}
            </div>

            ${botonModificar}
        </div>
    `;
}

// Función para generar la barra de progreso
function generarBarraProgreso(estadoActual) {
  const etapas = [
    { nombre: "Registrado", clase: "registrado", activo: false },
    { nombre: "Corte", clase: "corte", activo: false },
    { nombre: "Confección", clase: "confeccion", activo: false },
    { nombre: "Acabado", clase: "acabado", activo: false },
    { nombre: "Membretado", clase: "membretado", activo: false },
    { nombre: "Listo", clase: "listo", activo: false },
  ];

  // Determinar qué etapas están completadas
  let estadoEncontrado = false;
  for (let etapa of etapas) {
    if (
      estadoActual.includes(etapa.clase) ||
      estadoActual.includes(etapa.nombre.toLowerCase())
    ) {
      etapa.activo = true;
      estadoEncontrado = true;
    } else if (!estadoEncontrado) {
      etapa.activo = true; // Etapas anteriores completadas
    }
  }

  // Generar HTML de la barra
  return etapas
    .map(
      (etapa) =>
        `<div class="tracking-step ${etapa.activo ? "completed" : ""}">${
          etapa.nombre
        }</div>`
    )
    .join("");
}

// Función para reiniciar el formulario
function reiniciarFormulario() {
  document.getElementById("codigoPedido").value = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("mensajeError").textContent = "";
  document.getElementById("botonReiniciar").style.display = "none";
}
