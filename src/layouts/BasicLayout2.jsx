/**
 * Fu Hui Admin v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter, SettingDrawer } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import { Icon, Result, Button, Menu, Layout,Tabs,Dropdown } from 'antd';
import DocumentTitle from 'react-document-title';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import pathToRegexp from 'path-to-regexp';
import { formatMessage } from 'umi-plugin-react/locale';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { isAntDesignPro, getAuthorityFromRouter } from '@/utils/utils';
import SiderMenu from '@/components/SiderMenu';
import logo from '../assets/logo.svg';
const noMatch = (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);
/**
 * use Authorized check all menu item
 */

const menuDataRender = menuList =>
  menuList.map(item => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright="2019 Fu Hui Admin"
    links={[]}
  />
);

const footerRender = () => {
  if (isAntDesignPro()) {
    return defaultFooterDom;
  }

  return (
    <>
      {defaultFooterDom}
      <div
        style={{
          padding: '0px 24px 24px',
          textAlign: 'center',
        }}
      >
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
            width="82px"
            alt="netlify logo"
          />
        </a>
      </div>
    </>
  );
};

const BasicLayout = props => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;
  const {routes} = props.route,routeKey = '/dashboard/analysis',tabName = 'dashboard';
  const tabLists = this.updateTree(routes);
    let tabList=[],tabListArr=[];
    tabLists.map((v) => {
      if(v.key === routeKey){
        if(tabList.length === 0){
          v.closable = false
          v.tab = tabName
          tabList.push(v);
        }
      }
      if(v.key){
        tabListArr.push(v.key)
      }
    });
  /**
   * constructor
   */

  updateTree = data => {
    const treeData = data;
    const treeList = [];
    // 递归获取树列表
    const getTreeList = data => {
      data.forEach(node => {
        if(!node.level){
          treeList.push({ tab: node.name, key: node.path,locale:node.locale,closable:true,content:node.component });
        }
        if (node.routes && node.routes.length > 0) { //!node.hideChildrenInMenu &&
          getTreeList(node.routes);
        }
      });
    };
    getTreeList(treeData);
    return treeList;
  };

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, []);
  /**
   * init variables
   */

  const handleMenuCollapse = payload => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
  return (
    <>
      <ProLayout
        logo={logo}
        menuHeaderRender={(logoDom, titleDom) => (
          <Link to="/">
            {titleDom}
          </Link>
        )}
        onCollapse={handleMenuCollapse}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || menuItemProps.children) {
            return defaultDom;
          }

          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: formatMessage({
              id: 'menu.home',
              defaultMessage: 'Home',
            }),
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        menuDataRender={menuDataRender}
        formatMessage={formatMessage}
        rightContentRender={rightProps => <RightContent {...rightProps} />}
        {...props}
        {...settings}
      >
        <Authorized authority={authorized.authority} noMatch={noMatch}>
          {children}
        </Authorized>
      </ProLayout>
      <SettingDrawer
        settings={settings}
        onSettingChange={config =>
          dispatch({
            type: 'settings/changeSetting',
            payload: config,
          })
        }
      />
    </>
  );
};

class BasicLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    const {routes} = props.route,routeKey = '/home/home',tabName = '首页'; // routeKey 为设置首页设置 试试 '/dashboard/analysis' 或其他key值
    const tabLists = this.updateTree(routes);
    let tabList=[],tabListArr=[];
    tabLists.map((v) => {
      if(v.key === routeKey){
        if(tabList.length === 0){
          v.closable = false
          v.tab = tabName
          tabList.push(v);
        }
      }
      if(v.key){
        tabListArr.push(v.key)
      }
    });
    //获取所有已存在key值
    this.state = ({
        tabList:tabList,
        tabListKey:[routeKey],
        activeKey:routeKey,
        tabListArr,
        routeKey
    })

    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
  }

  componentDidMount() {
    this.props.history.push({ pathname : '/'  })
    const {
      dispatch,
      route: { routes, authority },
    } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
    });
    dispatch({
      type: 'setting/getSetting',
    });
    dispatch({
      type: 'menu/getMenuData',
      payload: { routes, authority },
    });
  }

  updateTree = data => {
    const treeData = data;
    const treeList = [];
    // 递归获取树列表
    const getTreeList = data => {
      data.forEach(node => {
        if(!node.level){
          treeList.push({ tab: node.name, key: node.path,locale:node.locale,closable:true,content:node.component });
        }
        if (node.routes && node.routes.length > 0) { //!node.hideChildrenInMenu &&
          getTreeList(node.routes);
        }
      });
    };
    getTreeList(treeData);
    return treeList;
  };

  componentDidUpdate(preProps) {
    // After changing to phone mode,
    // if collapsed is true, you need to click twice to display
    const { collapsed, isMobile } = this.props;
    if (isMobile && !preProps.isMobile && !collapsed) {
      this.handleMenuCollapse(false);
    }
  }

  getContext() {
    const { location, breadcrumbNameMap } = this.props;
    return {
      location,
      breadcrumbNameMap,
    };
  }

  matchParamsPath = (pathname, breadcrumbNameMap) => {
    const pathKey = Object.keys(breadcrumbNameMap).find(key => pathToRegexp(key).test(pathname));
    return breadcrumbNameMap[pathKey];
  };

  getRouterAuthority = (pathname, routeData) => {
    let routeAuthority = ['noAuthority'];
    const getAuthority = (key, routes) => {
      routes.map(route => {
        if (route.path && pathToRegexp(route.path).test(key)) {
          routeAuthority = route.authority;
        } else if (route.routes) {
          routeAuthority = getAuthority(key, route.routes);
        }
        return route;
      });
      return routeAuthority;
    };
    return getAuthority(pathname, routeData);
  };

  getPageTitle = (pathname, breadcrumbNameMap) => {
    const currRouterData = this.matchParamsPath(pathname, breadcrumbNameMap);

    if (!currRouterData) {
      return 'Ant Tabs';
    }
    const pageName = formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });

    return `${pageName} - Ant Tabs`;
  };

  getLayoutStyle = () => {
    const { fixSiderbar, isMobile, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '256px',
      };
    }
    return null;
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  renderSettingDrawer = () => {
    // Do not render SettingDrawer in production
    // unless it is deployed in preview.pro.ant.design as demo
    if (process.env.NODE_ENV === 'production' && APP_TYPE !== 'site') {
      return null;
    }
    return <SettingDrawer />;
  };

  onHandlePage =(e)=>{//点击左侧菜单
    let {menuData} = this.props,{key,search=''} = e;
    const tabLists = this.updateTreeList(menuData);
    const {tabListKey,tabList,tabListArr} =  this.state;
    if(tabListArr.includes(key)){
      if(!search){
        router.push(key)
      }else{
        router.push({pathname:key,search})
      }

    }else{
      key = '/exception/404'
      router.push('/exception/404')
    }

    this.setState({
      activeKey:key
    })
    tabLists.map((v) => {
      if(v.key === key){
        if(tabList.length === 0){
          v.closable = false
          this.setState({
            tabList:[...tabList,v]
          })
        }else{
          if(!tabListKey.includes(v.key)){
            this.setState({
              tabList:[...tabList,v],
              tabListKey:[...tabListKey,v.key]
            })
          }
        }
      }
    })
    // this.setState({
    //   tabListKey:this.state.tabList.map((va)=>va.key)
    // })
  }

    // 切换 tab页 router.push(key);
    onChange = key => {
        this.setState({ activeKey:key });
        router.push(key)
    };

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    }

    remove = (targetKey) => {
        let {activeKey} = this.state;
        let lastIndex;
        this.state.tabList.forEach((pane, i) => {
            if (pane.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const tabList = [],tabListKey=[]
        this.state.tabList.map(pane => {
          if(pane.key !== targetKey){
              tabList.push(pane)
              tabListKey.push(pane.key)
          }
        });
        if (lastIndex >= 0 && activeKey === targetKey) {
            activeKey = tabList[lastIndex].key;
        }
        router.push(activeKey)
        this.setState({ tabList, activeKey,tabListKey });
    }

    updateTreeList = data => {
        const treeData = data;
        const treeList = [];
        // 递归获取树列表
        const getTreeList = data => {
            data.forEach(node => {
              if(!node.level){
                treeList.push({ tab: node.name, key: node.path,locale:node.locale,closable:true,content:node.component });
              }
                if (node.children && node.children.length > 0) { //!node.hideChildrenInMenu &&
                    getTreeList(node.children);
                }
            });
        };
        getTreeList(treeData);
        return treeList;
    };

    onClickHover=(e)=>{
    // message.info(`Click on item ${key}`);
    let { key } = e,{activeKey,tabList,tabListKey,routeKey} = this.state;

    if(key === '1'){
      tabList= tabList.filter((v)=>v.key !== activeKey || v.key === routeKey)
      tabListKey = tabListKey.filter((v)=>v !== activeKey || v === routeKey)
      this.setState({
        activeKey:routeKey,
        tabList,
        tabListKey
      })
    }else if(key === '2'){
      tabList= tabList.filter((v)=>v.key === activeKey || v.key === routeKey)
      tabListKey = tabListKey.filter((v)=>v === activeKey || v === routeKey)
      this.setState({
        activeKey,
        tabList,
        tabListKey
      })
    }else if(key === '3'){
      tabList= tabList.filter((v)=>v.key === routeKey)
      tabListKey = tabListKey.filter((v)=>v === routeKey)
      this.setState({
        activeKey:routeKey,
        tabList,
        tabListKey
      })
    }

  }

  render() {
    const {
      navTheme,
      layout: PropsLayout,
      location: { pathname,search },
      isMobile,
      children,
      menuData,
      breadcrumbNameMap,
      route: { routes },
      fixedHeader,
      hidenAntTabs,
    } = this.props;
    let {activeKey,routeKey} = this.state;
    if(pathname === '/'){
          // router.push(routeKey)
          activeKey = routeKey
      }
    const isTop = PropsLayout === 'topmenu';
    const routerConfig = this.getRouterAuthority(pathname+search, routes);
    const contentStyle = !fixedHeader ? { paddingTop: 0 } : {};
    this.props.location.onHandlePage = this.onHandlePage;
    const menu = (
      <Menu onClick={this.onClickHover}>
        <Menu.Item key="1">关闭当前标签页</Menu.Item>
        <Menu.Item key="2">关闭其他标签页</Menu.Item>
        <Menu.Item key="3">关闭全部标签页</Menu.Item>
      </Menu>
    );
    const operations = (
      <Dropdown overlay={menu} >
        <a className="ant-dropdown-link" href="#">
          Hover me<Icon type="down" />
        </a>
      </Dropdown>
    );

    const layout = (
      <Layout>
        {isTop && !isMobile ? null : (
          <SiderMenu
            logo={logo}
            theme={navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuData}
            isMobile={isMobile}
            {...this.props}
            onHandlePage ={this.onHandlePage}
          />
        )}
        <Layout
          style={{
            ...this.getLayoutStyle(),
            minHeight: '100vh',
          }}
        >
          <Header
            menuData={menuData}
            handleMenuCollapse={this.handleMenuCollapse}
            logo={logo}
            isMobile={isMobile}
            {...this.props}
          />
          <Content className={styles.content} style={contentStyle}>
            {hidenAntTabs ?
              (<Authorized authority={routerConfig} noMatch={<Exception403 />}>
              {children}
                </Authorized>) :
              (this.state.tabList && this.state.tabList.length ? (
              <Tabs
                // className={styles.tabs}
                activeKey={activeKey}
                onChange={this.onChange}
                tabBarExtraContent={operations}
                tabBarStyle={{background:'#fff'}}
                tabPosition="top"
                tabBarGutter={-1}
                hideAdd
                type="editable-card"
                onEdit={this.onEdit}
              >
                {this.state.tabList.map(item => (
                  <TabPane tab={item.tab} key={item.key} closable={item.closable}>
                    <Authorized  noMatch={<Exception403 />}>
                      {/*{item.content}*/}
                      <Route key={item.key} path={item.path} component={item.content} exact={item.exact} />
                    </Authorized>
                  </TabPane>
                ))}
              </Tabs>
            ) : null)}
          </Content>
          <Footer />
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={this.getPageTitle(pathname, breadcrumbNameMap)}>
         {params => (
            <Context.Provider value={this.getContext()}>
              <div className={classNames(params)}>{layout}</div>
            </Context.Provider>
          )}
        </DocumentTitle>
        <Suspense fallback={<PageLoading />}>{this.renderSettingDrawer()}</Suspense>
      </React.Fragment>
    );
  }
}

export default connect(({ global, settings }) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
