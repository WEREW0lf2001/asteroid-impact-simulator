let asteroidData = [];

async function loadAsteroidsFromBackend() {
  try {
    console.log('Loading asteroids from backend...');
    
    const data = await getAsteroids();
    
    if (!data.asteroides) {
      throw new Error('Invalid response format: missing "asteroides" field');
    }
    
    // Mapea los datos del backend al formato esperado por el frontend
    asteroidData = data.asteroides.map((asteroid, index) => {
      const diameter = asteroid.diametro_m || 100;
      const speedKmH = asteroid.velocidad_km_h || 61200; // Valor por defecto si no hay dato
      const speedKmS = speedKmH / 3600; // Convertir km/h a km/s
      
      return {
        id: asteroid.nombre?.replace(/\s+/g, '').toLowerCase() || `asteroid-${index}`,
        name: asteroid.nombre || `Unknown Asteroid ${index + 1}`,
        details: asteroid.peligroso ? "Potentially Hazardous Asteroid" : "Near Earth Object",
        source: "NASA JPL",
        diameter_m: diameter,
        speed_km_s: Math.round(speedKmS * 10) / 10, // Redondear a 1 decimal
        angle_deg: 45,
        peligroso: asteroid.peligroso || false,
        fecha_aproximacion: asteroid.fecha_aproximacion || null,
        distancia_km: asteroid.distancia_km || null
      };
    });
    
    if (asteroidData.length === 0) {
      console.warn('No asteroids received from backend, using fallback data');
      asteroidData = getFallbackAsteroidData();
    }
    
    console.log(`✅ Loaded ${asteroidData.length} asteroids from backend`);
    console.log('📊 First asteroid data:', asteroidData[0]);
    return asteroidData;
  } catch (error) {
    console.error('Error loading asteroids from backend:', error);
    asteroidData = getFallbackAsteroidData();
    return asteroidData;
  }
}

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