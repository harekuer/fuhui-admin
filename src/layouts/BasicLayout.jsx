/**
 * Fu Hui Admin v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter, SettingDrawer,MenuDataItem, getMenuData} from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import Link from 'umi/link';
import router from 'umi/router';
import { connect } from 'dva';
import { Icon, Result, Button, Tabs, Dropdown, Menu } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { isAntDesignPro, getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/logo.svg';
import styles from './UserLayout.less';

const { TabPane } = Tabs;

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
    const localItem = { 
      ...item,
      children: item.children ? menuDataRender(item.children) : [] 
    };
    if(item.isShow == '1'){
      return Authorized.check(item.authority, localItem, null);
    }
  });

const defaultFooterDom = <DefaultFooter copyright="2019 Fu Hui Admin" links={[]} />;

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

const updateTree = data => {
  const treeData = data;
  const treeList = [];
  // 递归获取树列表
  const getTreeList = data => {
    data.forEach(node => {
      if (!node.level) {
        treeList.push({
          tab: node.name,
          tabName: node.tabName,
          key: node.path,
          locale: node.locale,
          closable: true,
          content: node.component,
          url: node.url,
        });
      }
      if (node.routes && node.routes.length > 0) {
        //!node.hideChildrenInMenu &&
        getTreeList(node.routes);
      }
    });
  };
  getTreeList(treeData);
  return treeList;
};

const updateTreeList = data => {
  const treeData = data;
  const treeList = [];
  // 递归获取树列表
  const getTreeList = data => {
    data.forEach(node => {
      treeList.push({
        tab: node.name,
        key: node.path,
        locale: node.locale,
        closable: true,
        autoConfig: node.autoConfig,
        content: node.component,
      });
      if (node.children && node.children.length > 0) {
        //!node.hideChildrenInMenu &&
        getTreeList(node.children);
      }
    });
  };
  getTreeList(treeData);
  return treeList;
};

const getTabList = (routeList, menuList) => {
  menuList.map(item => {
    let key = '';
    if(item.autoConfig !== ''){
      key = item.autoConfig 
    } else {
      key = item.key
    }
    routeList.forEach(option => {
      if(key === option.key) {
        item.content = option.content
      }
    })
    return item
  })
  return menuList
}



class BasicLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    const initTab = location.pathname.split('/')
    const {routes} = props.route,key = location.pathname,tabName = initTab[initTab.length - 1]; 
    const routeKey = '/osAdmin/dashboard' // routeKey 为设置首页设置
    
    let tabList=[],tabListArr=[];
    //获取所有已存在key值
    this.state = ({
        tabList:tabList,
        tabListKey:[key],
        activeKey:key,
        tabListArr,
        tabLists: [],
        routeKey: routeKey,
    })
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let times = prevState.tabList.length;
    if(times === 0) {
      const initTab = location.pathname.split('/')
      let { tabListKey } = prevState
      const {routes} = nextProps.route,key = location.pathname; 
      const routeKey = '/osAdmin/dashboard' // routeKey 为设置首页设置
      const {tabMenuList} = nextProps.user
      let routeLists = updateTree(routes);
      let tabLists = getTabList(routeLists,tabMenuList)
      let tabList=[],tabListArr=[];
      tabLists.map((v) => {
        if(v.key === routeKey) {
          v.closable = false
          tabList.splice(0, 0, v);
        } else if(v.key !== routeKey && v.key === key){
            v.closable = true
            tabList.push(v);
            tabListKey.push(v.key)
        }
        if(v.key){
          tabListArr.push(v.key)
        }
      });
      return {
        tabList,
        tabLists,
        tabListArr,
        tabListKey
      }
    } else if(!!nextProps.user.changeActiveTab){
      let { tabList,tabListArr, activeKey,tabListKey } = prevState
      const {routes} = nextProps.route
      let { activeTab } = nextProps.user
      
      if(!tabListKey.includes(activeTab.key)){
        let routeLists = updateTree(routes);
        routeLists.forEach((v) => {
          if(v.key === activeTab.key){
            activeTab.content = v.content
          }
        });
        tabListArr.push(activeTab.key)
        tabListKey.push(activeTab.key)
        tabList.push(activeTab)
      } else {
        tabList.map(item => {
          if(item.key === activeTab.key){
            item.state = activeTab.state
          }
          return item
        })
      }
      activeKey = activeTab.key
      const { dispatch } = nextProps
      dispatch({
        type: 'user/updateState',
        payload: {
          changeActiveTab: false
        }
      });
      return {
        tabList,
        tabListArr,
        tabListKey,
        activeKey,
      }
    } else {
      return null
    }
  }

  componentDidMount() {
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
    });
    dispatch({
      type: 'user/fetchMenu',
    });
  }
  /**
   * init variables
   */

  handleMenuCollapse = payload => {
    const { dispatch } = this.props
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  onHandlePage = (props) => {
    //点击左侧菜单
    let key = props.path
    const {tabLists,tabListKey,tabList,tabListArr} =  this.state;
    const { dispatch } = this.props
    dispatch({
      type: 'user/updateState',
      payload: {
        activeTab: props
      }
    });
    if (tabListArr.includes(key)) {
      router.push({ pathname: key });
    } else {
      key = '/exception/404';
      router.push('/exception/404');
    }
    this.setState({
      activeKey:key
    })
    tabLists.map(v => {
      if (v.key === key) {
        if (tabList.length === 0) {
          v.closable = false;
          this.setState({
            tabList:[...tabList,v],
            tabListKey:[...tabListKey,v.key]
          })
        } else {
          if (!tabListKey.includes(v.key)) {
            this.setState({
              tabList:[...tabList,v],
              tabListKey:[...tabListKey,v.key]
            })
          }
        }
      }
    });
  };

  onClickHover = e => {
    let { key } = e,{activeKey,tabList,tabListKey,routeKey,tabLists} = this.state;
    const { dispatch } = this.props
    if (key === '1') {//关闭当前tab
      tabList= tabList.filter((v)=>v.key !== activeKey || v.key === routeKey)
      tabListKey = tabListKey.filter((v)=>v !== activeKey || v === routeKey)
      this.setState({
        activeKey:routeKey,
        tabList,
        tabListKey
      })
    } else if (key === '2') {//关闭其他
      tabList= tabList.filter((v)=>v.key === activeKey || v.key === routeKey)
      tabListKey = tabListKey.filter((v)=>v === activeKey || v === routeKey)
      this.setState({
        activeKey,
        tabList,
        tabListKey
      })
    } else if (key === '3') { //关闭全部
      tabList= tabList.filter((v)=>v.key === routeKey)
      tabListKey = tabListKey.filter((v)=>v === routeKey)
      dispatch({
        type: 'user/updateState',
        payload: {
          activeTab:tabList[0],
        }
      });
      router.push(routeKey)
      this.setState({
        activeKey:routeKey,
        tabList,
        tabListKey,
      })
    }
  };

  onEdit = (targetKey, action) => {
    let {activeKey} = this.state;
    const { dispatch } = this.props
    let activeTab = {}
    if (action === 'remove') {
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
          activeTab = tabList[lastIndex]
      }
      dispatch({
        type: 'user/updateState',
        payload: {
          activeTab,
        }
      });
      if(activeTab.state){
        router.push({
          pathname: activeKey,
          state: {
            ...activeTab.state
          }
        });
      } else {
        router.push(activeKey);
      }
      this.setState({ tabList, activeKey,tabListKey });
    }
  };

  // 切换 tab页 router.push(key);
  onChange = key => {
    const {tabList} = this.state;
    const { dispatch } = this.props
    let activeTab = {}
    this.setState({
      activeKey: key,
    })
    tabList.forEach(item =>{
      if(item.key === key) {
        activeTab = item
      }
    })
    dispatch({
      type: 'user/updateState',
      payload: {
        activeTab,
      }
    });
    if(activeTab.state){
      router.push({
        pathname: key,
        state: {
          ...activeTab.state
        }
      });
    } else {
      router.push(key);
    }
  };

  render() {
    const {
      dispatch,
      children,
      settings,
      user,
      route, 
      menuData,
      hidenAntTabs,
      location = {
        pathname: '/',
      },
    } = this.props;

    const { tabList,activeKey } = this.state
    
    const authorized = getAuthorityFromRouter(this.props.route.routes, location.pathname || '/') || {
      authority: undefined,
    };
    const menu = (
      <Menu onClick={this.onClickHover}>
        {/* <Menu.Item key="1">关闭当前菜单</Menu.Item> */}
        <Menu.Item key="2">关闭其他菜单</Menu.Item>
        <Menu.Item key="3">关闭全部菜单</Menu.Item>
      </Menu>
    );
    const operations = (
      <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" href="#">
          菜单操作
          <Icon type="down" />
        </a>
      </Dropdown>
    );
  
  //console.log(tabList)
    return (
      <>
        <ProLayout
          logo={logo}
          menuHeaderRender={(logoDom, titleDom) => (
            <a href="/" target="_blank">
              {titleDom}
            </a>
          )}
          route={{
            routes: user.menuList,
          }}
          openKeys={false}
          onCollapse={this.handleMenuCollapse}
          menuItemRender={(menuItemProps, defaultDom) => {
            if (menuItemProps.isUrl || menuItemProps.children) {
              return defaultDom;
            }
            return (
              <Link to={menuItemProps.path} onClick={() => this.onHandlePage(menuItemProps)}>
                {defaultDom}
              </Link>
            );
          }}
          breadcrumbRender={(routers = []) => []}
          itemRender={(route, params, routes, paths) => {
            const first = routes.indexOf(route) === 0;
            return first ? (
              <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
            ) : (
              <span>{route.breadcrumbName}</span>
            );
          }}
          //menuDataRender={menuDataRender}
          menuDataRender={() => menuDataRender(user.menuList)}
          //formatMessage={formatMessage}
          rightContentRender={rightProps => <RightContent {...rightProps} />}
          {...this.props}
          {...settings}
        >
          {/* <Authorized authority={authorized.authority} noMatch={noMatch}>
            {children}
          </Authorized> */}
          {hidenAntTabs ? (
            <Authorized authority={authorized.authority} noMatch={this.noMatch}>
              {children}
            </Authorized>
          ) : tabList && tabList.length ? (
            <Tabs
              lassName={styles.multitabs}
              activeKey={activeKey}
              onChange={this.onChange}
              tabBarExtraContent={operations}
              tabBarStyle={{ background: '#fff' }}
              tabPosition="top"
              tabBarGutter={-1}
              hideAdd
              type="editable-card"
              onEdit={this.onEdit}
            >
              {tabList.map(item => (
                <TabPane
                  tab={item.tab}
                  key={item.key}
                  closable={item.closable}
                >
                  <Authorized authority={authorized.authority} noMatch={noMatch}>
                    <Route
                      key={item.key}
                      path={item.key}
                      component={item.content}
                      exact={item.exact}
                    />
                  </Authorized>
                </TabPane>
              ))}
            </Tabs>
          ) : null}
        </ProLayout>
        {/* <SettingDrawer
          settings={settings}
          onSettingChange={config =>
            dispatch({
              type: 'settings/changeSetting',
              payload: config,
            })
          }
        /> */}
      </>
    );
  }
  
};

export default connect(({ global, settings, user }) => ({
  collapsed: global.collapsed,
  settings,
  user
}))(BasicLayout);
