// 开发环境与线下环境配置，开发环境是为true，打包的时候设为false.
const isDev = process.env.NODE_ENV !== 'production';

const BaseUrl = isDev ? '' : '/osAdmin'

export default {
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: 'daybreak',
  layout: 'sidemenu',
  contentWidth: 'Fluid',
  fixedHeader: true,
  autoHideHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: 'Fu Hui Admin',
  pwa: false,
  iconfontUrl: '',
  langUrl: `${BaseUrl}/ueditor/lang/zh-cn/zh-cn.js`,
  configUrl: `${BaseUrl}/ueditor/ueditor.config.js?v=1.2`,
  allUrl: `${BaseUrl}/ueditor/ueditor.all.min.js?v=1.2`,
};
