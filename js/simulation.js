// Variables para los controles deslizantes
let diameter = 500; // metros
let speed = 17; // km/s
let angle = 45; // grados

// Actualizar valores de las barras deslizadoras
function updateSliderValues() {
  document.getElementById('diameterValue').textContent = diameter;
  document.getElementById('speedValue').textContent = speed;
  document.getElementById('angleValue').textContent = angle;
}

// Función para formatear números grandes
function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + ' billion';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + ' million';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + ' thousand';
  }
  return num.toString();
}

// Función para determinar si el impacto es en tierra o agua
async function determineTargetType(lat, lng) {
  console.log('🟡 Determining target type for:', lat, lng);
  
  // Lógica simple pero efectiva basada en geografía mundial
  const isProbablyWater = (
    // OCÉANO PACÍFICO (entre América y Asia)
    (lng >= -170 && lng <= -80) ||
    
    // OCÉANO ATLÁNTICO (entre América y Europa/África)
    (lng >= -60 && lng <= 20) ||
    
    // OCÉANO ÍNDICO (sur de Asia)
    (lng >= 40 && lng <= 120) ||
    
    // OCÉANOS POLARES
    (lat >= 70 || lat <= -60) ||
    
    // MARES PRINCIPALES
    (lat >= 30 && lat <= 45 && lng >= -10 && lng <= 40) ||  // Mediterráneo
    (lat >= 10 && lat <= 25 && lng >= -90 && lng <= -60)    // Caribe
  );
  
  const result = isProbablyWater ? 'water' : 'land';
  console.log('🟢 Simple detection:', result);
  
  return result;
}

// Función para preparar y ejecutar simulación de impacto
async function executeImpactSimulation(diameter, speed, angle, lat, lng, targetType) {
    try {
        const params = {
            diametro: diameter.toString(),
            velocidad: (speed * 1000).toString(), // Convertir km/s a m/s
            angulo: angle.toString(),
            densidad: '3000',
            lat: lat.toString(),
            lon: lng.toString(),
            target: targetType
        };

        console.log('Simulating impact with parameters:', params);
        return await simulateImpact(params);
    } catch (error) {
        console.error('Impact simulation failed:', error);
        throw error;
    }
}

// Función para mostrar resultados del backend
function displayBackendResults(impactData, targetType) {
  // Verificar que los datos existan y tengan valores por defecto
  const nombre = impactData.nombre || 'Custom Impact';
  const diametro_projectil_m = impactData.diametro_projectil_m || diameter;
  const masa_kg = impactData.masa_kg || 0;
  const energia_joules = impactData.energia_joules || 0;
  const energia_megatones_TNT = impactData.energia_megatones_TNT || 0;
  const crater_diameter_m = impactData.crater_diameter_m || 0;
  const crater_depth_m = impactData.crater_depth_m || 0;
  const fireball_radius_m = impactData.fireball_radius_m || 0;
  const thermal_lethal_radius_m = impactData.thermal_lethal_radius_m || 0;
  const blast_overpressure_radii_m = impactData.blast_overpressure_radii_m || {};
  const blast_wind_effects = impactData.blast_wind_effects || {};
  const seismic_magnitude_Mw = impactData.seismic_magnitude_Mw || 'N/A';
  const seismic_magnitude_effects_Mw = impactData.seismic_magnitude_effects_Mw || {};
  const location = impactData.location || {};
  const tsunami = impactData.tsunami || {};

  // Obtener valores de blast overpressure con verificaciones
  const psi_50 = blast_overpressure_radii_m['50_psi'] || 0;
  const psi_10 = blast_overpressure_radii_m['10_psi'] || 0;
  const psi_5 = blast_overpressure_radii_m['5_psi'] || 0;
  const psi_1 = blast_overpressure_radii_m['1_psi'] || 0;

  // Obtener valores de blast wind effects con verificaciones
  const wind_50_psi = blast_wind_effects['50_psi'] ? blast_wind_effects['50_psi'].wind_speed_kmh : 'N/A';
  const wind_10_psi = blast_wind_effects['10_psi'] ? blast_wind_effects['10_psi'].wind_speed_kmh : 'N/A';
  const wind_5_psi = blast_wind_effects['5_psi'] ? blast_wind_effects['5_psi'].wind_speed_kmh : 'N/A';

  // Construir el HTML para los efectos sísmicos
  let seismicEffectsHTML = '';
  if (seismic_magnitude_effects_Mw && typeof seismic_magnitude_effects_Mw === 'object') {
    seismicEffectsHTML = Object.entries(seismic_magnitude_effects_Mw).map(([distance, effect]) => {
      const mmi = effect && effect.mmi ? effect.mmi : 'N/A';
      return `<div class="result-item"><span class="result-label">At ${distance}:</span> <span class="result-value">${mmi}</span></div>`;
    }).join('');
  }

  document.getElementById("output").innerHTML = `
    <div class="result-section">
      <h3><i class="fas fa-info-circle"></i> Asteroid Information</h3>
      <div class="result-item"><span class="result-label">Diameter:</span> <span class="result-value">${diametro_projectil_m.toFixed(0)} m</span></div>
      <div class="result-item"><span class="result-label">Speed:</span> <span class="result-value">${speed} km/s</span></div>
      <div class="result-item"><span class="result-label">Angle:</span> <span class="result-value">${angle}°</span></div>
      <div class="result-item"><span class="result-label">Mass:</span> <span class="result-value">${formatNumber(masa_kg)} kg</span></div>
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-bolt"></i> Impact Energy</h3>
      <div class="result-item"><span class="result-label">Energy:</span> <span class="result-value">${energia_joules ? (energia_joules/1e15).toFixed(2) + ' × 10¹⁵ J' : 'N/A'}</span></div>
      <div class="result-item"><span class="result-label">Equivalent:</span> <span class="result-value">${energia_megatones_TNT ? parseFloat(energia_megatones_TNT).toFixed(2) + ' megatons TNT' : 'N/A'}</span></div>
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-mountain"></i> Crater Formation</h3>
      <div class="result-item"><span class="result-label">Diameter:</span> <span class="result-value">${formatNumber(crater_diameter_m)} m</span></div>
      <div class="result-item"><span class="result-label">Depth:</span> <span class="result-value">${formatNumber(crater_depth_m)} m</span></div>
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-fire"></i> Blast Effects</h3>
      <div class="result-item"><span class="result-label">Fireball Radius:</span> <span class="result-value">${formatNumber(fireball_radius_m)} m</span></div>
      <div class="result-item"><span class="result-label">Thermal Lethal Radius:</span> <span class="result-value">${formatNumber(thermal_lethal_radius_m)} m</span></div>
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-wind"></i> Overpressure Radii</h3>
      <div class="result-item"><span class="result-label">50 PSI:</span> <span class="result-value">${formatNumber(psi_50)} m</span></div>
      <div class="result-item"><span class="result-label">10 PSI:</span> <span class="result-value">${formatNumber(psi_10)} m</span></div>
      <div class="result-item"><span class="result-label">5 PSI:</span> <span class="result-value">${formatNumber(psi_5)} m</span></div>
      <div class="result-item"><span class="result-label">1 PSI:</span> <span class="result-value">${formatNumber(psi_1)} m</span></div>
    </div>

    <div class="result-section">
      <h3><i class="fas fa-wind"></i> Blast Wind Effects</h3>
      <div class="result-item"><span class="result-label">50 PSI Wind:</span> <span class="result-value">${wind_50_psi} km/h</span></div>
      <div class="result-item"><span class="result-label">10 PSI Wind:</span> <span class="result-value">${wind_10_psi} km/h</span></div>
      <div class="result-item"><span class="result-label">5 PSI Wind:</span> <span class="result-value">${wind_5_psi} km/h</span></div>
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-earthquake"></i> Seismic Effects</h3>
      <div class="result-item"><span class="result-label">Magnitude:</span> <span class="result-value">${seismic_magnitude_Mw} Mw</span></div>
      ${seismicEffectsHTML}
    </div>
    
    <div class="result-section">
      <h3><i class="fas fa-map-pin"></i> Impact Location</h3>
      <div class="result-item"><span class="result-label">Latitude:</span> <span class="result-value">${location.lat || 'N/A'}°</span></div>
      <div class="result-item"><span class="result-label">Longitude:</span> <span class="result-value">${location.lon || 'N/A'}°</span></div>
      <div class="result-item"><span class="result-label">Target Type:</span> <span class="result-value">${targetType === 'water' ? 'Water (Ocean/Lake)' : 'Land'}</span></div>
    </div>
    
    ${tsunami.likely ? `
    <div class="result-section">
      <h3><i class="fas fa-water"></i> Tsunami Effects</h3>
      <div class="result-item"><span class="result-label">Tsunami Risk:</span> <span class="result-value warning">HIGH</span></div>
      <div class="result-item"><span class="result-label">Notes:</span> <span class="result-value">${tsunami.notes || 'Significant tsunami expected'}</span></div>
    </div>
    ` : ''}
  `;

  // Mostrar el panel de resultados
  document.getElementById('results').classList.add('visible');
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
}