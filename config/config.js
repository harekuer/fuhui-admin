import defaultSettings from './defaultSettings'; 

import slash from 'slash2';
import themePluginConfig from './themePluginConfig';
const { pwa } = defaultSettings; 

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;
const isAntDesignProPreview = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site';
const publicPath = '/shopAdmin/'
const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      treeShaking: true,
      dynamicImport: {
        webpackChunkName: true,
      },
      chunks: ['vendors', 'umi'],
      locale: {
        // default false
        enable: true,
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        baseNavigator: true,
      },
      // dynamicImport: {
      //   loadingComponent: './components/PageLoading/index',
      //   webpackChunkName: true,
      //   level: 3,
      // },
      pwa: pwa
        ? {
            workboxPluginMode: 'InjectManifest',
            workboxOptions: {
              importWorkboxFrom: 'local',
            },
          }
        : false, // default close dll, because issue https://github.com/ant-design/ant-design-pro/issues/4665
      // dll features https://webpack.js.org/plugins/dll-plugin/
      // dll: {
      //   include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
      //   exclude: ['@babel/runtime', 'netlify-lambda'],
      // },
    },
  ],
  [
    'umi-plugin-pro-block',
    {
      moveMock: false,
      moveService: false,
      modifyRequest: true,
      autoAddMenu: true,
    },
  ],
];


export default {
  chainWebpack(config) {
    config.optimization.splitChunks({
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          test: /\.css$/,
          minChunks: 1,
          minSize: 0,
        },
      },
    });
  },
  plugins,
  hash: true,
  targets: {
    ie: 11,
  },
  disableDynamicImport: false,
  publicPath: publicPath,
  routes: [
    {
      path: '/',
      component: '../layouts/BlankLayout',
      routes: [
        {
          path: '/user',
          component: '../layouts/UserLayout',
          routes: [
            {
              path: '/user',
              redirect: '/user/login',
            },
            {
              name: 'login',
              icon: 'smile',
              path: '/user/login',
              component: './user/login',
            },
            {
              name: 'register-result',
              icon: 'smile',
              path: '/user/register-result',
              component: './user/register-result',
            },
            {
              name: 'register',
              icon: 'smile',
              path: '/user/register',
              component: './user/register',
            },
            {
              component: '404',
            },
          ],
        },
        {
          path: '/',
          component: '../layouts/BasicLayout',
          Routes: ['src/pages/Authorized'],
          authority: ['admin', 'user'],
          routes: [
            {
              path: '/dashboard',
              name: 'tab',
              icon: 'dashboard',
              routes: [
                {
                  name: 'analysis',
                  icon: 'smile',
                  path: `${publicPath}dashboard`,
                  component: './dashboard/analysis',
                },
                {
                  name: 'search',
                  icon: 'search',
                  path: '/osAdmin/homePage/search',
                  component: './homePage/search',
                },
                {
                  name: 'nav',
                  icon: 'menu',
                  path: '/osAdmin/homePage/nav',
                  component: './homePage/nav',
                },
                {
                  name: 'banner',
                  icon: 'border',
                  path: '/osAdmin/homePage/banner',
                  component: './homePage/banner',
                },
                {
                  name: 'newProduct',
                  icon: 'smile',
                  path: '/osAdmin/homePage/newProduct',
                  component: './homePage/newProduct',
                },
                {
                  name: 'entrance',
                  icon: 'fire',
                  path: '/osAdmin/homePage/entrance',
                  component: './homePage/entrance',
                },
                {
                  name: 'cashsale',
                  icon: 'appstore',
                  path: '/osAdmin/homePage/cashsale',
                  component: './homePage/cashsale',
                },
                {
                  name: 'hotsale',
                  icon: 'fire',
                  path: '/osAdmin/homePage/hotsale',
                  component: './homePage/hotsale',
                },
                {
                  name: 'newArrival',
                  icon: 'folder-add',
                  path: '/osAdmin/homePage/newArrival',
                  component: './homePage/newArrival',
                },
                {
                  name: 'newArrivalSec',
                  icon: 'folder-add',
                  path: '/osAdmin/homePage/newArrivalSec',
                  component: './homePage/newArrivalSec',
                },
                {
                  name: 'customized',
                  icon: 'profile',
                  path: '/osAdmin/homePage/customized',
                  component: './homePage/customized',
                },
                {
                  name: 'designer',
                  icon: 'smile',
                  path: '/osAdmin/homePage/designer',
                  component: './homePage/designer',
                },
                {
                  name: 'logistics',
                  icon: 'car',
                  path: '/osAdmin/home/logistics',
                  component: './homePage/logistics',
                },
              ],
            },
            {
              path: '/osAdmin/category',
              icon: 'unordered-list',
              name: 'category',
              component: './category',
              routes: [
                {
                  //name: 'categoryEdit',
                  path: '/osAdmin/category/detail',
                  component: './category/detail',
                },
              ],
            },
            {
              path: '/osAdmin/audit',
              icon: 'form',
              name: 'audit',
              component: './form/basic-form',
            },
            {
              name: '商品编辑',
              icon: 'menu',
              path: '/shopAdmin/productManage/detail',
              component: './product',
            },
            {
              path: '/osAdmin/client',
              icon: 'form',
              name: 'client',
              component: './form/basic-form',
            },
            {
              path: '/osAdmin/theme',
              icon: 'form',
              name: 'theme',
              component: './form/basic-form',
            },
            {
              path: `${publicPath}tool`,
              icon: 'tool',
              name: 'tool',
              component: './tool',
            },
            {
              path: '/osAdmin/menu',
              icon: 'unordered-list',
              name: 'menu',
              routes: [
                {
                  name: 'osMenu',
                  icon: 'menu',
                  path: '/osAdmin/menu/centerMenu',
                  component: './menuManage/centerMenu',
                },
                {
                  name: 'shopMenu',
                  path: '/osAdmin/menu/shopMenu',
                  component: './menuManage/shopMenu',
                },
              ],
            },

            {
              path: '/',
              redirect: '/osAdmin/dashboard/analysis',
              authority: ['admin', 'user'],
            },
            {
              component: '404',
            },
          ],
        },
      ],
    },
  ],
  theme: {
    // ...darkTheme,
  },
  define: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION:
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION || '',
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, _, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }

      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  proxy: {
    '/_os/': {
      target: 'https://beta.365fashion.com:8888/',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '/_os/': '/_os/' },
    },
    '/_shop/': {
      target: 'https://beta.365fashion.com:8888/',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '/_shop/': '/_shop/' },
    },
  },
};
