import defaultSettings from './defaultSettings'; 

import slash from 'slash2';
import themePluginConfig from './themePluginConfig';
const { pwa } = defaultSettings; 

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;
const isAntDesignProPreview = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site';
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
  publicPath:'/osAdmin/',
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
                  name: 'search',
                  icon: 'search',
                  path: '/osAdmin/homePage/search',
                  component: './homePage/search',
                },
                {
                  name: 'navigation',
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
              path: '/osAdmin/tool',
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
                // {
                //   name: 'shopMenu',
                //   path: '/osAdmin/menu/shopMenu',
                //   component: './menuManage/shopMenu',
                // },
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
      // routes: [
      //   {
      //     path: '/user',
      //     component: '../layouts/UserLayout',
      //     routes: [
      //       {
      //         path: '/user',
      //         redirect: '/user/login',
      //       },
      //       {
      //         name: 'login',
      //         icon: 'smile',
      //         path: '/user/login',
      //         component: './user/login',
      //       },
      //       {
      //         name: 'register-result',
      //         icon: 'smile',
      //         path: '/user/register-result',
      //         component: './user/register-result',
      //       },
      //       {
      //         name: 'register',
      //         icon: 'smile',
      //         path: '/user/register',
      //         component: './user/register',
      //       },
      //       {
      //         component: '404',
      //       },
      //     ],
      //   },
      //   {
      //     path: '/',
      //     component: '../layouts/BasicLayout',
      //     Routes: ['src/pages/Authorized'],
      //     authority: ['admin', 'user'],
      //     routes: [
      //       {
      //         path: '/dashboard',
      //         name: 'dashboard',
      //         icon: 'dashboard',
      //         routes: [
      //           {
      //             name: 'analysis',
      //             icon: 'smile',
      //             path: '/osAdmin/dashboard/analysis',
      //             component: './dashboard/analysis',
      //           },
      //           // {
      //           //   name: 'monitor',
      //           //   icon: 'smile',
      //           //   path: '/osAdmin/dashboard/monitor',
      //           //   component: './dashboard/monitor',
      //           // },
      //           // {
      //           //   name: 'workplace',
      //           //   icon: 'smile',
      //           //   path: '/osAdmin/dashboard/workplace',
      //           //   component: './dashboard/workplace',
      //           // },
      //         ],
      //       },
      //       {
      //         path: '/form',
      //         icon: 'form',
      //         name: 'form',
      //         routes: [
      //           {
      //             name: 'basic-form',
      //             icon: 'smile',
      //             path: '/form/basic-form',
      //             component: './form/basic-form',
      //           },
      //           // {
      //           //   name: 'step-form',
      //           //   icon: 'smile',
      //           //   path: '/form/step-form',
      //           //   component: './form/step-form',
      //           // },
      //           // {
      //           //   name: 'advanced-form',
      //           //   icon: 'smile',
      //           //   path: '/form/advanced-form',
      //           //   component: './form/advanced-form',
      //           // },
      //         ],
      //       },
      //       {
      //         path: '/list',
      //         icon: 'table',
      //         name: 'list',
      //         routes: [
      //           {
      //             path: '/list/search',
      //             name: 'search-list',
      //             component: './list/search',
      //             routes: [
      //               {
      //                 path: '/list/search',
      //                 redirect: '/list/search/articles',
      //               },
      //               // {
      //               //   name: 'articles',
      //               //   icon: 'smile',
      //               //   path: '/list/search/articles',
      //               //   component: './list/search/articles',
      //               // },
      //               // {
      //               //   name: 'projects',
      //               //   icon: 'smile',
      //               //   path: '/list/search/projects',
      //               //   component: './list/search/projects',
      //               // },
      //               // {
      //               //   name: 'applications',
      //               //   icon: 'smile',
      //               //   path: '/list/search/applications',
      //               //   component: './list/search/applications',
      //               // },
      //             ],
      //           },
      //           {
      //             name: 'table-list',
      //             icon: 'smile',
      //             path: '/list/table-list',
      //             component: './list/table-list',
      //           },
      //           // {
      //           //   name: 'basic-list',
      //           //   icon: 'smile',
      //           //   path: '/list/basic-list',
      //           //   component: './list/basic-list',
      //           // },
      //           // {
      //           //   name: 'card-list',
      //           //   icon: 'smile',
      //           //   path: '/list/card-list',
      //           //   component: './list/card-list',
      //           // },
      //         ],
      //       },
      //       // {
      //       //   path: '/profile',
      //       //   name: 'profile',
      //       //   icon: 'profile',
      //       //   routes: [
      //       //     {
      //       //       name: 'basic',
      //       //       icon: 'smile',
      //       //       path: '/profile/basic',
      //       //       component: './profile/basic',
      //       //     },
      //       //     {
      //       //       name: 'advanced',
      //       //       icon: 'smile',
      //       //       path: '/profile/advanced',
      //       //       component: './profile/advanced',
      //       //     },
      //       //   ],
      //       // },
      //       {
      //         name: 'result',
      //         icon: 'check-circle-o',
      //         path: '/result',
      //         routes: [
      //           {
      //             name: 'success',
      //             icon: 'smile',
      //             path: '/result/success',
      //             component: './result/success',
      //           },
      //           {
      //             name: 'fail',
      //             icon: 'smile',
      //             path: '/result/fail',
      //             component: './result/fail',
      //           },
      //         ],
      //       },
      //       {
      //         name: 'exception',
      //         icon: 'warning',
      //         path: '/exception',
      //         routes: [
      //           {
      //             name: '403',
      //             icon: 'smile',
      //             path: '/exception/403',
      //             component: './exception/403',
      //           },
      //           {
      //             name: '404',
      //             icon: 'smile',
      //             path: '/exception/404',
      //             component: './exception/404',
      //           },
      //           {
      //             name: '500',
      //             icon: 'smile',
      //             path: '/exception/500',
      //             component: './exception/500',
      //           },
      //         ],
      //       },
      //       // {
      //       //   name: 'account',
      //       //   icon: 'user',
      //       //   path: '/account',
      //       //   routes: [
      //       //     {
      //       //       name: 'center',
      //       //       icon: 'smile',
      //       //       path: '/account/center',
      //       //       component: './account/center',
      //       //     },
      //       //     {
      //       //       name: 'settings',
      //       //       icon: 'smile',
      //       //       path: '/account/settings',
      //       //       component: './account/settings',
      //       //     },
      //       //   ],
      //       // },
      //       // {
      //       //   name: 'editor',
      //       //   icon: 'highlight',
      //       //   path: '/editor',
      //       //   routes: [
      //       //     {
      //       //       name: 'flow',
      //       //       icon: 'smile',
      //       //       path: '/editor/flow',
      //       //       component: './editor/flow',
      //       //     },
      //       //     {
      //       //       name: 'mind',
      //       //       icon: 'smile',
      //       //       path: '/editor/mind',
      //       //       component: './editor/mind',
      //       //     },
      //       //     {
      //       //       name: 'koni',
      //       //       icon: 'smile',
      //       //       path: '/editor/koni',
      //       //       component: './editor/koni',
      //       //     },
      //       //   ],
      //       // },
      //       {
      //         path: '/',
      //         redirect: '/dashboard/analysis',
      //         authority: ['admin', 'user'],
      //       },
      //       {
      //         component: '404',
      //       },
      //     ],
      //   },
      // ],
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
  },
};
