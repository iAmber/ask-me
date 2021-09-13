import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './App.vue';
import router from './router';
import en from './lang/en';
import pt from './lang/pt';
// import 'lib-flexible';

Vue.use(VueI18n);

Vue.config.productionTip = false;

const i18n = new VueI18n({
  locale: 'en-US', // 设置语言环境
  messages: {
    'en-US': en,
    'pt-BR': pt,
  },
});

new Vue({
  i18n,
  router,
  render: (h) => h(App),
}).$mount('#app');
