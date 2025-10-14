import { createApp } from 'vue'
import App from './App.vue'
import router from './router'; 

import 'bootstrap/dist/css/bootstrap.css'
import 'datatables.net-dt'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'datatables.net-dt'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'mapbox-gl/dist/mapbox-gl.css'

createApp(App)
   .use(router)
   .mount('#app');