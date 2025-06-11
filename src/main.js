import { createApp } from 'vue'
import './style.css'
import App from './App0527.vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import VxeUIAll from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'

import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'

// import vuetify from 'vuetify';
// import * as components from 'vuetify/components';
// import * as directives from 'vuetify/directives';
// import 'vuetify/dist/vuetify.min.css'
// import zhHans from 'vuetify/es5/locale/zh-Hans'
// const vuetify = createVuetify({
//   components,
//   directives,
// });

// const opts = {
//     lang: {
//       locales: { zhHans },
//       current: 'zh-Hans',
//     },
//   }

const app = createApp(App);
// app.use(vuetify);
app.use(VxeUIAll)
app.use(VxeUITable)
app.use(ElementPlus, {
    locale: zhCn,
    }).mount('#app')
