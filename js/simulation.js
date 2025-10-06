// Variables para los controles deslizantes
let diameter = 500; // metros
let speed = 17; // km/s
let angle = 45; // grados
let density = 3000; // kg/m³

// Actualizar valores de las barras deslizadoras
function updateSliderValues() {
  document.getElementById('diameterValue').textContent = diameter;
  document.getElementById('speedValue').textContent = speed;
  document.getElementById('angleValue').textContent = angle;
}

// Función para formatear números grandes - MEJORADA
function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  
  // Para distancias grandes, usar km directamente
  if (num >= 100000) {
    return (num / 1000).toFixed(1) + ' km';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + ' km';
  } else if (num >= 1) {
    return Math.round(num) + ' m';
  } else {
    return num.toFixed(1) + ' m';
  }
}

// Función para determinar si el impacto es en tierra o agua
async function determineTargetType(lat, lng) {
  console.log('📍 Determining terrain for:', lat, lng);
  
  // Detección simple basada en continentes principales
  // Si no está en un continente conocido, es agua
  
  // América del Norte
  const isNorthAmerica = (lat >= 15 && lat <= 70 && lng >= -170 && lng <= -50);
  // América del Sur
  const isSouthAmerica = (lat >= -55 && lat <= 15 && lng >= -85 && lng <= -30);
  // Europa
  const isEurope = (lat >= 35 && lat <= 70 && lng >= -10 && lng <= 40);
  // Asia
  const isAsia = (lat >= 10 && lat <= 70 && lng >= 40 && lng <= 180);
  // África
  const isAfrica = (lat >= -35 && lat <= 35 && lng >= -20 && lng <= 50);
  // Australia
  const isAustralia = (lat >= -45 && lat <= -10 && lng >= 110 && lng <= 155);
  
  const isLand = isNorthAmerica || isSouthAmerica || isEurope || isAsia || isAfrica || isAustralia;
  
  const result = isLand ? 'land' : 'water';
  console.log(`🎯 Simple terrain detection: ${result}`);
  return result;
}

// Función para preparar y ejecutar simulación de impacto
async function executeImpactSimulation(diameter, speed, angle, density, lat, lng, targetType) {
    try {
        const params = {
            diametro: diameter.toString(),
            velocidad: speed.toString(), // Ya en km/s
            angulo: angle.toString(),
            densidad: density.toString(),
            lat: lat.toString(),
            lon: lng.toString(),
            target: targetType
        };

        console.log('🚀 Simulating impact with parameters:', params);
        return await simulateImpact(params);
    } catch (error) {
        console.error('Impact simulation failed:', error);
        throw error;
    }
}

// Función para mostrar resultados del backend
function displayBackendResults(impactData, targetType) {
  console.log('📨 Backend response data:', impactData);
  
  if (!impactData || !impactData.energia || !impactData.efectos_impacto) {
    console.error('❌ Invalid response format from backend');
    displayErrorResults(new Error('Invalid response format from server'));
    return;
  }

  // Extraer datos del nuevo formato
  const { 
    nombre,
    parametros_entrada,
    energia,
    efectos_impacto,
    efectos_sismicos,
    efectos_tsunami,
    ubicacion,
    factores_escala_aplicados,
    referencias_cientificas
  } = impactData;

  // Datos de energía
  const { 
    masa_kg, 
    energia_joules, 
    energia_megatones_TNT,
    equivalente_bombas_hiroshima 
  } = energia;

  // Efectos de impacto
  const {
    crater_diameter_m,
    crater_depth_m,
    fireball_radius_m,
    thermal_effects_m,
    blast_overpressure_radii_m,
    blast_wind_effects
  } = efectos_impacto;

  // Efectos sísmicos
  const {
    magnitud_momento_Mw,
    intensidades_regionales
  } = efectos_sismicos || {};

  // Construir el HTML con controles de capas integrados
  document.getElementById("output").innerHTML = `
    <!-- SECCIÓN DE CONTROLES DE CAPAS -->
    <div class="result-section">
      <h3><i class="fas fa-layer-group"></i> Visualization Controls</h3>
      <div class="layer-controls-integrated">
        <div class="layer-control-row">
          <div class="layer-control-item">
            <input type="checkbox" id="layer-crater" checked>
            <label for="layer-crater">
              <span class="layer-color" style="background: #A0522D"></span>
              Crater
            </label>
          </div>
          <div class="layer-control-item">
            <input type="checkbox" id="layer-fireball" checked>
            <label for="layer-fireball">
              <span class="layer-color" style="background: #FF6347"></span>
              Thermal Effects
            </label>
          </div>
          <div class="layer-control-item">
            <input type="checkbox" id="layer-blast" checked>
            <label for="layer-blast">
              <span class="layer-color" style="background: #FF6B35"></span>
              Blast Effects
            </label>
          </div>
        </div>
        <div class="layer-control-row">
          <div class="layer-control-item">
            <input type="checkbox" id="layer-seismic" checked>
            <label for="layer-seismic">
              <span class="layer-color" style="background: #8B7355"></span>
              Seismic Effects
            </label>
          </div>
          <div class="layer-control-item">
            <input type="checkbox" id="layer-tsunami" ${targetType === 'water' ? 'checked' : 'disabled'}>
            <label for="layer-tsunami" class="${targetType !== 'water' ? 'disabled' : ''}">
              <span class="layer-color" style="background: #4169E1"></span>
              Tsunami
            </label>
          </div>
        </div>
        <div class="layer-controls-actions">
          <button id="show-all-layers" class="layer-btn">Show All</button>
          <button id="hide-all-layers" class="layer-btn">Hide All</button>
        </div>
      </div>
    </div>

    <!-- INFORMACIÓN DEL ASTEROIDE Y ENERGÍA -->
    <div class="result-section">
      <h3><i class="fas fa-info-circle"></i> Impact Parameters</h3>
      <div class="result-item"><span class="result-label">Asteroid Information:</span> <span class="result-value"></span></div>
      <div class="result-item"><span class="result-label">Diameter:</span> <span class="result-value">${parametros_entrada.diametro_projectil_m?.toFixed(0) || diameter} m</span></div>
      <div class="result-item"><span class="result-label">Speed:</span> <span class="result-value">${speed} km/s</span></div>
      <div class="result-item"><span class="result-label">Angle:</span> <span class="result-value">${angle}°</span></div>
      <div class="result-item"><span class="result-label">Density:</span> <span class="result-value">${parametros_entrada.densidad_kg_m3 || density} kg/m³</span></div>
      <div class="result-item"><span class="result-label">Mass:</span> <span class="result-value">${formatNumber(masa_kg)} kg</span></div>
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-bolt"></i> Impact Energy</h3>
      <div class="result-item"><span class="result-label">Energy:</span> <span class="result-value">${(energia_joules/1e15).toFixed(2)} × 10¹⁵ J</span></div>
      <div class="result-item"><span class="result-label">Equivalent:</span> <span class="result-value">${energia_megatones_TNT.toFixed(2)} megatons TNT</span></div>
      <div class="result-item"><span class="result-label">Hiroshima Bombs:</span> <span class="result-value">${formatNumber(equivalente_bombas_hiroshima)}</span></div>
    </div>
    
    <!-- EFECTOS DE IMPACTO -->
    <div class="result-section">
      <h3><i class="fas fa-mountain"></i> Crater Formation</h3>
      <div class="result-item"><span class="result-label">Diameter:</span> <span class="result-value">${formatNumber(crater_diameter_m)}</span></div>
      <div class="result-item"><span class="result-label">Depth:</span> <span class="result-value">${formatNumber(crater_depth_m)}</span></div>
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-fire"></i> Thermal Effects</h3>
      <div class="result-item"><span class="result-label">Fireball Radius:</span> <span class="result-value">${formatNumber(fireball_radius_m)}</span></div>
      <div class="result-item"><span class="result-label">Lethal Burns:</span> <span class="result-value">${formatNumber(thermal_effects_m.lethal)}</span></div>
      <div class="result-item"><span class="result-label">3rd Degree Burns:</span> <span class="result-value">${formatNumber(thermal_effects_m.burns_3rd)}</span></div>
      <div class="result-item"><span class="result-label">Material Ignition:</span> <span class="result-value">${formatNumber(thermal_effects_m.ignition)}</span></div>
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-wind"></i> Blast Overpressure</h3>
      <div class="result-item"><span class="result-label">50 PSI (Total Destruction):</span> <span class="result-value">${formatNumber(blast_overpressure_radii_m['50_psi'])}</span></div>
      <div class="result-item"><span class="result-label">10 PSI (Building Collapse):</span> <span class="result-value">${formatNumber(blast_overpressure_radii_m['10_psi'])}</span></div>
      <div class="result-item"><span class="result-label">5 PSI (Severe Damage):</span> <span class="result-value">${formatNumber(blast_overpressure_radii_m['5_psi'])}</span></div>
      <div class="result-item"><span class="result-label">1 PSI (Window Breakage):</span> <span class="result-value">${formatNumber(blast_overpressure_radii_m['1_psi'])}</span></div>
    </div>

    <div class="result-section">
      <h3><i class="fas fa-tornado"></i> Blast Wind Effects</h3>
      <div class="result-item"><span class="result-label">50 PSI Wind Speed:</span> <span class="result-value">${blast_wind_effects['50_psi']?.wind_speed_kmh || 'N/A'} km/h</span></div>
      <div class="result-item"><span class="result-label">10 PSI Wind Speed:</span> <span class="result-value">${blast_wind_effects['10_psi']?.wind_speed_kmh || 'N/A'} km/h</span></div>
      <div class="result-item"><span class="result-label">5 PSI Wind Speed:</span> <span class="result-value">${blast_wind_effects['5_psi']?.wind_speed_kmh || 'N/A'} km/h</span></div>
    </div>
    
    <!-- EFECTOS SÍSMICOS -->
    ${magnitud_momento_Mw ? `
    <div class="result-section">
      <h3><i class="fas fa-earthquake"></i> Seismic Effects</h3>
      <div class="result-item"><span class="result-label">Seismic Magnitude:</span> <span class="result-value">${magnitud_momento_Mw} Mw</span></div>
      <div class="result-item"><span class="result-label">Maximum Felt Distance:</span> <span class="result-value">${Math.max(...Object.keys(intensidades_regionales || {}).map(k => parseInt(k.replace('_km', ''))).filter(d => !isNaN(d)))} km</span></div>
      ${intensidades_regionales ? Object.entries(intensidades_regionales).map(([distance, data]) => `
        <div class="result-item seismic-effect">
          <span class="result-label">At ${distance}:</span> 
          <span class="result-value">MMI ${data.mmi}</span>
          <div class="seismic-detail">PGA: ${data.pga_g}g - ${data.description}</div>
        </div>
      `).join('') : ''}
    </div>
    ` : ''}
    
    <!-- UBICACIÓN -->
    <div class="result-section">
      <h3><i class="fas fa-map-pin"></i> Impact Location</h3>
      <div class="result-item"><span class="result-label">Latitude:</span> <span class="result-value">${ubicacion.lat || 'N/A'}°</span></div>
      <div class="result-item"><span class="result-label">Longitude:</span> <span class="result-value">${ubicacion.lon || 'N/A'}°</span></div>
      <div class="result-item"><span class="result-label">Target Type:</span> <span class="result-value">${targetType === 'water' ? 'Water (Ocean/Lake)' : 'Land'}</span></div>
    </div>
    
    <!-- EFECTOS DE TSUNAMI -->
    ${efectos_tsunami?.likely ? `
    <div class="result-section">
      <h3><i class="fas fa-water"></i> Tsunami Effects</h3>
      <div class="result-item"><span class="result-label">Tsunami Risk:</span> <span class="result-value warning">HIGH</span></div>
      <div class="result-item"><span class="result-label">Max Wave Height:</span> <span class="result-value">${efectos_tsunami.max_wave_height_m} m</span></div>
      <div class="result-item"><span class="result-label">Classification:</span> <span class="result-value">${efectos_tsunami.classification}</span></div>
      <div class="result-item"><span class="result-label">Notes:</span> <span class="result-value">${efectos_tsunami.notes}</span></div>
    </div>
    ` : ''}
    
    <!-- FACTORES DE ESCALA -->
    ${factores_escala_aplicados ? `
    <div class="result-section">
      <h3><i class="fas fa-ruler-combined"></i> Scale Factors Applied</h3>
      <div class="result-item"><span class="result-label">Thermal Scaling:</span> <span class="result-value">${(factores_escala_aplicados.thermal_scaling * 100).toFixed(0)}%</span></div>
      <div class="result-item"><span class="result-label">Blast Scaling:</span> <span class="result-value">${(factores_escala_aplicados.blast_scaling * 100).toFixed(0)}%</span></div>
      <div class="result-item"><span class="result-label">Fireball Scaling:</span> <span class="result-value">${(factores_escala_aplicados.fireball_scaling * 100).toFixed(0)}%</span></div>
      <div class="result-item"><span class="result-label">Note:</span> <span class="result-value">${factores_escala_aplicados.nota}</span></div>
    </div>
    ` : ''}
    
    <!-- REFERENCIAS CIENTÍFICAS -->
    ${referencias_cientificas ? `
    <div class="result-section">
      <h3><i class="fas fa-graduation-cap"></i> Scientific References</h3>
      <div class="references-list">
        ${referencias_cientificas.map(ref => `
          <div class="reference-item">• ${ref}</div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  `;

  // Mostrar el panel de resultados
  document.getElementById('results').classList.add('visible');
  
  // Configurar event listeners para los controles integrados
  setupIntegratedLayerControls();
  
  // MOSTRAR EFECTOS VISUALES EN EL MAPA
  console.log('🎯 ABOUT TO SHOW MAP EFFECTS:');
  console.log('Thermal effects data:', efectos_impacto.thermal_effects_m);
  console.log('Blast effects data:', efectos_impacto.blast_overpressure_radii_m);
  console.log('Fireball radius:', efectos_impacto.fireball_radius_m);
  
  if (typeof showAllImpactEffects === 'function') {
    console.log('✅ showAllImpactEffects function found, calling...');
    showAllImpactEffects(impactData, targetType);
  } else {
    console.error('❌ showAllImpactEffects function not found');
  }
}

// Nueva función para configurar controles integrados
function setupIntegratedLayerControls() {
  // Controles individuales
  document.getElementById('layer-crater')?.addEventListener('change', (e) => {
    if (typeof toggleLayerVisibility === 'function') {
      toggleLayerVisibility('crater', e.target.checked);
    }
  });
  
  document.getElementById('layer-fireball')?.addEventListener('change', (e) => {
    if (typeof toggleLayerVisibility === 'function') {
      toggleLayerVisibility('fireball', e.target.checked);
    }
  });
  
  document.getElementById('layer-blast')?.addEventListener('change', (e) => {
    if (typeof toggleLayerVisibility === 'function') {
      toggleLayerVisibility('blast', e.target.checked);
    }
  });
  
  document.getElementById('layer-seismic')?.addEventListener('change', (e) => {
    if (typeof toggleLayerVisibility === 'function') {
      toggleLayerVisibility('seismic', e.target.checked);
    }
  });
  
  document.getElementById('layer-tsunami')?.addEventListener('change', (e) => {
    if (typeof toggleLayerVisibility === 'function') {
      toggleLayerVisibility('tsunami', e.target.checked);
    }
  });
  
  // Botones de acción
  document.getElementById('show-all-layers')?.addEventListener('click', () => {
    if (typeof showAllLayers === 'function') {
      showAllLayers();
      updateIntegratedCheckboxes(true);
    }
  });
  
  document.getElementById('hide-all-layers')?.addEventListener('click', () => {
    if (typeof hideAllLayers === 'function') {
      hideAllLayers();
      updateIntegratedCheckboxes(false);
    }
  });
}

// Función para actualizar todos los checkboxes
function updateIntegratedCheckboxes(checked) {
  const checkboxes = [
    'layer-crater', 'layer-fireball', 'layer-blast', 
    'layer-seismic', 'layer-tsunami'
  ];
  
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox && !checkbox.disabled) {
      checkbox.checked = checked;
    }
  });
}

// Función de respaldo en caso de error del backend
function displayErrorResults(error) {
  document.getElementById("output").innerHTML = `
    <div class="result-section">
      <h3><i class="fas fa-exclamation-triangle"></i> Simulation Error</h3>
      <div class="result-item"><span class="result-label">Status:</span> <span class="result-value warning">Backend Unavailable</span></div>
      <div class="result-item"><span class="result-label">Message:</span> <span class="result-value">${error.message || 'Unable to connect to simulation server'}</span></div>
      <div class="result-item"><span class="result-label">Action:</span> <span class="result-value">Please try again later or check your connection</span></div>
    </div>
  `;
  
  // Mostrar el panel de resultados
  document.getElementById('results').classList.add('visible');
  
  // Limpiar efectos visuales en caso de error
  if (typeof clearImpactEffects === 'function') {
    clearImpactEffects();
  }
}

// Agregar esta función auxiliar si no existe
function updateSliderValues() {
  const diameterValue = document.getElementById('diameterValue');
  const speedValue = document.getElementById('speedValue');
  const angleValue = document.getElementById('angleValue');
  
  if (diameterValue) diameterValue.textContent = diameter;
  if (speedValue) speedValue.textContent = speed;
  if (angleValue) angleValue.textContent = angle;
  
  console.log('📊 Sliders updated to:', { diameter, speed, angle });
}