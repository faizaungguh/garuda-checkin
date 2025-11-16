import { createRouter, createWebHistory } from "vue-router";

import Splash from "../views/Splash.vue";
import Search from "../views/Search.vue";
import ScanQr from "../views/ScanQr.vue";

const routes = [
  {
    path: "/",
    name: "Splash",
    component: SplashView,
  },
  {
    path: "/search",
    name: "Search",
    component: SplashView,
  },
  {
    path: "/scan-qr",
    name: "ScanQr",
    component: SplashView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
