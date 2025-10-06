let map = null;
let impactLatLng = null;
let impactMarker = null;
let mapInitialized = false;

// Sistema de capas agrupadas
let impactLayers = {
    crater: null,
    fireball: {
        main: null,
        thermal: []
    },
    blast: [],
    seismic: {
        main: null,
        distances: []
    },
    tsunami: null
};

let layerVisibility = {
    crater: true,
    fireball: true,
    blast: true,
    seismic: true,
    tsunami: true
};

// ==============================================
// SISTEMA DE ANIMACIONES DE EXPANSIÓN PROGRESIVA
// ==============================================

const ANIMATION_CONFIG = {
    duration: 2000,
    easing: 'easeOutCubic',
    delayBetweenLayers: 300,
    staggerDelay: 150
};

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Animación de círculos con easing - IA assisted for smooth transitions
function animateCircleExpansion(circle, targetRadius, duration = ANIMATION_CONFIG.duration, delay = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const startTime = performance.now();
            const startRadius = 0;
            
            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutCubic(progress);
                
                const currentRadius = startRadius + (targetRadius - startRadius) * easedProgress;
                circle.setRadius(currentRadius);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        }, delay);
    });
}

function initializeMap() {
  try {
    console.log('🗺️ Initializing map...');
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('❌ Map container not found');
      return null;
    }

    const map = L.map('map').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
      mapInitialized = true;
      console.log('✅ Map initialized successfully');
    }, 100);

    return map;
  } catch (error) {
    console.error('❌ Error initializing map:', error);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM loaded, initializing map...');
  map = initializeMap();
  
  if (!map) {
    console.error('Failed to initialize map');
    return;
  }

  map.on('click', function (e) {
    impactLatLng = e.latlng;
    
    if (impactMarker) {
      map.removeLayer(impactMarker);
    }
    
    impactMarker = L.marker(impactLatLng, {
      icon: L.divIcon({
        className: 'impact-marker',
        iconSize: [20, 20],
        html: '<div style="width:100%;height:100%;border-radius:50%;background-color:#242f31;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>'
      })
    }).addTo(map)
      .bindPopup("<strong>Impact Location</strong><br>Lat: " + impactLatLng.lat.toFixed(4) + "°<br>Lng: " + impactLatLng.lng.toFixed(4) + "°")
      .openPopup();
      
    const initialMessage = document.getElementById('initialMessage');
    if (initialMessage) {
      initialMessage.style.display = 'none';
    }
  });

  window.addEventListener('resize', function() {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  });
});

function getMap() {
  return map;
}

// ==============================================
// SISTEMA DE VISUALIZACIÓN DE EFECTOS DE IMPACTO - COMPLETO
// ==============================================

function clearImpactEffects() {
    console.log('🧹 Clearing impact effects from map');
    
    if (!map) {
        console.error('❌ Cannot clear effects - no map available');
        return;
    }
    
    if (impactLayers.crater && map.hasLayer(impactLayers.crater)) {
        map.removeLayer(impactLayers.crater);
    }
    
    if (impactLayers.fireball.main && map.hasLayer(impactLayers.fireball.main)) {
        map.removeLayer(impactLayers.fireball.main);
    }
    
    impactLayers.fireball.thermal.forEach(layer => {
        if (layer && map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    
    impactLayers.blast.forEach(layer => {
        if (layer && map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    
    if (impactLayers.seismic.main && map.hasLayer(impactLayers.seismic.main)) {
        map.removeLayer(impactLayers.seismic.main);
    }
    
    impactLayers.seismic.distances.forEach(layer => {
        if (layer && map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    
    if (impactLayers.tsunami && map.hasLayer(impactLayers.tsunami)) {
        map.removeLayer(impactLayers.tsunami);
    }
    
    impactLayers = {
        crater: null,
        fireball: {
            main: null,
            thermal: []
        },
        blast: [],
        seismic: {
            main: null,
            distances: []
        },
        tsunami: null
    };
    
    layerVisibility = {
        crater: true,
        fireball: true,
        blast: true,
        seismic: true,
        tsunami: true
    };
    
    console.log('✅ All impact effects cleared');
}

function toggleLayerVisibility(layerType, visible) {
    layerVisibility[layerType] = visible;
    
    if (!map) {
        console.error('❌ Cannot toggle layers - no map available');
        return;
    }
    
    console.log(`👁️ Toggling ${layerType} layer: ${visible ? 'VISIBLE' : 'HIDDEN'}`);
    
    switch(layerType) {
        case 'crater':
            if (impactLayers.crater) {
                if (visible && !map.hasLayer(impactLayers.crater)) {
                    map.addLayer(impactLayers.crater);
                } else if (!visible && map.hasLayer(impactLayers.crater)) {
                    map.removeLayer(impactLayers.crater);
                }
            }
            break;
            
        case 'fireball':
            if (impactLayers.fireball.main) {
                if (visible && !map.hasLayer(impactLayers.fireball.main)) {
                    map.addLayer(impactLayers.fireball.main);
                } else if (!visible && map.hasLayer(impactLayers.fireball.main)) {
                    map.removeLayer(impactLayers.fireball.main);
                }
            }
            
            impactLayers.fireball.thermal.forEach(layer => {
                if (layer) {
                    if (visible && !map.hasLayer(layer)) {
                        map.addLayer(layer);
                    } else if (!visible && map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                }
            });
            break;
            
        case 'blast':
            if (impactLayers.blast && impactLayers.blast.length > 0) {
                impactLayers.blast.forEach((layer, index) => {
                    if (layer) {
                        if (visible && !map.hasLayer(layer)) {
                            map.addLayer(layer);
                            console.log(`   ✅ Blast layer ${index + 1} ADDED TO MAP`);
                        } else if (!visible && map.hasLayer(layer)) {
                            map.removeLayer(layer);
                            console.log(`   ✅ Blast layer ${index + 1} REMOVED FROM MAP`);
                        }
                    }
                });
            }
            break;
            
        case 'seismic':
            if (impactLayers.seismic.main) {
                if (visible && !map.hasLayer(impactLayers.seismic.main)) {
                    map.addLayer(impactLayers.seismic.main);
                } else if (!visible && map.hasLayer(impactLayers.seismic.main)) {
                    map.removeLayer(impactLayers.seismic.main);
                }
            }
            
            impactLayers.seismic.distances.forEach(layer => {
                if (layer) {
                    if (visible && !map.hasLayer(layer)) {
                        map.addLayer(layer);
                    } else if (!visible && map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                }
            });
            break;
            
        case 'tsunami':
            if (impactLayers.tsunami) {
                if (visible && !map.hasLayer(impactLayers.tsunami)) {
                    map.addLayer(impactLayers.tsunami);
                } else if (!visible && map.hasLayer(impactLayers.tsunami)) {
                    map.removeLayer(impactLayers.tsunami);
                }
            }
            break;
    }
    
    updateLayerCheckbox(layerType, visible);
}

function getBlastType(layer) {
    const radius = layer.getRadius();
    const blastTypes = {
        '50_psi': 'Total Destruction',
        '10_psi': 'Building Collapse', 
        '5_psi': 'Severe Damage',
        '1_psi': 'Window Breakage'
    };
    
    for (const [key, value] of Object.entries(blastTypes)) {
        if (Math.abs(layer.getRadius() - impactLayers.blast.find(l => l.getRadius() === radius)?.getRadius()) < 1) {
            return value;
        }
    }
    
    return 'Unknown';
}

function updateLayerCheckbox(layerType, checked) {
    const checkbox = document.getElementById(`layer-${layerType}`);
    if (checkbox) {
        checkbox.checked = checked;
    }
}

function showAllLayers() {
    console.log('👁️ Showing ALL layers');
    Object.keys(layerVisibility).forEach(layerType => {
        toggleLayerVisibility(layerType, true);
    });
}

function hideAllLayers() {
    console.log('👁️ Hiding ALL layers');
    Object.keys(layerVisibility).forEach(layerType => {
        toggleLayerVisibility(layerType, false);
    });
}

// ORDEN CRÍTICO: Crear capas de mayor a menor tamaño - IA assisted layer ordering
function showAllImpactEffects(impactData, targetType) {
    console.log('🔍 showAllImpactEffects called with:', impactData);
    
    if (!map || !impactLatLng) {
        console.error('❌ Map or impact location not available');
        console.log('Map available:', !!map);
        console.log('Impact location:', impactLatLng);
        return;
    }
    
    clearImpactEffects();
    
    if (!impactData || typeof impactData !== 'object') {
        console.error('❌ Invalid impact data');
        return;
    }
    
    const efectos_impacto = impactData.efectos_impacto;
    const efectos_sismicos = impactData.efectos_sismicos;
    const efectos_tsunami = impactData.efectos_tsunami;
    
    console.log('📊 Impact effects data:', efectos_impacto);
    console.log('📊 Seismic data:', efectos_sismicos);
    console.log('📊 Tsunami data:', efectos_tsunami);
    
    // 1. EFECTOS SÍSMICOS (más grandes primero)
    if (efectos_sismicos && efectos_sismicos.magnitud_momento_Mw) {
        console.log('🌋 Creating seismic effects (LARGEST - BACKGROUND)');
        createAllSeismicEffects(impactLatLng, efectos_sismicos, impactData);
    } else {
        console.log('❌ Skipping seismic effects - no data or no magnitude');
    }
    
    // 2. EFECTOS TSUNAMI (grandes)
    if (efectos_tsunami && efectos_tsunami.likely && targetType === 'water') {
        console.log('🌊 Creating tsunami effects (LARGE)');
        createTsunamiLayer(impactLatLng, efectos_tsunami, targetType);
    }
    
    // 3. EFECTOS BLAST (medianos)
    if (efectos_impacto && efectos_impacto.blast_overpressure_radii_m && typeof efectos_impacto.blast_overpressure_radii_m === 'object') {
        console.log('💨 Creating blast effects (MEDIUM)');
        createAllBlastLayers(impactLatLng, efectos_impacto.blast_overpressure_radii_m);
    }
    
    // 4. EFECTOS TÉRMICOS (pequeños)
    if (efectos_impacto && efectos_impacto.thermal_effects_m && typeof efectos_impacto.thermal_effects_m === 'object') {
        console.log('🔥 Creating thermal effects (SMALL)');
        createAllThermalLayers(impactLatLng, efectos_impacto.thermal_effects_m);
    }
    
    // 5. FIREBALL (más pequeño)
    if (efectos_impacto && efectos_impacto.fireball_radius_m) {
        console.log('🔴 Creating fireball layer (SMALLER)');
        createFireballLayer(impactLatLng, efectos_impacto.fireball_radius_m);
    }
    
    // 6. CRATER (más pequeño - encima de todo)
    if (efectos_impacto && efectos_impacto.crater_diameter_m) {
        console.log('🟤 Creating crater layer (SMALLEST - TOP)');
        createCraterLayer(impactLatLng, efectos_impacto.crater_diameter_m);
    }
    
    applyInitialVisibility();
    
    setTimeout(() => {
        if (map) {
            fitMapToImpactEffects();
            console.log('✅ All impact effects displayed in correct order');
            
            diagnoseAllLayers();
        }
    }, 1000);
}

// Sistema de animaciones térmicas - IA assisted for complex layer management
function createAllThermalLayers(latlng, thermal_effects_m) {
    if (!map || !latlng) {
        console.error('❌ Cannot create thermal layers - map or location missing');
        return;
    }
    
    console.log('🔥 THERMAL LAYER CREATION STARTED - WITH ANIMATION');
    console.log('   Location:', latlng);
    console.log('   Thermal effects data:', thermal_effects_m);
    
    impactLayers.fireball.thermal = [];
    
    if (!thermal_effects_m || typeof thermal_effects_m !== 'object') {
        console.error('❌ Invalid thermal effects data');
        return;
    }
    
    const thermalConfigs = [
        { 
            type: 'lethal', 
            radius: thermal_effects_m.lethal, 
            color: '#FF0000', 
            opacity: 0.35,
            weight: 3,
            label: '💀 Lethal Radiation Zone',
            description: 'Third-degree burns to exposed skin, fatal to most individuals',
            details: '• 100% mortality for exposed persons<br>• Spontaneous combustion of materials<br>• Metal surfaces melt'
        },
        { 
            type: 'burns_3rd', 
            radius: thermal_effects_m.burns_3rd, 
            color: '#FF4500', 
            opacity: 0.30,
            weight: 2,
            label: '🥵 3rd Degree Burns Zone', 
            description: 'Severe burns requiring medical attention',
            details: '• Skin destruction requiring grafts<br>• Wood structures ignite<br>• Severe injuries to survivors'
        },
        { 
            type: 'burns_2nd', 
            radius: thermal_effects_m.burns_2nd, 
            color: '#FF8C00', 
            opacity: 0.25,
            weight: 2,
            label: '😫 2nd Degree Burns Zone',
            description: 'Painful burns with blistering',
            details: '• Blistering of exposed skin<br>• Clothing ignites<br>• Painful but survivable injuries'
        },
        { 
            type: 'ignition', 
            radius: thermal_effects_m.ignition, 
            color: '#FFA500', 
            opacity: 0.20,
            weight: 2,
            label: '🔥 Material Ignition Zone',
            description: 'Combustible materials spontaneously ignite',
            details: '• Paper, fabrics, plastics ignite<br>• Fires spread rapidly<br>• Smoke inhalation risk'
        }
    ];
    
    const sortedConfigs = thermalConfigs
        .filter(config => config.radius && config.radius > 0)
        .sort((a, b) => b.radius - a.radius);
    
    console.log('📊 Thermal layers order (largest to smallest):', 
        sortedConfigs.map(c => `${c.type}: ${c.radius}m`));
    
    let createdCount = 0;
    
    sortedConfigs.forEach((config, index) => {
        console.log(`   Creating ${config.type} circle with radius: ${config.radius}m`);
        
        try {
            const layer = L.circle(latlng, {
                color: config.color,
                fillColor: config.color,
                fillOpacity: config.opacity,
                weight: config.weight,
                radius: 0
            }).bindPopup(`
                <div class="impact-popup thermal-popup">
                    <div class="popup-header" style="background: ${config.color};">
                        <h4><i class="fas fa-radiation"></i> ${config.label}</h4>
                    </div>
                    <div class="popup-content">
                        <div class="popup-section">
                            <strong>Effects Radius:</strong> ${formatNumber(config.radius)}<br>
                            <strong>Impact:</strong> ${config.description}
                        </div>
                        <div class="popup-section">
                            <strong>Specific Effects:</strong><br>
                            ${config.details}
                        </div>
                        <div class="popup-note">
                            <small><i class="fas fa-info-circle"></i> Thermal radiation effects from fireball</small>
                        </div>
                    </div>
                </div>
            `).bindTooltip(`
                <div class="tooltip-content">
                    <strong>${config.label}</strong><br>
                    Radius: ${formatNumber(config.radius)}
                </div>
            `, { permanent: false, direction: 'top', className: 'custom-tooltip' });
            
            if (layerVisibility.fireball) {
                layer.addTo(map);
                console.log(`     ✅ ${config.type} thermal layer ADDED TO MAP (radius: ${config.radius}m)`);
            }
            
            impactLayers.fireball.thermal.push(layer);
            createdCount++;
            
            setTimeout(() => {
                animateCircleExpansion(layer, config.radius, 1800, index * 200);
            }, ANIMATION_CONFIG.delayBetweenLayers * 2 + index * 100);
            
        } catch (error) {
            console.error(`❌ Error creating ${config.type} layer:`, error);
        }
    });
    
    console.log(`✅ Thermal layers creation completed: ${createdCount} layers created with animation`);
}

// Sistema de capas blast con animaciones escalonadas
function createAllBlastLayers(latlng, blast_overpressure_radii_m) {
    if (!map || !latlng) {
        console.error('❌ Cannot create blast layers - map or location missing');
        return;
    }
    
    console.log('💨 BLAST LAYER CREATION - WITH ANIMATION');
    console.log('   Blast effects data:', blast_overpressure_radii_m);
    
    impactLayers.blast = [];
    
    const blastConfigs = [
        {
            psi: '50_psi',
            radius: blast_overpressure_radii_m['50_psi'],
            color: '#FF0000',
            opacity: 0.25,
            label: '💥 Total Destruction Zone (50 PSI)',
            description: 'Reinforced concrete buildings destroyed',
            details: '• All structures demolished<br>• 100% fatalities<br>• Underground shelters may survive<br>• Vehicles obliterated',
            windSpeed: '~2,000 km/h'
        },
        {
            psi: '10_psi', 
            radius: blast_overpressure_radii_m['10_psi'],
            color: '#FF6B35',
            opacity: 0.20,
            label: '🏚️ Building Collapse Zone (10 PSI)',
            description: 'Residential buildings collapse, severe damage to commercial structures',
            details: '• Wood-frame houses destroyed<br>• Concrete buildings severely damaged<br>• 50-75% fatalities<br>• Severe injuries to survivors',
            windSpeed: '~800 km/h'
        },
        {
            psi: '5_psi',
            radius: blast_overpressure_radii_m['5_psi'], 
            color: '#FFA500',
            opacity: 0.15,
            label: '🚧 Severe Damage Zone (5 PSI)',
            description: 'Walls collapse, serious injuries common',
            details: '• Brick walls collapse<br>• Serious injuries from flying debris<br>• 15-30% fatalities<br>• Most survivors injured',
            windSpeed: '~400 km/h'
        },
        {
            psi: '1_psi',
            radius: blast_overpressure_radii_m['1_psi'],
            color: '#FFFF00', 
            opacity: 0.10,
            label: '🪟 Window Breakage Zone (1 PSI)',
            description: 'Windows break, minor injuries from flying glass',
            details: '• Glass windows shatter<br>• Minor cuts from flying glass<br>• <5% fatalities<br>• Temporary hearing loss common',
            windSpeed: '~160 km/h'
        }
    ];
    
    const sortedConfigs = blastConfigs
        .filter(config => config.radius && config.radius > 0)
        .sort((a, b) => b.radius - a.radius);
    
    console.log('📊 Blast layers order (largest to smallest):', 
        sortedConfigs.map(c => `${c.psi}: ${c.radius}m`));
    
    sortedConfigs.forEach((config, index) => {
        if (config.radius && config.radius > 0) {
            console.log(`   Creating ${config.psi} layer: ${config.radius}m (${(config.radius/1000).toFixed(1)} km)`);
            
            try {
                const layer = L.circle(latlng, {
                    color: config.color,
                    fillColor: config.color,
                    fillOpacity: config.opacity,
                    weight: 2,
                    radius: 0,
                    interactive: true
                });
                
                layer.bindPopup(`
                    <div class="impact-popup blast-popup">
                        <div class="popup-header" style="background: ${config.color};">
                            <h4><i class="fas fa-wind"></i> ${config.label}</h4>
                        </div>
                        <div class="popup-content">
                            <div class="popup-section">
                                <strong>Blast Radius:</strong> ${formatNumber(config.radius)}<br>
                                <strong>Overpressure:</strong> ${config.psi.replace('_', ' ')}<br>
                                <strong>Wind Speed:</strong> ${config.windSpeed}
                            </div>
                            <div class="popup-section">
                                <strong>Structural Damage:</strong><br>
                                ${config.details}
                            </div>
                            <div class="popup-note">
                                <small><i class="fas fa-info-circle"></i> Click anywhere in this zone to see other blast levels</small>
                            </div>
                        </div>
                    </div>
                `, {
                    className: `blast-popup-${config.psi}`,
                    autoPan: true,
                    closeOnClick: false,
                    autoClose: false
                });
                
                layer.bindTooltip(`
                    <div class="tooltip-content">
                        <strong>${config.label.split('(')[0].trim()}</strong><br>
                        ${formatNumber(config.radius)}
                    </div>
                `, { 
                    permanent: false, 
                    direction: 'top', 
                    className: 'custom-tooltip',
                    sticky: true
                });
                
                if (layerVisibility.blast) {
                    layer.addTo(map);
                    console.log(`     ✅ ${config.psi} layer ADDED TO MAP (radius: ${config.radius}m)`);
                }
                
                impactLayers.blast.push(layer);
                console.log(`     ✅ ${config.psi} layer created successfully`);
                
                const delay = ANIMATION_CONFIG.delayBetweenLayers * 3 + index * 150;
                setTimeout(() => {
                    animateCircleExpansion(layer, config.radius, 2000, index * 100);
                }, delay);
                
            } catch (error) {
                console.error(`❌ Error creating ${config.psi} layer:`, error);
            }
        } else {
            console.log(`   ⚠️ Skipping ${config.psi} - invalid radius:`, config.radius);
        }
    });
    
    console.log(`✅ Created ${impactLayers.blast.length} blast layers with animation`);
}

function diagnoseBlastLayers() {
    console.log('🔍 BLAST LAYERS DIAGNOSIS:');
    console.log('========================');
    
    if (!impactLayers.blast || impactLayers.blast.length === 0) {
        console.log('❌ No blast layers found');
        return;
    }
    
    impactLayers.blast.forEach((layer, index) => {
        const bounds = layer.getBounds();
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        
        console.log(`Blast Layer ${index + 1}:`);
        console.log(`  - Radius: ${radius}m`);
        console.log(`  - Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);
        console.log(`  - Bounds:`, bounds);
        console.log(`  - On Map: ${map.hasLayer(layer)}`);
        console.log(`  - Interactive: ${layer.options.interactive}`);
    });
    
    console.log('========================');
}

// Sistema sísmico complejo con manejo de datos anidados - IA assisted for data validation
function createAllSeismicEffects(latlng, efectos_sismicos, impactData) {
    if (!map || !latlng) {
        console.error('❌ Cannot create seismic effects - map or location missing');
        return;
    }
    
    console.log('🌋 SEISMIC LAYER CREATION - WITH ANIMATION');
    console.log('   Seismic data received:', efectos_sismicos);
    
    if (!efectos_sismicos) {
        console.error('❌ efectos_sismicos is null or undefined');
        return;
    }
    
    impactLayers.seismic.distances = [];
    
    const { magnitud_momento_Mw, intensidades_regionales } = efectos_sismicos;
    
    if (!intensidades_regionales) {
        console.error('❌ intensidades_regionales is null or undefined');
        return;
    }
    
    if (typeof intensidades_regionales !== 'object') {
        console.error('❌ intensidades_regionales is not an object:', typeof intensidades_regionales);
        return;
    }
    
    if (Object.keys(intensidades_regionales).length === 0) {
        console.error('❌ intensidades_regionales is an empty object');
        return;
    }
    
    console.log('🔍 Keys in intensidades_regionales:', Object.keys(intensidades_regionales));
    
    const distances = Object.keys(intensidades_regionales)
        .map(key => {
            console.log('   Processing key:', key);
            const distanceStr = key.replace('_km', '');
            const distance = parseInt(distanceStr);
            console.log('   Extracted distance:', distance, 'from key:', key);
            return distance;
        })
        .filter(d => !isNaN(d) && d > 0);
    
    console.log('📏 Filtered distances:', distances);
    
    if (distances.length === 0) {
        console.error('❌ No valid seismic distances found after filtering');
        console.log('   Raw keys:', Object.keys(intensidades_regionales));
        return;
    }
    
    let maxDistanceKm = Math.max(...distances);
    console.log('📐 Max distance calculated:', maxDistanceKm, 'km');
    
    const MIN_VISIBLE_DISTANCE_KM = 10;
    if (maxDistanceKm < MIN_VISIBLE_DISTANCE_KM) {
        console.log(`⚠️ Seismic distance too small (${maxDistanceKm}km), increasing to minimum ${MIN_VISIBLE_DISTANCE_KM}km for visibility`);
        maxDistanceKm = MIN_VISIBLE_DISTANCE_KM;
    }
    
    const maxDistanceM = maxDistanceKm * 1000;
    
    console.log(`🎯 Final seismic radius: ${maxDistanceKm} km (${maxDistanceM} m)`);
    console.log(`📊 Seismic magnitude: ${magnitud_momento_Mw} Mw`);
    console.log(`🔢 Number of distance rings: ${distances.length}`);
    
    try {
        console.log('🛠️ Creating seismic main circle...');
        
        impactLayers.seismic.main = L.circle(latlng, {
            color: '#8B7355',
            fillColor: '#A0522D',
            fillOpacity: 0.25,
            weight: 3,
            radius: 0
        }).bindPopup(`
            <div class="impact-popup seismic-popup">
                <div class="popup-header" style="background: #8B7355;">
                    <h4><i class="fas fa-earthquake"></i> Seismic Effects Region</h4>
                </div>
                <div class="popup-content">
                    <div class="popup-section">
                        <strong>Magnitude:</strong> ${magnitud_momento_Mw} Mw<br>
                        <strong>Felt Radius:</strong> ${formatNumber(maxDistanceM)}<br>
                        <strong>Maximum Distance:</strong> ${maxDistanceKm} km<br>
                        <strong>Energy:</strong> ${(impactData.energia.energia_joules / 1e15).toFixed(2)} × 10¹⁵ J
                    </div>
                    <div class="popup-section">
                        <strong>Seismic Characteristics:</strong><br>
                        • Surface waves and body waves<br>
                        • Duration: 30-300 seconds<br>
                        • Ground acceleration effects<br>
                        • Liquefaction in susceptible areas
                    </div>
                    <div class="popup-note">
                        <small><i class="fas fa-info-circle"></i> Ground shaking from impact energy conversion</small>
                    </div>
                </div>
            </div>
        `).bindTooltip(`
            <div class="tooltip-content">
                <strong>🏔️ Seismic Effects</strong><br>
                Felt up to ${formatNumber(maxDistanceM)}<br>
                ${magnitud_momento_Mw} Mw
            </div>
        `, { permanent: false, direction: 'top', className: 'custom-tooltip' });
        
        console.log('✅ Seismic main circle created successfully');
        console.log('📍 Circle center:', latlng);
        console.log('📏 Circle radius:', maxDistanceM, 'meters');
        
        if (layerVisibility.seismic) {
            console.log('🗺️ Adding seismic main layer to map...');
            impactLayers.seismic.main.addTo(map);
            console.log('✅ Seismic main layer ADDED TO MAP');
        } else {
            console.log('👁️ Seismic layer visibility is OFF, not adding to map');
        }
        
        setTimeout(() => {
            animateCircleExpansion(impactLayers.seismic.main, maxDistanceM, 3000, 500);
        }, ANIMATION_CONFIG.delayBetweenLayers * 4);
        
        console.log('🛠️ Creating seismic distance rings in correct order...');
        
        const sortedDistances = Object.entries(intensidades_regionales)
            .filter(([distanceKey, data]) => {
                const distanceKm = parseInt(distanceKey.replace('_km', ''));
                return !isNaN(distanceKm) && distanceKm > 0;
            })
            .sort(([keyA], [keyB]) => {
                const distA = parseInt(keyA.replace('_km', ''));
                const distB = parseInt(keyB.replace('_km', ''));
                return distB - distA;
            });
        
        console.log('📊 Seismic rings order (largest to smallest):', 
            sortedDistances.map(([key]) => `${key}: ${parseInt(key.replace('_km', ''))}km`));
        
        sortedDistances.forEach(([distanceKey, data], index) => {
            console.log('   Processing distance:', distanceKey);
            
            const distanceKm = parseInt(distanceKey.replace('_km', ''));
            const distanceM = distanceKm * 1000;
            
            console.log(`   Creating seismic ring at ${distanceKm}km - MMI: ${data.mmi || 'N/A'}`);
            
            const ring = L.circle(latlng, {
                color: '#8B7355',
                fillColor: 'transparent',
                fillOpacity: 0,
                weight: 2,
                dashArray: '5, 5',
                radius: 0
            }).bindPopup(`
                <div class="impact-popup seismic-distance-popup">
                    <div class="popup-header" style="background: #8B7355;">
                        <h4><i class="fas fa-map-marker-alt"></i> ${distanceKey.replace('_', ' ')} Effects</h4>
                    </div>
                    <div class="popup-content">
                        <div class="popup-section">
                            <strong>Distance from Impact:</strong> ${distanceKey.replace('_', ' ')}<br>
                            <strong>Intensity (MMI):</strong> ${data.mmi || 'N/A'}<br>
                            <strong>Peak Ground Acceleration:</strong> ${data.pga_g || 'N/A'}g<br>
                            <strong>Description:</strong> ${data.description || 'Seismic effects at this distance'}
                        </div>
                        <div class="popup-section">
                            <strong>Typical Effects:</strong><br>
                            ${getSeismicEffectsDescription(data.mmi)}
                        </div>
                    </div>
                </div>
            `);
            
            if (layerVisibility.seismic) {
                ring.addTo(map);
                console.log(`   ✅ Seismic ring at ${distanceKm}km ADDED TO MAP`);
            }
            
            impactLayers.seismic.distances.push(ring);
            
            setTimeout(() => {
                animateCircleExpansion(ring, distanceM, 2500, index * 200);
            }, ANIMATION_CONFIG.delayBetweenLayers * 5 + index * 100);
        });
        
        console.log(`✅ Created ${impactLayers.seismic.distances.length} seismic distance rings with animation`);
        
    } catch (error) {
        console.error('❌ Error creating seismic effects:', error);
        console.error('Error stack:', error.stack);
    }
}

function diagnoseSeismicData(efectos_sismicos) {
    console.log('🔍 SEISMIC DATA DIAGNOSIS:');
    console.log('========================');
    
    if (!efectos_sismicos) {
        console.log('❌ No seismic data provided');
        return;
    }
    
    console.log('Magnitude:', efectos_sismicos.magnitud_momento_Mw);
    
    if (efectos_sismicos.intensidades_regionales) {
        const distances = Object.keys(efectos_sismicos.intensidades_regionales)
            .map(key => parseInt(key.replace('_km', '')))
            .filter(d => !isNaN(d));
        
        console.log('Distances found:', distances);
        console.log('Max distance:', Math.max(...distances), 'km');
        console.log('Min distance:', Math.min(...distances), 'km');
        console.log('Number of distances:', distances.length);
        
        Object.entries(efectos_sismicos.intensidades_regionales).forEach(([distance, data]) => {
            console.log(`  ${distance}: MMI ${data.mmi}, PGA ${data.pga_g}g`);
        });
        
        const maxDist = Math.max(...distances);
        if (maxDist < 10) {
            console.log('⚠️ WARNING: Maximum seismic distance is very small, may not be visible on map');
        }
    } else {
        console.log('❌ No intensity data');
    }
    
    console.log('========================');
}

function getSeismicEffectsDescription(mmi) {
    const mmiDescriptions = {
        'I': '• Not felt<br>• No damage',
        'II': '• Felt by few people<br>• No damage',
        'III': '• Felt noticeably indoors<br>• Hanging objects swing',
        'IV': '• Felt by many indoors<br>• Windows and doors rattle',
        'V': '• Felt by nearly everyone<br>• Some windows break<br>• Unstable objects overturned',
        'VI': '• Felt by all<br>• Light furniture moves<br>• Some plaster falls',
        'VII': '• Difficult to stand<br>• Furniture broken<br>• Damage to weak structures',
        'VIII': '• Steering of cars affected<br>• Substantial building damage<br>• Chimneys fall',
        'IX': '• General panic<br>• Buildings shift off foundations<br>• Underground pipes broken',
        'X': '• Most masonry structures destroyed<br>• Rails bent<br>• Landslides',
        'XI': '• Few structures remain standing<br>• Bridges destroyed<br>• Broad fissures in ground',
        'XII': '• Total destruction<br>• Waves seen on ground surfaces<br>• Objects thrown into air'
    };
    
    return mmiDescriptions[mmi] || '• Seismic effects vary by local conditions';
}

function createCraterLayer(latlng, diameter_m) {
    const radius_m = diameter_m / 2;
    
    impactLayers.crater = L.circle(latlng, {
        color: '#8B4513',
        fillColor: '#A0522D',
        fillOpacity: 0.7,
        weight: 3,
        radius: 0
    }).bindPopup(`
        <div class="impact-popup crater-popup">
            <div class="popup-header" style="background: #8B4513;">
                <h4><i class="fas fa-mountain"></i> Impact Crater</h4>
            </div>
            <div class="popup-content">
                <div class="popup-section">
                    <strong>Diameter:</strong> ${formatNumber(diameter_m)}<br>
                    <strong>Depth:</strong> ${formatNumber(diameter_m * 0.22)}<br>
                    <strong>Type:</strong> Simple bowl-shaped crater
                </div>
                <div class="popup-section">
                    <strong>Formation:</strong><br>
                    • Instantaneous excavation by impact energy<br>
                    • Ejecta blanket extends 2-3x crater radius<br>
                    • Shock metamorphism of bedrock
                </div>
                <div class="popup-note">
                    <small><i class="fas fa-info-circle"></i> Permanent geological feature</small>
                </div>
            </div>
        </div>
    `).bindTooltip(`
        <div class="tooltip-content">
            <strong>🟤 Impact Crater</strong><br>
            ${formatNumber(diameter_m)} diameter
        </div>
    `, { permanent: false, direction: 'top', className: 'custom-tooltip' });
    
    if (layerVisibility.crater) {
        impactLayers.crater.addTo(map);
        console.log('✅ Crater layer ADDED TO MAP');
    }
    
    setTimeout(() => {
        animateCircleExpansion(impactLayers.crater, radius_m, 1500, 200);
    }, ANIMATION_CONFIG.delayBetweenLayers * 0);
    
    console.log(`✅ Crater layer created: ${radius_m}m radius (animated)`);
}

function createFireballLayer(latlng, radius_m) {
    impactLayers.fireball.main = L.circle(latlng, {
        color: '#FF4500',
        fillColor: '#FF6347',
        fillOpacity: 0.5,
        weight: 2,
        radius: 0
    }).bindPopup(`
        <div class="impact-popup fireball-popup">
            <div class="popup-header" style="background: #FF4500;">
                <h4><i class="fas fa-fire"></i> Initial Fireball</h4>
            </div>
            <div class="popup-content">
                <div class="popup-section">
                    <strong>Radius:</strong> ${formatNumber(radius_m)}<br>
                    <strong>Duration:</strong> 1-10 seconds<br>
                    <strong>Temperature:</strong> 5,000-10,000°C
                </div>
                <div class="popup-section">
                    <strong>Characteristics:</strong><br>
                    • Vaporization of impactor and target material<br>
                    • Intense thermal radiation<br>
                    • Shock wave formation<br>
                    • Mushroom cloud development
                </div>
                <div class="popup-note">
                    <small><i class="fas fa-info-circle"></i> Initial energy release phase</small>
                </div>
            </div>
        </div>
    `).bindTooltip(`
        <div class="tooltip-content">
            <strong>🔥 Initial Fireball</strong><br>
            ${formatNumber(radius_m)} radius
        </div>
    `, { permanent: false, direction: 'top', className: 'custom-tooltip' });
    
    if (layerVisibility.fireball) {
        impactLayers.fireball.main.addTo(map);
        console.log('✅ Fireball layer ADDED TO MAP');
    }
    
    setTimeout(() => {
        animateCircleExpansion(impactLayers.fireball.main, radius_m, 1200, 400);
    }, ANIMATION_CONFIG.delayBetweenLayers * 1);
    
    console.log(`✅ Fireball layer created: ${radius_m}m radius (animated)`);
}

function createTsunamiLayer(latlng, tsunamiData, targetType) {
    if (targetType !== 'water') return;
    
    const tsunamiRadius = tsunamiData.max_wave_height_m ? 500000 : 500000;
    
    impactLayers.tsunami = L.circle(latlng, {
        color: '#1E90FF',
        fillColor: '#4169E1',
        fillOpacity: 0.3,
        weight: 2,
        radius: 0
    }).bindPopup(`
        <div class="impact-popup tsunami-popup">
            <div class="popup-header" style="background: #1E90FF;">
                <h4><i class="fas fa-water"></i> Tsunami Effects Zone</h4>
            </div>
            <div class="popup-content">
                <div class="popup-section">
                    <strong>Affected Radius:</strong> ${formatNumber(tsunamiRadius)}<br>
                    <strong>Max Wave Height:</strong> ${tsunamiData.max_wave_height_m || 'N/A'} m<br>
                    <strong>Classification:</strong> ${tsunamiData.classification || 'Regional tsunami'}
                </div>
                <div class="popup-section">
                    <strong>Coastal Impact:</strong><br>
                    • Run-up heights 2-3x deep water amplitude<br>
                    • Inundation of low-lying areas<br>
                    • Port and coastal infrastructure damage<br>
                    • Saltwater contamination
                </div>
                <div class="popup-note">
                    <small><i class="fas fa-info-circle"></i> Wave effects propagate across ocean basin</small>
                </div>
            </div>
        </div>
    `).bindTooltip(`
        <div class="tooltip-content">
            <strong>🌊 Tsunami Zone</strong><br>
            ${formatNumber(tsunamiRadius)} radius
        </div>
    `, { permanent: false, direction: 'top', className: 'custom-tooltip' });
    
    if (layerVisibility.tsunami) {
        impactLayers.tsunami.addTo(map);
        console.log('✅ Tsunami layer ADDED TO MAP');
    }
    
    setTimeout(() => {
        animateCircleExpansion(impactLayers.tsunami, tsunamiRadius, 3500, 300);
    }, ANIMATION_CONFIG.delayBetweenLayers * 6);
    
    console.log(`✅ Tsunami layer created: ${tsunamiRadius}m radius (animated)`);
}

function applyInitialVisibility() {
    console.log('👀 Applying initial layer visibility');
    console.log('✅ Layers already added to map during creation');
}

function fitMapToImpactEffects() {
    if (!map) {
        console.error('❌ Cannot fit map - no map available');
        return;
    }
    
    console.log('🗺️ Starting map fit process...');
    
    const allLayers = [];
    
    if (impactLayers.crater && map.hasLayer(impactLayers.crater)) {
        allLayers.push(impactLayers.crater);
        console.log('   ✅ Crater layer added to fit');
    }
    
    if (impactLayers.fireball.main && map.hasLayer(impactLayers.fireball.main)) {
        allLayers.push(impactLayers.fireball.main);
        console.log('   ✅ Fireball layer added to fit');
    }
    
    impactLayers.fireball.thermal.forEach((layer, index) => {
        if (layer && map.hasLayer(layer)) {
            allLayers.push(layer);
            console.log(`   ✅ Thermal layer ${index + 1} added to fit`);
        }
    });
    
    impactLayers.blast.forEach((layer, index) => {
        if (layer && map.hasLayer(layer)) {
            allLayers.push(layer);
            console.log(`   ✅ Blast layer ${index + 1} added to fit`);
        }
    });
    
    if (impactLayers.seismic.main && map.hasLayer(impactLayers.seismic.main)) {
        allLayers.push(impactLayers.seismic.main);
        console.log('   ✅ Seismic main layer added to fit');
    }
    
    impactLayers.seismic.distances.forEach((layer, index) => {
        if (layer && map.hasLayer(layer)) {
            allLayers.push(layer);
            console.log(`   ✅ Seismic distance ring ${index + 1} added to fit`);
        }
    });
    
    if (impactLayers.tsunami && map.hasLayer(impactLayers.tsunami)) {
        allLayers.push(impactLayers.tsunami);
        console.log('   ✅ Tsunami layer added to fit');
    }
    
    console.log(`🗺️ Total layers to fit: ${allLayers.length}`);
    
    if (allLayers.length > 0) {
        try {
            const group = L.featureGroup(allLayers);
            const bounds = group.getBounds();
            
            console.log('📏 Map bounds calculated:', {
                northEast: bounds.getNorthEast(),
                southWest: bounds.getSouthWest(),
                center: bounds.getCenter()
            });
            
            map.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 10
            });
            
            console.log('✅ Map fitted to impact effects successfully');
            
            setTimeout(() => {
                map.invalidateSize();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error fitting map to bounds:', error);
            map.setView(impactLatLng, 8);
        }
    } else {
        console.log('⚠️ No visible layers to fit map to');
        map.setView(impactLatLng, 10);
    }
}

function diagnoseAllLayers() {
    console.log('🔍 COMPREHENSIVE LAYER DIAGNOSIS:');
    console.log('================================');
    
    const layerTypes = ['crater', 'fireball', 'blast', 'seismic', 'tsunami'];
    
    layerTypes.forEach(layerType => {
        console.log(`\n📊 ${layerType.toUpperCase()} LAYERS:`);
        
        switch(layerType) {
            case 'crater':
                console.log(`   - Created: ${!!impactLayers.crater}`);
                console.log(`   - On map: ${impactLayers.crater ? map.hasLayer(impactLayers.crater) : false}`);
                if (impactLayers.crater) {
                    console.log(`   - Radius: ${impactLayers.crater.getRadius()}m`);
                }
                break;
                
            case 'fireball':
                console.log(`   - Main created: ${!!impactLayers.fireball.main}`);
                console.log(`   - Main on map: ${impactLayers.fireball.main ? map.hasLayer(impactLayers.fireball.main) : false}`);
                console.log(`   - Thermal layers: ${impactLayers.fireball.thermal.length}`);
                
                impactLayers.fireball.thermal.forEach((layer, index) => {
                    console.log(`     Thermal ${index + 1}:`);
                    console.log(`       - Created: ${!!layer}`);
                    console.log(`       - On map: ${layer ? map.hasLayer(layer) : false}`);
                    if (layer) {
                        console.log(`       - Radius: ${layer.getRadius()}m`);
                    }
                });
                break;
                
            case 'blast':
                console.log(`   - Total blast layers: ${impactLayers.blast.length}`);
                impactLayers.blast.forEach((layer, index) => {
                    console.log(`     Blast ${index + 1}:`);
                    console.log(`       - Created: ${!!layer}`);
                    console.log(`       - On map: ${layer ? map.hasLayer(layer) : false}`);
                    if (layer) {
                        console.log(`       - Radius: ${layer.getRadius()}m`);
                    }
                });
                break;
                
            case 'seismic':
                console.log(`   - Main created: ${!!impactLayers.seismic.main}`);
                console.log(`   - Main on map: ${impactLayers.seismic.main ? map.hasLayer(impactLayers.seismic.main) : false}`);
                console.log(`   - Distance rings: ${impactLayers.seismic.distances.length}`);
                break;
                
            case 'tsunami':
                console.log(`   - Created: ${!!impactLayers.tsunami}`);
                console.log(`   - On map: ${impactLayers.tsunami ? map.hasLayer(impactLayers.tsunami) : false}`);
                break;
        }
    });
    
    console.log('\n👁️ LAYER VISIBILITY STATUS:');
    Object.keys(layerVisibility).forEach(layerType => {
        console.log(`   ${layerType}: ${layerVisibility[layerType] ? 'VISIBLE' : 'HIDDEN'}`);
    });
    
    console.log('================================');
}

function clearAllEffectsAndReset() {
    console.log('🔄 Clearing ALL effects and resetting state');
    
    if (impactMarker) {
        map.removeLayer(impactMarker);
        impactMarker = null;
    }
    
    impactLatLng = null;
    
    clearImpactEffects();
    
    impactLayers = {
        crater: null,
        fireball: {
            main: null,
            thermal: []
        },
        blast: [],
        seismic: {
            main: null,
            distances: []
        },
        tsunami: null
    };
    
    layerVisibility = {
        crater: true,
        fireball: true,
        blast: true,
        seismic: true,
        tsunami: true
    };
    
    Object.keys(layerVisibility).forEach(layerType => {
        updateLayerCheckbox(layerType, true);
    });
    
    const initialMessage = document.getElementById('initialMessage');
    if (initialMessage) {
        initialMessage.style.display = 'block';
    }
    
    console.log('✅ Complete reset completed');
}

window.showAllImpactEffects = showAllImpactEffects;
window.clearImpactEffects = clearImpactEffects;
window.toggleLayerVisibility = toggleLayerVisibility;
window.showAllLayers = showAllLayers;
window.hideAllLayers = hideAllLayers;
window.diagnoseAllLayers = diagnoseAllLayers;
window.clearAllEffectsAndReset = clearAllEffectsAndReset;