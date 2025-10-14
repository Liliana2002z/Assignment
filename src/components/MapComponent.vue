<template>
  <div class="container my-5">
    <!-- Skip to main content link (WCAG 2.4.1 Bypass Blocks) -->
    <a href="#map-container" class="skip-link">
      Skip to map content
    </a>

    <div class="card p-4 shadow-sm">
      <!-- Main heading with proper semantic structure (WCAG 1.3.1) -->
      <h1 class="card-title text-center mb-4">BR (E.2) Location Services</h1>
      
      <!-- Screen reader live region for announcements (WCAG 4.1.3) -->
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        class="visually-hidden"
      >
        {{ announceMessage }}
      </div>
      
      <!-- Map Container with proper accessibility attributes -->
      <div class="row">
        <div class="col-12">
          <div 
            id="map-container" 
            style="height: 500px; width: 100%;"
            role="application"
            aria-label="Interactive map showing Melbourne locations and routes"
            tabindex="0"
            @keydown="handleMapKeydown"
          >
            <!-- Map instructions for assistive technology -->
            <div class="visually-hidden" id="map-instructions">
              Interactive map. Use arrow keys to pan. Press plus or minus to zoom. Tab to navigate to form controls.
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Controls -->
      <div class="row mt-4">
        <!-- Feature 1: Place Search with POI -->
        <div class="col-md-6 mb-3">
          <h2 class="h4" id="search-heading">
            <span aria-hidden="true">🔍</span> 
            1. Place Search & Points of Interest
          </h2>
          
          <!-- Search form with proper labels (WCAG 3.3.2) -->
          <form @submit.prevent="searchPlace" role="search" aria-labelledby="search-heading">
            <div class="input-group mb-2">
              <label for="search-input" class="visually-hidden">
                Search for a place in Melbourne
              </label>
              <input 
                id="search-input"
                type="text" 
                class="form-control" 
                v-model="searchQuery" 
                placeholder="Search a place in Melbourne..." 
                @keyup.enter="searchPlace"
                aria-describedby="search-help"
              />
              <button 
                class="btn btn-outline-primary" 
                type="submit"
                aria-label="Search for location"
              >
                Search
              </button>
            </div>
            <small id="search-help" class="visually-hidden">
              Enter a location name and press Enter or click Search button to find places in Melbourne
            </small>
          </form>
          
          <!-- POI Category Buttons with proper ARIA labels -->
          <div class="mb-2">
            <div class="small text-muted mb-1" id="poi-categories-label">
              Quick Search:
            </div>
            <div 
              class="btn-group btn-group-sm" 
              role="group" 
              aria-labelledby="poi-categories-label"
            >
              <button 
                class="btn btn-outline-secondary" 
                @click="searchNearbyPOI('restaurant')"
                type="button"
                aria-label="Search for restaurants in Melbourne"
              >
                <span aria-hidden="true">🍽️</span> Restaurants
              </button>
              <button 
                class="btn btn-outline-secondary" 
                @click="searchNearbyPOI('cafe')"
                type="button"
                aria-label="Search for cafes in Melbourne"
              >
                <span aria-hidden="true">☕</span> Cafes
              </button>
              <button 
                class="btn btn-outline-secondary" 
                @click="searchNearbyPOI('hospital')"
                type="button"
                aria-label="Search for hospitals in Melbourne"
              >
                <span aria-hidden="true">🏥</span> Hospitals
              </button>
              <button 
                class="btn btn-outline-secondary" 
                @click="searchNearbyPOI('park')"
                type="button"
                aria-label="Search for parks in Melbourne"
              >
                <span aria-hidden="true">🌳</span> Parks
              </button>
            </div>
          </div>

          <!-- Search Results with proper semantics -->
          <div v-if="searchResults.length > 0" class="mt-2">
            <div class="small text-muted" id="results-heading" role="status" aria-live="polite">
              Results: {{ searchResults.length }} location{{ searchResults.length !== 1 ? 's' : '' }} found
            </div>
            <div 
              class="list-group" 
              style="max-height: 150px; overflow-y: auto;"
              role="list"
              aria-labelledby="results-heading"
            >
              <button 
                v-for="(result, index) in searchResults" 
                :key="index"
                class="list-group-item list-group-item-action py-2 px-3"
                @click="selectSearchResult(result)"
                type="button"
                :aria-label="`Select ${result.text}, located at ${result.place_name}`"
              >
                <small><strong>{{ result.text }}</strong></small><br>
                <small class="text-muted">{{ result.place_name }}</small>
              </button>
            </div>
          </div>
        </div>

        <!-- Feature 2: Route Planning with Trip Info -->
        <div class="col-md-6 mb-3">
          <h2 class="h4" id="route-heading">
            <span aria-hidden="true">🗺️</span> 
            2. Route Planning & Trip Information
          </h2>
          
          <!-- Route planning form with proper labels -->
          <form @submit.prevent="getRoute" aria-labelledby="route-heading">
            <div class="mb-2">
              <label for="start-input" class="visually-hidden">
                Starting point
              </label>
              <input 
                id="start-input"
                type="text" 
                class="form-control" 
                v-model="startQuery" 
                placeholder="Start Point (e.g., Melbourne CBD)" 
                @keyup.enter="getRoute"
                aria-describedby="start-help"
              />
              <small id="start-help" class="visually-hidden">
                Enter your starting location
              </small>
            </div>
            <div class="mb-2">
              <label for="end-input" class="visually-hidden">
                Destination point
              </label>
              <input 
                id="end-input"
                type="text" 
                class="form-control" 
                v-model="endQuery" 
                placeholder="End Point (e.g., St Kilda Beach)" 
                @keyup.enter="getRoute"
                aria-describedby="end-help"
              />
              <small id="end-help" class="visually-hidden">
                Enter your destination
              </small>
            </div>
            
            <!-- Travel Mode Selection with proper radio buttons (WCAG 1.3.1, 4.1.2) -->
            <fieldset class="mb-2">
              <legend class="small text-muted mb-1">Travel Mode:</legend>
              <div class="btn-group btn-group-sm w-100" role="group" aria-label="Select travel mode">
                <input 
                  type="radio" 
                  class="btn-check" 
                  name="travelMode" 
                  id="mode-driving" 
                  value="driving"
                  v-model="travelMode"
                  autocomplete="off"
                >
                <label class="btn btn-outline-primary" for="mode-driving">
                  <span aria-hidden="true">🚗</span> Driving
                </label>

                <input 
                  type="radio" 
                  class="btn-check" 
                  name="travelMode" 
                  id="mode-walking" 
                  value="walking"
                  v-model="travelMode"
                  autocomplete="off"
                >
                <label class="btn btn-outline-primary" for="mode-walking">
                  <span aria-hidden="true">🚶</span> Walking
                </label>

                <input 
                  type="radio" 
                  class="btn-check" 
                  name="travelMode" 
                  id="mode-cycling" 
                  value="cycling"
                  v-model="travelMode"
                  autocomplete="off"
                >
                <label class="btn btn-outline-primary" for="mode-cycling">
                  <span aria-hidden="true">🚴</span> Cycling
                </label>
              </div>
            </fieldset>

            <button 
              class="btn btn-primary w-100 mb-2" 
              type="submit"
              aria-label="Calculate route between start and end points"
            >
              Get Route
            </button>
          </form>

          <!-- Trip Information Display with semantic structure -->
          <div 
            v-if="tripInfo" 
            class="alert alert-info mt-2 mb-0"
            role="region"
            aria-labelledby="trip-info-heading"
            aria-live="polite"
          >
            <h3 class="alert-heading mb-2 h6" id="trip-info-heading">
              <span aria-hidden="true">📊</span> Trip Information
            </h3>
            <dl class="row mb-0">
              <dt class="col-6">Distance:</dt>
              <dd class="col-6">{{ tripInfo.distance }}</dd>
              
              <dt class="col-6">Duration:</dt>
              <dd class="col-6">{{ tripInfo.duration }}</dd>
              
              <dt class="col-6">Mode:</dt>
              <dd class="col-6">{{ tripInfo.mode }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <!-- Feature 3: Current Location and Clear Map buttons -->
      <div class="row mt-3">
        <div class="col-12" role="group" aria-label="Map action buttons">
          <button 
            class="btn btn-success btn-sm" 
            @click="getCurrentLocation"
            type="button"
            aria-label="Show my current location on the map"
          >
            <span aria-hidden="true">📍</span> Show My Current Location
          </button>
          <button 
            class="btn btn-secondary btn-sm ms-2" 
            @click="clearMap"
            type="button"
            aria-label="Clear all markers and routes from the map"
          >
            <span aria-hidden="true">🗑️</span> Clear Map
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibGlsaWFuYTAyIiwiYSI6ImNtZ3A0dzdoazJkaWUyaW9qOWd5bjBvOXkifQ.Op8Ls5BJij3k0BYsB23e7A'; 

const map = ref(null);
const searchQuery = ref('');
const startQuery = ref('');
const endQuery = ref('');
const travelMode = ref('driving');
const tripInfo = ref(null);
const searchResults = ref([]);
const announceMessage = ref('');

let markers = [];
let routeGeojson = null;
let currentLocationMarker = null;

// Announce messages to screen readers
const announce = (message) => {
  announceMessage.value = message;
  setTimeout(() => {
    announceMessage.value = '';
  }, 1000);
};

// Keyboard navigation for map (WCAG 2.1.1)
const handleMapKeydown = (e) => {
  if (!map.value) return;
  
  const step = 0.01;
  const center = map.value.getCenter();
  const zoom = map.value.getZoom();
  
  switch(e.key) {
    case 'ArrowUp':
      e.preventDefault();
      map.value.setCenter([center.lng, center.lat + step]);
      announce('Map panned up');
      break;
    case 'ArrowDown':
      e.preventDefault();
      map.value.setCenter([center.lng, center.lat - step]);
      announce('Map panned down');
      break;
    case 'ArrowLeft':
      e.preventDefault();
      map.value.setCenter([center.lng - step, center.lat]);
      announce('Map panned left');
      break;
    case 'ArrowRight':
      e.preventDefault();
      map.value.setCenter([center.lng + step, center.lat]);
      announce('Map panned right');
      break;
    case '+':
    case '=':
      e.preventDefault();
      map.value.setZoom(zoom + 0.5);
      announce('Map zoomed in');
      break;
    case '-':
    case '_':
      e.preventDefault();
      map.value.setZoom(zoom - 0.5);
      announce('Map zoomed out');
      break;
  }
};

onMounted(() => {
  if (!mapboxgl.accessToken || mapboxgl.accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    console.error('⚠️ Mapbox Access Token is not set!');
    alert('Please set a valid Mapbox Access Token.');
    return;
  }

  try {
    map.value = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [144.9631, -37.8136],
      zoom: 12,
      // Performance optimizations
      maxZoom: 18,
      minZoom: 10,
      renderWorldCopies: false,
      preserveDrawingBuffer: false,
      trackResize: true,
      optimizeForTerrain: true
    });
    
    map.value.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.value.on('load', () => {
      console.log("✅ Map loaded successfully");
      announce('Map loaded and ready for interaction');
    });

    map.value.on('error', (e) => {
      console.error('Map error:', e);
    });
  } catch (error) {
    console.error('Failed to initialize map:', error);
    alert('Failed to initialize map. Please check your Mapbox Access Token.');
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

watch(travelMode, (newMode) => {
  if (startQuery.value && endQuery.value) {
    announce(`Travel mode changed to ${newMode}`);
    getRoute();
  }
});

const searchPlace = async () => {
  if (!searchQuery.value) {
    announce('Please enter a search term');
    return;
  }
  
  announce(`Searching for ${searchQuery.value}`);
  
  const bbox = '144.5,-38.2,145.5,-37.5';
  const proximity = '144.9631,-37.8136';
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery.value)}.json?access_token=${mapboxgl.accessToken}&bbox=${bbox}&proximity=${proximity}&country=au&limit=10`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const melbourneCenter = [144.9631, -37.8136];
      searchResults.value = data.features.filter(feature => {
        const distance = calculateDistance(
          melbourneCenter[1], melbourneCenter[0],
          feature.center[1], feature.center[0]
        );
        return distance < 50;
      });

      if (searchResults.value.length > 0) {
        selectSearchResult(searchResults.value[0]);
        announce(`Found ${searchResults.value.length} results for ${searchQuery.value}`);
      } else {
        alert('No results found in Melbourne area.');
        announce('No results found');
        searchResults.value = [];
      }
    } else {
      alert('Place not found.');
      announce('Place not found');
      searchResults.value = [];
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Search timeout');
      alert('Search timeout. Please try again.');
    } else {
      console.error('Geocoding error:', error);
      alert('Search error occurred.');
    }
    announce('Search error occurred');
  }
};

const selectSearchResult = (result) => {
  const coords = result.center;
  map.value.flyTo({ center: coords, zoom: 14 });
  addMarker(coords, result.place_name);
  announce(`Selected ${result.text}`);
};

const searchNearbyPOI = async (category) => {
  announce(`Searching for ${category} in Melbourne`);
  
  const center = map.value.getCenter();
  const proximity = `${center.lng},${center.lat}`;
  const query = `${category} Melbourne Victoria`;
  const bbox = '144.5,-38.2,145.5,-37.5';
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&proximity=${proximity}&bbox=${bbox}&limit=15&country=au`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const melbourneCenter = [144.9631, -37.8136];
      const filteredResults = data.features.filter(feature => {
        const distance = calculateDistance(
          melbourneCenter[1], melbourneCenter[0],
          feature.center[1], feature.center[0]
        );
        return distance < 30;
      });

      if (filteredResults.length === 0) {
        alert(`No ${category} found in Melbourne area.`);
        announce(`No ${category} found`);
        return;
      }

      searchResults.value = filteredResults;
      clearMarkers();
      
      filteredResults.forEach(feature => {
        addMarker(feature.center, feature.place_name, true);
      });
      
      const bounds = new mapboxgl.LngLatBounds();
      filteredResults.forEach(feature => {
        bounds.extend(feature.center);
      });
      map.value.fitBounds(bounds, { padding: 50 });
      
      announce(`Found ${filteredResults.length} ${category} locations`);
    } else {
      alert(`No ${category} found nearby.`);
      announce(`No ${category} found`);
    }
  } catch (error) {
    console.error('POI search error:', error);
    announce('Search error occurred');
  }
};

const addMarker = (coords, popupText, isSmall = false) => {
  const marker = new mapboxgl.Marker({ color: isSmall ? '#FF6B6B' : '#4A90E2' })
    .setLngLat(coords)
    .setPopup(new mapboxgl.Popup().setHTML(`<p style="margin: 5px;">${popupText}</p>`))
    .addTo(map.value);
  
  markers.push(marker);
};

const getCoordinates = async (query) => {
  const proximity = '144.9631,-37.8136';
  const bbox = '144.5,-38.2,145.5,-37.5';
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&proximity=${proximity}&bbox=${bbox}&limit=1&country=au`;
  
  const response = await fetch(url);
  const data = await response.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].center;
  }
  throw new Error('Location not found: ' + query);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getRoute = async () => {
  if (!startQuery.value || !endQuery.value) {
    alert('Please enter both start and end points.');
    announce('Please enter both start and end points');
    return;
  }

  announce(`Calculating ${travelMode.value} route`);

  try {
    const startCoords = await getCoordinates(startQuery.value);
    const endCoords = await getCoordinates(endQuery.value);

    const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/${travelMode.value}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?alternatives=false&geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`;

    const response = await fetch(routeUrl);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      routeGeojson = route.geometry;
      
      const distanceKm = (route.distance / 1000).toFixed(2);
      const durationMin = Math.round(route.duration / 60);
      
      console.log(`${travelMode.value}: Distance=${route.distance}m, Duration=${route.duration}s (${durationMin} min)`);
      
      let modeDisplay = '';
      let modeIcon = '';
      switch(travelMode.value) {
        case 'driving':
          modeDisplay = 'Driving';
          modeIcon = '🚗';
          break;
        case 'walking':
          modeDisplay = 'Walking';
          modeIcon = '🚶';
          break;
        case 'cycling':
          modeDisplay = 'Cycling';
          modeIcon = '🚴';
          break;
      }
      
      tripInfo.value = {
        distance: `${distanceKm} km`,
        duration: `${durationMin} min`,
        mode: `${modeIcon} ${modeDisplay}`,
        _raw: {
          distanceMeters: route.distance,
          durationSeconds: route.duration
        }
      };
      
      clearMarkers();
      addMarker(startCoords, `Start: ${startQuery.value}`);
      addMarker(endCoords, `End: ${endQuery.value}`);
      
      drawRoute();
      
      announce(`Route calculated: ${distanceKm} kilometers, ${durationMin} minutes by ${modeDisplay}`);
    } else {
      alert('Could not find a route.');
      announce('Could not find a route');
    }
  } catch (error) {
    alert(error.message);
    announce('Route calculation error');
    console.error('Routing error:', error);
  }
};

const drawRoute = () => {
  if (!map.value.isStyleLoaded()) {
    setTimeout(drawRoute, 100);
    return;
  }

  const mapLayer = map.value.getLayer('route');
  if (typeof mapLayer !== 'undefined') {
    map.value.removeLayer('route');
    map.value.removeSource('route');
  }

  map.value.addSource('route', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': routeGeojson
    }
  });

  map.value.addLayer({
    'id': 'route',
    'type': 'line',
    'source': 'route',
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#3887be',
      'line-width': 5,
      'line-opacity': 0.75
    }
  });
  
  const bounds = new mapboxgl.LngLatBounds(routeGeojson.coordinates[0], routeGeojson.coordinates[0]);
  for (const coord of routeGeojson.coordinates) {
    bounds.extend(coord);
  }
  map.value.fitBounds(bounds, { padding: 80 });
};

const getCurrentLocation = () => {
  announce('Getting your current location');
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        
        if (currentLocationMarker) {
          currentLocationMarker.remove();
        }
        
        currentLocationMarker = new mapboxgl.Marker({ color: '#22C55E' })
          .setLngLat(coords)
          .setPopup(new mapboxgl.Popup().setHTML('<p style="margin: 5px;"><strong>📍 Your Current Location</strong></p>'))
          .addTo(map.value);
        
        map.value.flyTo({ center: coords, zoom: 14 });
        announce('Current location displayed on map');
      },
      (error) => {
        alert('Unable to retrieve your location. Please enable location services.');
        announce('Unable to retrieve location');
        console.error('Geolocation error:', error);
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
    announce('Geolocation not supported');
  }
};

const clearMarkers = () => {
  markers.forEach(marker => marker.remove());
  markers = [];
};

const clearMap = () => {
  clearMarkers();
  searchResults.value = [];
  tripInfo.value = null;
  searchQuery.value = '';
  startQuery.value = '';
  endQuery.value = '';
  
  if (currentLocationMarker) {
    currentLocationMarker.remove();
    currentLocationMarker = null;
  }
  
  if (map.value.getLayer('route')) {
    map.value.removeLayer('route');
    map.value.removeSource('route');
  }
  
  map.value.flyTo({ 
    center: [144.9631, -37.8136], 
    zoom: 12 
  });
  
  announce('Map cleared');
};
</script>

<style scoped>
/* Skip link for keyboard users (WCAG 2.4.1) */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0d6efd;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

/* Ensure sufficient color contrast (WCAG 1.4.3) */
#map-container {
  border: 1px solid #666;
  border-radius: 8px;
}

#map-container:focus {
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
}

.list-group-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.list-group-item:hover,
.list-group-item:focus {
  background-color: #e9ecef;
  outline: 2px solid #0d6efd;
}

.btn-group-sm .btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Ensure buttons have visible focus indicators (WCAG 2.4.7) */
button:focus,
input:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

/* Screen reader only text */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>