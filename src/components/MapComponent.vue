<template>
  <div class="container my-5">
    <div class="card p-4 shadow-sm">
      <h2 class="card-title text-center mb-4">BR (E.2) Location Services</h2>
      
      <!-- Map Container -->
      <div class="row">
        <div class="col-12">
          <div id="map-container" style="height: 500px; width: 100%;"></div>
        </div>
      </div>

      <!-- Feature Controls -->
      <div class="row mt-4">
        <!-- Feature 1: Place Search with POI -->
        <div class="col-md-6 mb-3">
          <h4>🔍 1. Place Search & Points of Interest</h4>
          <div class="input-group mb-2">
            <input 
              type="text" 
              class="form-control" 
              v-model="searchQuery" 
              placeholder="Search a place in Melbourne..." 
              @keyup.enter="searchPlace"
            />
            <button class="btn btn-outline-primary" @click="searchPlace">
              Search
            </button>
          </div>
          
          <!-- POI Category Buttons -->
          <div class="mb-2">
            <small class="text-muted d-block mb-1">Quick Search:</small>
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-secondary" @click="searchNearbyPOI('restaurant')">
                🍽️ Restaurants
              </button>
              <button class="btn btn-outline-secondary" @click="searchNearbyPOI('cafe')">
                ☕ Cafes
              </button>
              <button class="btn btn-outline-secondary" @click="searchNearbyPOI('hospital')">
                🏥 Hospitals
              </button>
              <button class="btn btn-outline-secondary" @click="searchNearbyPOI('park')">
                🌳 Parks
              </button>
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="mt-2">
            <small class="text-muted">Results:</small>
            <div class="list-group" style="max-height: 150px; overflow-y: auto;">
              <button 
                v-for="(result, index) in searchResults" 
                :key="index"
                class="list-group-item list-group-item-action py-2 px-3"
                @click="selectSearchResult(result)"
              >
                <small><strong>{{ result.text }}</strong></small><br>
                <small class="text-muted">{{ result.place_name }}</small>
              </button>
            </div>
          </div>
        </div>

        <!-- Feature 2: Route Planning with Trip Info -->
        <div class="col-md-6 mb-3">
          <h4>🗺️ 2. Route Planning & Trip Information</h4>
          <div class="mb-2">
            <input 
              type="text" 
              class="form-control" 
              v-model="startQuery" 
              placeholder="Start Point (e.g., Melbourne CBD)" 
              @keyup.enter="getRoute"
            />
          </div>
          <div class="mb-2">
            <input 
              type="text" 
              class="form-control" 
              v-model="endQuery" 
              placeholder="End Point (e.g., St Kilda Beach)" 
              @keyup.enter="getRoute"
            />
          </div>
          
          <!-- Travel Mode Selection -->
          <div class="mb-2">
            <small class="text-muted d-block mb-1">Travel Mode:</small>
            <div class="btn-group btn-group-sm w-100" role="group">
              <button 
                class="btn" 
                :class="travelMode === 'driving' ? 'btn-primary' : 'btn-outline-primary'"
                @click="travelMode = 'driving'"
              >
                🚗 Driving
              </button>
              <button 
                class="btn" 
                :class="travelMode === 'walking' ? 'btn-primary' : 'btn-outline-primary'"
                @click="travelMode = 'walking'"
              >
                🚶 Walking
              </button>
              <button 
                class="btn" 
                :class="travelMode === 'cycling' ? 'btn-primary' : 'btn-outline-primary'"
                @click="travelMode = 'cycling'"
              >
                🚴 Cycling
              </button>
            </div>
          </div>

          <button class="btn btn-primary w-100 mb-2" @click="getRoute">
            Get Route
          </button>

          <!-- Trip Information Display -->
          <div v-if="tripInfo" class="alert alert-info mt-2 mb-0">
            <h6 class="alert-heading mb-2">📊 Trip Information</h6>
            <div class="row">
              <div class="col-6">
                <small><strong>Distance:</strong> {{ tripInfo.distance }}</small>
              </div>
              <div class="col-6">
                <small><strong>Duration:</strong> {{ tripInfo.duration }}</small>
              </div>
            </div>
            <div class="mt-2">
              <small><strong>Mode:</strong> {{ tripInfo.mode }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 3: Current Location -->
      <div class="row mt-3">
        <div class="col-12">
          <button class="btn btn-success btn-sm" @click="getCurrentLocation">
            📍 Show My Current Location
          </button>
          <button class="btn btn-secondary btn-sm ms-2" @click="clearMap">
            🗑️ Clear Map
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

// ⚠️ IMPORTANT: Replace this with your valid Mapbox Access Token
// Get a free token at: https://account.mapbox.com/access-tokens/
mapboxgl.accessToken = 'pk.eyJ1IjoibGlsaWFuYTAyIiwiYSI6ImNtZ3A0dzdoazJkaWUyaW9qOWd5bjBvOXkifQ.Op8Ls5BJij3k0BYsB23e7A'; 

const map = ref(null);
const searchQuery = ref('');
const startQuery = ref('');
const endQuery = ref('');
const travelMode = ref('driving');
const tripInfo = ref(null);
const searchResults = ref([]);

// Store markers and route layers
let markers = [];
let routeGeojson = null;
let currentLocationMarker = null;

// --- Initialize Map ---
onMounted(() => {
  // Check if access token is set
  if (!mapboxgl.accessToken || mapboxgl.accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    console.error('⚠️ Mapbox Access Token is not set! Please get a token from https://account.mapbox.com/access-tokens/');
    alert('Please set a valid Mapbox Access Token in the code. See console for instructions.');
    return;
  }

  try {
    map.value = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [144.9631, -37.8136], // Melbourne center
      zoom: 12
    });
    
    map.value.addControl(new mapboxgl.NavigationControl());
    
    map.value.on('load', () => {
      console.log("✅ Map loaded successfully, ready for user input.");
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

// 监听出行方式变化，如果已经有路线则自动重新计算
watch(travelMode, () => {
  if (startQuery.value && endQuery.value) {
    getRoute();
  }
});

// --- Feature 1: Place Search with Results ---
const searchPlace = async () => {
  if (!searchQuery.value) return;
  
  // 更精确的 Melbourne 范围和中心点
  const bbox = '144.5,-38.2,145.5,-37.5'; // Melbourne 区域
  const proximity = '144.9631,-37.8136'; // Melbourne CBD 中心，优先显示附近结果
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery.value)}.json?access_token=${mapboxgl.accessToken}&bbox=${bbox}&proximity=${proximity}&country=au&limit=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      // 过滤结果：只保留 Melbourne 附近的结果（50公里范围内）
      const melbourneCenter = [144.9631, -37.8136];
      searchResults.value = data.features.filter(feature => {
        const distance = calculateDistance(
          melbourneCenter[1], melbourneCenter[0],
          feature.center[1], feature.center[0]
        );
        return distance < 50; // 50公里范围内
      });

      if (searchResults.value.length > 0) {
        selectSearchResult(searchResults.value[0]);
      } else {
        alert('No results found in Melbourne area.');
        searchResults.value = [];
      }
    } else {
      alert('Place not found.');
      searchResults.value = [];
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    alert('Search error occurred.');
  }
};

// Select a search result
const selectSearchResult = (result) => {
  const coords = result.center; // [lng, lat]

  // Move map center
  map.value.flyTo({ center: coords, zoom: 14 });
  
  // Add marker
  addMarker(coords, result.place_name);
};

// --- POI Search Feature ---
const searchNearbyPOI = async (category) => {
  const center = map.value.getCenter();
  const proximity = `${center.lng},${center.lat}`;
  
  // 在搜索词中加入 "Melbourne" 以提高精确度
  const query = `${category} Melbourne Victoria`;
  const bbox = '144.5,-38.2,145.5,-37.5';
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&proximity=${proximity}&bbox=${bbox}&limit=15&country=au`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      // 过滤：只保留 Melbourne 市区 30公里内的结果
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
        return;
      }

      searchResults.value = filteredResults;
      
      // Clear existing markers
      clearMarkers();
      
      // Add markers for all POIs
      filteredResults.forEach(feature => {
        addMarker(feature.center, feature.place_name, true);
      });
      
      // Fit bounds to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      filteredResults.forEach(feature => {
        bounds.extend(feature.center);
      });
      map.value.fitBounds(bounds, { padding: 50 });
    } else {
      alert(`No ${category} found nearby.`);
    }
  } catch (error) {
    console.error('POI search error:', error);
  }
};

// Add marker to map
const addMarker = (coords, popupText, isSmall = false) => {
  const marker = new mapboxgl.Marker({ color: isSmall ? '#FF6B6B' : '#4A90E2' })
    .setLngLat(coords)
    .setPopup(new mapboxgl.Popup().setHTML(`<p style="margin: 5px;">${popupText}</p>`))
    .addTo(map.value);
  
  markers.push(marker);
};

// --- Feature 2: Route Planning with Trip Info ---
const getCoordinates = async (query) => {
  // 添加 Melbourne 限制和 proximity
  const proximity = '144.9631,-37.8136'; // Melbourne CBD
  const bbox = '144.5,-38.2,145.5,-37.5';
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&proximity=${proximity}&bbox=${bbox}&limit=1&country=au`;
  
  const response = await fetch(url);
  const data = await response.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].center;
  }
  throw new Error('Location not found: ' + query);
};

// 计算两点之间的距离（公里）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径（公里）
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
    return;
  }

  try {
    const startCoords = await getCoordinates(startQuery.value);
    const endCoords = await getCoordinates(endQuery.value);

    // Route planning API call with selected travel mode
    const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/${travelMode.value}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?alternatives=false&geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`;

    const response = await fetch(routeUrl);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      routeGeojson = route.geometry;
      
      // Calculate trip information - 确保每次都重新计算
      const distanceKm = (route.distance / 1000).toFixed(2);
      const durationMin = Math.round(route.duration / 60);
      
      // 添加调试信息
      console.log(`${travelMode.value}: Distance=${route.distance}m, Duration=${route.duration}s (${durationMin} min)`);
      
      // 根据不同的出行方式显示不同的信息
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
      
      // 强制创建新对象以触发响应式更新
      tripInfo.value = {
        distance: `${distanceKm} km`,
        duration: `${durationMin} min`,
        mode: `${modeIcon} ${modeDisplay}`,
        // 添加原始数据用于调试
        _raw: {
          distanceMeters: route.distance,
          durationSeconds: route.duration
        }
      };
      
      // Clear existing markers and add start/end markers
      clearMarkers();
      addMarker(startCoords, `Start: ${startQuery.value}`);
      addMarker(endCoords, `End: ${endQuery.value}`);
      
      drawRoute();
    } else {
      alert('Could not find a route.');
    }
  } catch (error) {
    alert(error.message);
    console.error('Routing error:', error);
  }
};

const drawRoute = () => {
  if (!map.value.isStyleLoaded()) {
    setTimeout(drawRoute, 100);
    return;
  }

  // Remove existing route
  const mapLayer = map.value.getLayer('route');
  if (typeof mapLayer !== 'undefined') {
    map.value.removeLayer('route');
    map.value.removeSource('route');
  }

  // Add route source and layer
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
  
  // Fit bounds to show entire route
  const bounds = new mapboxgl.LngLatBounds(routeGeojson.coordinates[0], routeGeojson.coordinates[0]);
  for (const coord of routeGeojson.coordinates) {
    bounds.extend(coord);
  }
  map.value.fitBounds(bounds, { padding: 80 });
};

// --- Feature 3: Current Location ---
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        
        // Remove existing current location marker
        if (currentLocationMarker) {
          currentLocationMarker.remove();
        }
        
        // Add current location marker
        currentLocationMarker = new mapboxgl.Marker({ color: '#22C55E' })
          .setLngLat(coords)
          .setPopup(new mapboxgl.Popup().setHTML('<p style="margin: 5px;"><strong>📍 Your Current Location</strong></p>'))
          .addTo(map.value);
        
        map.value.flyTo({ center: coords, zoom: 14 });
      },
      (error) => {
        alert('Unable to retrieve your location. Please enable location services.');
        console.error('Geolocation error:', error);
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
};

// --- Clear Map ---
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
  
  // Remove route
  if (map.value.getLayer('route')) {
    map.value.removeLayer('route');
    map.value.removeSource('route');
  }
  
  // Reset map view
  map.value.flyTo({ 
    center: [144.9631, -37.8136], 
    zoom: 12 
  });
};
</script>

<style scoped>
#map-container {
  border: 1px solid #ccc;
  border-radius: 8px;
}

.list-group-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.btn-group-sm .btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>