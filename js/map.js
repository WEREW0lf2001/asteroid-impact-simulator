// Inicializar mapa con más controles
function initializeMap() {
  try {
    // Verificar que el contenedor del mapa exista
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return null;
    }

    // Crear el mapa
    const map = L.map('map').setView([20, 0], 2);
    
    // Añadir capa de tiles con control de errores
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXAgRXJyb3I8L3RleHQ+PC9zdmc+'
    }).addTo(map);

    // Forzar redimensionamiento del mapa
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    console.log('Map initialized successfully');
    return map;
  } catch (error) {
    console.error('Error initializing map:', error);
    return null;
  }
}

// Variables globales
let map = null;
let impactLatLng = null;
let impactMarker = null;

// Inicializar el mapa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  map = initializeMap();
  
  if (!map) {
    console.error('Failed to initialize map');
    // Mostrar mensaje de error en el contenedor del mapa
    document.getElementById('map').innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; color: #666; font-family: Arial, sans-serif;">
        <div style="text-align: center;">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px; color: #d32f2f;"></i>
          <h3>Error loading map</h3>
          <p>Please check your internet connection and try again.</p>
        </div>
      </div>
    `;
    return;
  }

  // Selección de punto de impacto
  map.on('click', function (e) {
    impactLatLng = e.latlng;
    
    // Eliminar marcador anterior si existe
    if (impactMarker) {
      map.removeLayer(impactMarker);
    }
    
    // Crear marcador personalizado
    impactMarker = L.marker(impactLatLng, {
      icon: L.divIcon({
        className: 'impact-marker',
        iconSize: [20, 20],
        html: '<div style="width:100%;height:100%;border-radius:50%;background-color:#242f31;"></div>'
      })
    }).addTo(map)
      .bindPopup("<strong>Impact Location</strong><br>Lat: " + impactLatLng.lat.toFixed(4) + "°<br>Lng: " + impactLatLng.lng.toFixed(4) + "°")
      .openPopup();
      
    // Ocultar mensaje inicial si está visible
    const initialMessage = document.getElementById('initialMessage');
    if (initialMessage) {
      initialMessage.style.display = 'none';
    }
  });

  // Redimensionar mapa cuando cambie el tamaño de la ventana
  window.addEventListener('resize', function() {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  });
});

// Función para obtener la instancia del mapa
function getMap() {
  return map;
}