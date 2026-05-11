import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import "@/styles/custom.css";

import { initSessionManager } from "@/services/session-manager";

const app = createApp(App);
app.use(router);
app.use(vuetify);

initSessionManager();

app.mount("#app");
