import 'babel-polyfill'
import 'event-source-polyfill'

import Vue from 'vue'
import App from './App.vue'

new Vue({
	el: '#app',
	render: h => h(App)
});
