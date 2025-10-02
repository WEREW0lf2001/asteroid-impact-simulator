// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded, initializing app...');
  
  // Esperar a que el mapa se inicialice
  setTimeout(async () => {
    try {
      // Inicializar carrusel (carga asteroides del backend)
      await initCarousel();
      
      // Agregar event listeners a los botones del carrusel
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
      
      // Event listeners para las barras deslizadoras
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

      // Cerrar panel de resultados
      document.getElementById('closeResults').addEventListener('click', function() {
        document.getElementById('results').classList.remove('visible');
      });

      // Cerrar mensaje inicial
      document.getElementById('closeMessage').addEventListener('click', function() {
        document.getElementById('initialMessage').style.display = 'none';
      });

      // Simular impacto - Usando el backend para cálculos
      document.getElementById("simulateBtn").addEventListener("click", async function () {
        if (!impactLatLng) {
          alert("Please select a location on the map first.");
          return;
        }

        // Mostrar indicador de carga
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SIMULATING...';
        this.disabled = true;

        try {
          // Determinar si es objetivo terrestre o acuático
          const targetType = await determineTargetType(impactLatLng.lat, impactLatLng.lng);
          
          // Usar la nueva función de simulación
          const impactData = await executeImpactSimulation(
            diameter, 
            speed, 
            angle, 
            impactLatLng.lat, 
            impactLatLng.lng, 
            targetType
          );
          
          // Mostrar resultados del backend
          displayBackendResults(impactData, targetType);

        } catch (error) {
          console.error('Error simulating impact:', error);
          displayErrorResults(error);
        } finally {
          // Restaurar botón
          this.innerHTML = originalText;
          this.disabled = false;
        }
      });

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }, 100);
});