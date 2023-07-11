import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'

import ModalDialog from './components/UI/ModalDialog.vue'

const app = createApp(App)

app.use(router)

app.component('modal-dialog',ModalDialog)

app.mount('#app');
