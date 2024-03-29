import Vue from 'vue';
import App from './App.vue';
import VueDragResize from 'vue-drag-resize';
import jsPlumb from "jsplumb";
import Network from './network/Network';
import mitt from 'mitt';
import Asset from './normalize/Asset';

Vue.prototype.$jsPlumb = jsPlumb.jsPlumb;

Vue.component('vue-drag-resize', VueDragResize)

Vue.config.productionTip = false

window.$network = new Network();
window.$mitt = mitt();
window.$print = console.log;
window.$asset = new Asset();

new Vue({
    render: h => h(App),
}).$mount('#app')
