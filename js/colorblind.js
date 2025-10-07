// Sistema de modo daltónico con filtros CSS
let colorblindMode = false;

// Filtros CSS para diferentes tipos de daltonismo
const colorblindFilters = {
    // Protanopia (falta de receptores rojos)
    protanopia: `
        /* Filtro para protanopia */
        filter: url('#protanopia-filter');
    `,
    // Deuteranopia (falta de receptores verdes)  
    deuteranopia: `
        /* Filtro para deuteranopia */
        filter: url('#deuteranopia-filter');
    `,
    // Tritanopia (falta de receptores azules)
    tritanopia: `
        /* Filtro para tritanopia */
        filter: url('#tritanopia-filter');
    `,
    // Filtro general para daltonismo rojo-verde (el más común)
    general: `
        /* Filtro general para daltonismo */
        filter: hue-rotate(180deg) saturate(2) brightness(1.1);
    `
};

// Función principal para activar/desactivar modo daltónico
function toggleColorblindMode() {
    colorblindMode = !colorblindMode;
    
    const statusElement = document.getElementById('colorblindStatus');
    const button = document.getElementById('colorblindToggle');
    
    if (colorblindMode) {
        // ACTIVAR MODO DALTONISMO
        statusElement.textContent = 'ON';
        button.classList.add('active');
        document.body.classList.add('colorblind-mode');
        applyColorblindFilter();
        console.log('🎨 Modo daltónico ACTIVADO');
    } else {
        // DESACTIVAR MODO DALTONISMO
        statusElement.textContent = 'OFF';
        button.classList.remove('active');
        document.body.classList.remove('colorblind-mode');
        removeColorblindFilter();
        console.log('🎨 Modo daltónico DESACTIVADO');
    }
    
    // Guardar preferencia
    localStorage.setItem('colorblindMode', colorblindMode);
}

// Aplicar filtro daltónico
function applyColorblindFilter() {
    // Crear elemento style si no existe
    let styleElement = document.getElementById('colorblind-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'colorblind-styles';
        document.head.appendChild(styleElement);
    }
    
    // Aplicar filtros CSS
    styleElement.textContent = `
        /* FILTROS PARA MODO DALTONISMO */
        .colorblind-mode #map .leaflet-layer,
        .colorblind-mode #map .leaflet-overlay-pane,
        .colorblind-mode #map .leaflet-marker-pane {
            filter: hue-rotate(180deg) saturate(1.8) contrast(1.2) brightness(1.1);
        }
        
        .colorblind-mode .asteroid-slide.selected {
            background: rgba(0, 100, 200, 0.1) !important;
            border: 2px solid #0064c8 !important;
        }
        
        .colorblind-mode .hazard-indicator {
            background: #ff4444 !important;
            animation: pulse 1.5s infinite;
        }
        
        /* Mejorar contraste de texto */
        .colorblind-mode .result-label {
            font-weight: 700 !important;
            color: #2c3e50 !important;
        }
        
        .colorblind-mode .result-value {
            font-weight: 600 !important;
            color: #34495e !important;
        }
        
        /* Botones más contrastados */
        .colorblind-mode button:not(.accessibility-btn) {
            background: #2c3e50 !important;
        }
        
        .colorblind-mode button:hover:not(.accessibility-btn) {
            background: #34495e !important;
        }
        
        .colorblind-mode .accessibility-btn.active {
            background: #e74c3c !important;
            border-color: #e74c3c !important;
            box-shadow: 0 0 20px rgba(231, 76, 60, 0.4) !important;
        }
        
        /* Efecto de pulsación para indicar cambio */
        @keyframes colorblindPulse {
            0% { filter: hue-rotate(0deg) saturate(1); }
            50% { filter: hue-rotate(90deg) saturate(1.5); }
            100% { filter: hue-rotate(180deg) saturate(1.8); }
        }
        
        .colorblind-mode #map {
            animation: colorblindPulse 0.5s ease-in-out;
        }
    `;
}

// Remover filtro daltónico
function removeColorblindFilter() {
    const styleElement = document.getElementById('colorblind-styles');
    if (styleElement) {
        styleElement.remove();
    }
}

// Cargar preferencia guardada al iniciar
function loadColorblindPreference() {
    const saved = localStorage.getItem('colorblindMode');
    if (saved === 'true') {
        colorblindMode = true;
        const statusElement = document.getElementById('colorblindStatus');
        const button = document.getElementById('colorblindToggle');
        
        if (statusElement && button) {
            statusElement.textContent = 'ON';
            button.classList.add('active');
            document.body.classList.add('colorblind-mode');
            applyColorblindFilter();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Inicializando sistema de accesibilidad...');
    
    // Agregar event listener al botón
    const toggleButton = document.getElementById('colorblindToggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleColorblindMode);
        console.log('✅ Botón de modo daltónico configurado');
    }
    
    // Cargar preferencia guardada
    loadColorblindPreference();
});

// Hacer función disponible globalmente
window.toggleColorblindMode = toggleColorblindMode;