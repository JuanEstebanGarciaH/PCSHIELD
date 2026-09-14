let pcBlockchains = {};

function obtenerUltimoEstadoPC(pcId) {
  const cadenaPC = pcBlockchains[pcId];
  if (!cadenaPC) return null;
  
  const ultimoBloque = cadenaPC.chain[cadenaPC.chain.length - 1];
  try {
    let blockData = JSON.parse(ultimoBloque.data);
    return blockData.componentes;
  } catch (e) {
    return null;
  }
}

function registrarEquipoNuevo() {
  const pcId = document.getElementById('reg-pc-id').value.trim();
  if (!pcId) { alert("Ingresa un ID para el equipo."); return; }
  
  if (pcBlockchains[pcId]) { 
    alert("Error: Este equipo ya tiene una Blockchain existente. Ve a Mantenimiento."); 
    return; 
  }

  pcBlockchains[pcId] = new BlockChain(`Génesis - Inicio de vida para ${pcId}`);

  const dataObj = {
    evento: "Registro Inicial",
    componentes: {
      cpu: document.getElementById('reg-cpu').value,
      gpu: document.getElementById('reg-gpu').value,
      ram: document.getElementById('reg-ram').value,
      ssd: document.getElementById('reg-ssd').value,
      motherboard: document.getElementById('reg-motherboard').value
    }
  };
  
  pcBlockchains[pcId].addBlock(JSON.stringify(dataObj));
  
  document.querySelectorAll('#reg-pc-id, #reg-cpu, #reg-gpu, #reg-ram, #reg-ssd, #reg-motherboard').forEach(el => el.value = '');
  alert(`Cadena creada con éxito para ${pcId}.`);
  render();
}

function buscarEquipoParaEvento() {
  const pcId = document.getElementById('ev-pc-id').value.trim();
  const estadoPrevio = obtenerUltimoEstadoPC(pcId);
  
  if (!estadoPrevio) {
    alert("No se encontró ninguna Blockchain registrada para este ID.");
    document.getElementById('evento-form').classList.add('hidden');
    return;
  }

  document.getElementById('ev-cpu').value = estadoPrevio.cpu;
  document.getElementById('ev-gpu').value = estadoPrevio.gpu;
  document.getElementById('ev-ram').value = estadoPrevio.ram;
  document.getElementById('ev-ssd').value = estadoPrevio.ssd;
  document.getElementById('ev-motherboard').value = estadoPrevio.motherboard;

  document.getElementById('evento-form').classList.remove('hidden');
  document.getElementById('ev-tipo').value = "Mantenimiento Preventivo";
  toggleEdicionComponentes();
}

function toggleEdicionComponentes() {
  const tipo = document.getElementById('ev-tipo').value;
  const esSoloMantenimiento = (tipo === "Mantenimiento Preventivo");
  const inputs = ['ev-cpu', 'ev-gpu', 'ev-ram', 'ev-ssd', 'ev-motherboard'];
  
  inputs.forEach(id => {
    if(esSoloMantenimiento) { document.getElementById(id).setAttribute('readonly', true); } 
    else { document.getElementById(id).removeAttribute('readonly'); }
  });
}

function registrarEventoAdicional() {
  const pcId = document.getElementById('ev-pc-id').value.trim();
  const dataObj = {
    evento: document.getElementById('ev-tipo').value,
    componentes: {
      cpu: document.getElementById('ev-cpu').value,
      gpu: document.getElementById('ev-gpu').value,
      ram: document.getElementById('ev-ram').value,
      ssd: document.getElementById('ev-ssd').value,
      motherboard: document.getElementById('ev-motherboard').value
    }
  };
  
  pcBlockchains[pcId].addBlock(JSON.stringify(dataObj));
  
  document.getElementById('ev-pc-id').value = '';
  document.getElementById('evento-form').classList.add('hidden');
  alert("Bloque enlazado exitosamente al historial del equipo.");
  render();
}

function verificarGarantia() {
  const pcId = document.getElementById('ver-pc-id').value.trim();
  const estadoOriginal = obtenerUltimoEstadoPC(pcId);
  const statusBox = document.getElementById('warranty-status');

  if (!estadoOriginal) {
    statusBox.className = 'status-box invalid';
    statusBox.innerHTML = '❌ ERROR: El equipo no tiene una Blockchain asociada.';
    statusBox.style.display = 'block';
    return;
  }

  const componentesDetectados = {
    cpu: document.getElementById('ver-cpu').value,
    gpu: document.getElementById('ver-gpu').value,
    ram: document.getElementById('ver-ram').value,
    ssd: document.getElementById('ver-ssd').value,
    motherboard: document.getElementById('ver-motherboard').value
  };

  let alterado = false;
  let discrepancias = [];

  // Comparación de componentes de hardware
  for (let key in estadoOriginal) {
    if (estadoOriginal[key] !== componentesDetectados[key]) {
      alterado = true;
      discrepancias.push(`<b>${key.toUpperCase()}:</b> Registrado: ${estadoOriginal[key]} | Físico: ${componentesDetectados[key] || 'Vacío'}`);
    }
  }

  // Validación del Sistema Operativo
  const tieneSoFabrica = document.getElementById('ver-so-fabrica').checked;
  if (!tieneSoFabrica) {
    alterado = true;
    discrepancias.push(`<b>SOFTWARE:</b> El equipo no conserva el SO de fábrica (Garantía de software exonerada según Art. 16 Ley 1480).`);
  }

  statusBox.style.display = 'block';
  if (alterado) {
    statusBox.className = 'status-box invalid';
    statusBox.innerHTML = `<h3>🚫 ALERTA: Incompatibilidad en Garantía</h3><p style="font-size: 0.9em; text-align: left;">${discrepancias.join('<br>')}</p>`;
  } else {
    statusBox.className = 'status-box valid';
    statusBox.innerHTML = `<h3>✅ Garantía Válida</h3><p>Trazabilidad de hardware y estado de software comprobados.</p>`;
  }
}

function render() {
  let globalHtml = '';
  let sistemasSanos = true;
  const filtroId = document.getElementById('filtro-historial').value.toLowerCase().trim();

  for (const [pcId, cadenaPC] of Object.entries(pcBlockchains)) {
    
    if (filtroId && !pcId.toLowerCase().includes(filtroId)) continue;

    if (!cadenaPC.isValid().ok) sistemasSanos = false;

    let htmlCadena = `
      <div class="chain-group">
        <h3>🖥️ Trazabilidad de: ${pcId}</h3>
    `;

    let chainReversed = [...cadenaPC.chain].reverse();
    
    chainReversed.forEach(b => {
      let dataHtml = '';
      let isGenesis = false;

      let fechaFormateada = new Date(b.date).toLocaleString();

      if (b.index === 0) {
        isGenesis = true;
        dataHtml = `<strong>${b.data}</strong>`;
      } else {
        try {
          let obj = JSON.parse(b.data);
          dataHtml = `
            <strong>Evento:</strong> <span style="background:#ffeb3b; padding:2px 4px; border-radius:3px;">${obj.evento}</span><br>
            <div style="margin-top: 5px; font-size: 0.95em;">
              CPU: ${obj.componentes.cpu} | GPU: ${obj.componentes.gpu} | RAM: ${obj.componentes.ram} | SSD: ${obj.componentes.ssd} | MB: ${obj.componentes.motherboard}
            </div>
          `;
        } catch(e) {}
      }

      htmlCadena += `
        <div class="block ${isGenesis ? 'genesis' : ''}">
          <b>Bloque #${b.index}</b> - ${fechaFormateada}
          <div style="margin: 8px 0;">${dataHtml}</div>
          <div class="block-hash">
            <b>Hash actual:</b> ${b.hash}<br>
            <b>Hash anterior:</b> ${b.previousHash || '(No hay hash anterior)'}
          </div>
        </div>
      `;
    });

    htmlCadena += `</div>`;
    globalHtml += htmlCadena;
  }

  if (globalHtml === '') {
    globalHtml = '<p style="color: #666;">No hay cadenas registradas o ninguna coincide con el filtro.</p>';
  }

  document.getElementById('all-chains').innerHTML = globalHtml;

  const statusEl = document.getElementById('system-status');
  statusEl.textContent = sistemasSanos ? '🟢 Todas las cadenas están íntegras.' : '🔴 ALERTA: Cadenas corrompidas.';
  statusEl.style.color = sistemasSanos ? 'green' : 'red';
}


render();