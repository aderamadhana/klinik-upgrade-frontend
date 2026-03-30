import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import "@/styles/custom.css";

createApp(App).use(vuetify).use(router).mount("#app");
