let currentSlide = 0;
let selectedAsteroid = '';

// Inicializar carrusel con datos del backend
async function initCarousel() {
  await loadAsteroidsFromBackend();
  
  const track = document.getElementById('asteroidTrack');
  const dots = document.getElementById('carouselDots');
  
  track.innerHTML = '';
  dots.style.display = 'none';
  
  if (asteroidData.length === 0) {
    track.innerHTML = '<div class="asteroid-slide"><p>No asteroids available</p></div>';
    return;
  }
  
  selectedAsteroid = asteroidData[0].id;
  
  updateSlidersWithAsteroidData(asteroidData[0]);
  
  asteroidData.forEach((asteroid, index) => {
    const slide = document.createElement('div');
    slide.className = `asteroid-slide ${index === 0 ? 'selected' : ''}`;
    slide.setAttribute('data-index', index);
    
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
    
    slide.addEventListener('click', () => {
      goToSlide(index);
    });
  });
  
  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById('asteroidTrack');
  const slides = document.querySelectorAll('.asteroid-slide');

  if (track) {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
  
  slides.forEach((slide, index) => {
    if (slide.classList) {
      slide.classList.toggle('selected', index === currentSlide);
    }
  });
  
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (prevBtn) prevBtn.disabled = currentSlide === 0;
  if (nextBtn) nextBtn.disabled = currentSlide === asteroidData.length - 1;
}

//Actualizar sliders con datos del asteroide
function updateSlidersWithAsteroidData(asteroid) {
  console.log('🔄 Updating sliders with asteroid data:', asteroid);
  
  diameter = asteroid.diameter_m;
  speed = asteroid.speed_km_s;
  angle = asteroid.angle_deg;
  
  const diameterSlider = document.getElementById('diameterSlider');
  const speedSlider = document.getElementById('speedSlider');
  const angleSlider = document.getElementById('angleSlider');
  
  if (diameterSlider) diameterSlider.value = diameter;
  if (speedSlider) speedSlider.value = speed;
  if (angleSlider) angleSlider.value = angle;
  
  updateSliderValues();
  
  console.log('Sliders updated:', { diameter, speed, angle });
}

// Navegar a slide específico
function goToSlide(index) {
  currentSlide = index;
  selectedAsteroid = asteroidData[index].id;
  
  const asteroid = asteroidData[index];
  updateSlidersWithAsteroidData(asteroid);
  
  updateCarousel();
}