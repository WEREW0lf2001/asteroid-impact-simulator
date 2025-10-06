document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded, initializing app...');
  
  setTimeout(async () => {
    try {
      await initCarousel();
      
      document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
      });

      document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentSlide < asteroidData.length - 1) {
          goToSlide(currentSlide + 1);
        }
      });
      
      document.getElementById('diameterSlider').addEventListener('input', function() {
        diameter = parseInt(this.value);
        updateSliderValues();
      });
      
      document.getElementById('speedSlider').addEventListener('input', function() {
        speed = parseInt(this.value);
        updateSliderValues();
      });
      
      document.getElementById('angleSlider').addEventListener('input', function() {
        angle = parseInt(this.value);
        updateSliderValues();
      });

      document.getElementById('closeResults').addEventListener('click', function() {
        document.getElementById('results').classList.remove('visible');
        if (typeof clearImpactEffects === 'function') {
          clearImpactEffects();
        }
      });

      document.getElementById('closeMessage').addEventListener('click', function() {
        document.getElementById('initialMessage').style.display = 'none';
      });

      document.getElementById("simulateBtn").addEventListener("click", async function () {
        if (!impactLatLng) {
          alert("Please select a location on the map first.");
          return;
        }

        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SIMULATING...';
        this.disabled = true;

        try {
          const targetType = await determineTargetType(impactLatLng.lat, impactLatLng.lng);
          const impactData = await executeImpactSimulation(
            diameter, 
            speed, 
            angle,
            density,
            impactLatLng.lat, 
            impactLatLng.lng, 
            targetType
          );
          displayBackendResults(impactData, targetType);
        } catch (error) {
          console.error('Error simulating impact:', error);
          displayErrorResults(error);
        } finally {
          this.innerHTML = originalText;
          this.disabled = false;
        }
      });

      // Agregar botón de limpieza
      setTimeout(() => {
        const clearButton = document.createElement('button');
        clearButton.id = 'clearBtn';
        clearButton.innerHTML = '<i class="fas fa-broom"></i> CLEAR EFFECTS';
        clearButton.style.marginTop = '10px';
        clearButton.style.background = 'var(--warning-color)';
        
        clearButton.addEventListener('click', function() {
          console.log('🧹 Clear button clicked');
          if (typeof clearAllEffectsAndReset === 'function') {
            clearAllEffectsAndReset();
          } else if (typeof clearImpactEffects === 'function') {
            clearImpactEffects();
          }

          document.getElementById('results').classList.remove('visible');
        });
        
        const simulateBtn = document.getElementById('simulateBtn');
        if (simulateBtn && simulateBtn.parentNode) {
          simulateBtn.parentNode.insertBefore(clearButton, simulateBtn.nextSibling);
        }
      }, 1000);

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }, 100);
});

function updateSliderValues() {
  const diameterValue = document.getElementById('diameterValue');
  const speedValue = document.getElementById('speedValue');
  const angleValue = document.getElementById('angleValue');
  
  if (diameterValue) diameterValue.textContent = diameter;
  if (speedValue) speedValue.textContent = speed;
  if (angleValue) angleValue.textContent = angle;
}

window.updateSliderValues = updateSliderValues;