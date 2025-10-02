// Configuración de APIs y endpoints
const API_CONFIG = {
    // URL base del backend Django
    BASE_URL: 'http://127.0.0.1:8000',
    
    // Endpoints
    ENDPOINTS: {
        ASTEROIDS: '/api/asteroides/',
        IMPACT_SIMULATION: '/api/impacto/'
    },
    
    // Headers para las peticiones
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Función para construir URLs completas
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + endpoint;
}

// Función para hacer peticiones GET con manejo de errores y CORS
async function apiRequest(url, options = {}) {
    try {
        console.log('Making API request to:', url);
        
        const config = {
            method: 'GET',
            mode: 'cors', // Important for CORS
            credentials: 'omit', // or 'same-origin' if you need cookies
            headers: {
                ...API_CONFIG.HEADERS
            },
            ...options
        };

        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        
        // Provide more specific error messages for CORS
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Network error or CORS issue. Check if the backend server is running and CORS is configured.');
        }
        
        throw error;
    }
}

// Función específica para obtener asteroides
async function getAsteroids(startDate = null, endDate = null) {
    let url = getApiUrl(API_CONFIG.ENDPOINTS.ASTEROIDS);
    
    // Agregar parámetros de fecha si se proporcionan
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    return await apiRequest(url);
}

// Función específica para simular impacto
async function simulateImpact(params) {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.IMPACT_SIMULATION);
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;
    
    return await apiRequest(fullUrl);
}