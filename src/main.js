import 'babel-polyfill'
import 'event-source-polyfill'

import Vue from 'vue'
import App from './App.vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faDownload} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

library.add(faDownload);
Vue.component(`font-awesome-icon`, FontAwesomeIcon);

new Vue({
	el: '#app',
	render: h => h(App)
});
