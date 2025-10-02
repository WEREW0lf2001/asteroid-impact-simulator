let asteroidData = [];

// Función para cargar asteroides desde el backend
async function loadAsteroidsFromBackend() {
  try {
    console.log('Loading asteroids from backend...');
    
    // Usar la nueva función específica para asteroides
    const data = await getAsteroids();
    
    // Verificar la estructura de la respuesta
    if (!data.asteroides) {
      throw new Error('Invalid response format: missing "asteroides" field');
    }
    
    // Mapear los datos del backend al formato esperado por el frontend
    asteroidData = data.asteroides.map((asteroid, index) => {
      return {
        id: asteroid.nombre?.replace(/\s+/g, '').toLowerCase() || `asteroid-${index}`,
        name: asteroid.nombre || `Unknown Asteroid ${index + 1}`,
        details: asteroid.peligroso ? "Potentially Hazardous Asteroid" : "Near Earth Object",
        source: "NASA JPL",
        diameter_m: asteroid.diametro_m || 100,
        speed_km_s: asteroid.velocidad_km_h ? (asteroid.velocidad_km_h / 3600) : 17,
        angle_deg: 45,
        peligroso: asteroid.peligroso || false,
        fecha_aproximacion: asteroid.fecha_aproximacion || null,
        distancia_km: asteroid.distancia_km || null
      };
    });
    
    // Si no hay asteroides, usar datos de ejemplo
    if (asteroidData.length === 0) {
      console.warn('No asteroids received from backend, using fallback data');
      asteroidData = getFallbackAsteroidData();
    }
    
    console.log(`Loaded ${asteroidData.length} asteroids from backend`);
    return asteroidData;
  } catch (error) {
    console.error('Error loading asteroids from backend:', error);
    // Usar datos de respaldo si el backend falla
    asteroidData = getFallbackAsteroidData();
    return asteroidData;
  }
}

// Datos de respaldo en caso de que el backend falle
function getFallbackAsteroidData() {
  return [
    {
      id: "fallback1",
      name: "2023 TL",
      details: "Near Earth Object",
      source: "NASA JPL",
      diameter_m: 150,
      speed_km_s: 15,
      angle_deg: 45,
      peligroso: false
    },
    {
      id: "fallback2",
      name: "2024 AB",
      details: "Potentially Hazardous",
      source: "NASA JPL",
      diameter_m: 320,
      speed_km_s: 18,
      angle_deg: 45,
      peligroso: true
    }
  ];
}