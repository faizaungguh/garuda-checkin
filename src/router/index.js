import { createRouter, createWebHistory } from "vue-router";

import SplashView from "../views/SplashView.vue";
import HomeView from "../views/HomeView.vue";
import SearchView from "../views/SearchView.vue";
import StorageView from "../views/StorageView.vue";

const routes = [
  {
    path: "/",
    name: "Splash",
    component: SplashView,
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/search",
    name: "Search",
    component: SearchView,
  },
  {
    path: "/storage",
    name: "Storage",
    component: StorageView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
