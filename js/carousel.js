// Variables del carrusel
let currentSlide = 0;
let selectedAsteroid = '';

// Inicializar carrusel con datos del backend
async function initCarousel() {
  // Cargar asteroides del backend
  await loadAsteroidsFromBackend();
  
  const track = document.getElementById('asteroidTrack');
  const dots = document.getElementById('carouselDots');
  
  // Limpiar contenido existente y OCULTAR los dots
  track.innerHTML = '';
  dots.style.display = 'none'; // Ocultar los dots
  
  // Verificar que hay asteroides
  if (asteroidData.length === 0) {
    track.innerHTML = '<div class="asteroid-slide"><p>No asteroids available</p></div>';
    return;
  }
  
  selectedAsteroid = asteroidData[0].id;
  
  // Generar slides
  asteroidData.forEach((asteroid, index) => {
    const slide = document.createElement('div');
    slide.className = `asteroid-slide ${index === 0 ? 'selected' : ''}`;
    slide.setAttribute('data-index', index);
    
    // Añadir indicador de asteroide peligroso
    const hazardIndicator = asteroid.peligroso ? 
      '<div class="hazard-indicator" title="Potentially Hazardous Asteroid"><i class="fas fa-exclamation-triangle"></i></div>' : 
      '';
    
    slide.innerHTML = `
      <div class="asteroid-visual">
        <img src="images/asteroide.gif" alt="${asteroid.name}" class="asteroid-image">
        ${hazardIndicator}
      </div>
      <div class="asteroid-info">
        <div class="asteroid-name">${asteroid.name}</div>
        <div class="asteroid-details">${asteroid.details}</div>
        <div class="asteroid-details">Diameter: ${Math.round(asteroid.diameter_m)} m</div>
        <div class="asteroid-source">${asteroid.source}</div>
      </div>
    `;
    track.appendChild(slide);
    
    // Evento click en slide
    slide.addEventListener('click', () => {
      goToSlide(index);
    });
  });
  
  updateCarousel();
}

// Navegar a slide específico
function goToSlide(index) {
  currentSlide = index;
  selectedAsteroid = asteroidData[index].id;
  
  // Actualizar controles deslizantes con los valores del asteroide seleccionado
  const asteroid = asteroidData[index];
  diameter = asteroid.diameter_m;
  speed = asteroid.speed_km_s;
  angle = asteroid.angle_deg;
  
  document.getElementById('diameterSlider').value = diameter;
  document.getElementById('speedSlider').value = speed;
  document.getElementById('angleSlider').value = angle;
  
  updateSliderValues();
  updateCarousel();
}

// Actualizar carrusel
function updateCarousel() {
  const track = document.getElementById('asteroidTrack');
  const slides = document.querySelectorAll('.asteroid-slide');
  
  // Mover track
  if (track) {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
  
  // Actualizar slides seleccionados
  slides.forEach((slide, index) => {
    if (slide.classList) {
      slide.classList.toggle('selected', index === currentSlide);
    }
  });
  
  // Actualizar botones de navegación
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (prevBtn) prevBtn.disabled = currentSlide === 0;
  if (nextBtn) nextBtn.disabled = currentSlide === asteroidData.length - 1;
}