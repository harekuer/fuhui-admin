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
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null);
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
          key: node.path,
          locale: node.locale,
          closable: true,
          content: node.component,
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
      if (!node.level) {
        treeList.push({
          tab: node.name,
          key: node.path,
          locale: node.locale,
          closable: true,
          content: node.component,
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


const BasicLayout = props => {
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
  } = props;
  const initTab = location.pathname.split('/')
  const {routes} = route,key = location.pathname,tabName = initTab[initTab.length - 1]; // routeKey 为设置首页设置
  //const {menuList:routes} = user.currentUser,key = location.pathname,tabName = initTab[initTab.length - 1]; // routeKey 为设置首页设置
  let tabLists = updateTree(routes);
  console.log(tabLists)

  let aList = [],
    aListArr = [];
  tabLists.map(v => {
    if (v.key === key) {
      if (aList.length === 0) {
        v.closable = false;
        v.tab = tabName;
        aList.push(v);
      }
    }
    if (v.key) {
      aListArr.push(v.key);
    }
  });
  /**
   * constructor
   */
  const [tabListKey, setTabListKey] = useState([key]);
  const [tabList, setTabList] = useState(aList);
  const [tabListArr, setTabListArr] = useState(aListArr);
  const [routeKey, setRouteKey] = useState(key);
  const [activeKey, setActiveKey] = useState(key);

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
      dispatch({
        type: 'user/fetchMenu',
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

  const onHandlePage = (props) => {
    
    //点击左侧菜单
    let key = '';
    if(props.autoConfig !== ''){
      key = props.autoConfig 
    } else {
      key = props.path
    }
   console.log(key)
    const tabLists = updateTreeList(routes);
    if (tabListArr.includes(key)) {
      router.push({ pathname: key });
    } else {
      key = '/exception/404';
      router.push('/exception/404');
    }
    setActiveKey(key);

    tabLists.map(v => {
      if (v.key === key) {
        if (tabList.length === 0) {
          v.closable = false;
          setTabList([...tabList, v]);
          setTabListKey([...tabListKey, v.key]);
        } else {
          if (!tabListKey.includes(v.key)) {
            setTabList([...tabList, v]);
            setTabListKey([...tabListKey, v.key]);
          }
        }
      }
    });
  };

  const onClickHover = e => {
    let { key } = e;
    let aList = tabList;
    let aListKey = tabListKey;
    let aKey = activeKey;
    let oKey = routeKey;

    if (key === '1') {
      aList = aList.filter(v => v.key !== aKey || v.key === oKey);
      aListKey = aListKey.filter(v => v !== aKey || v === oKey);
      setActiveKey(oKey);
      setTabList(aList);
      setTabListKey(aListKey);
    } else if (key === '2') {
      aList = aList.filter(v => v.key === aKey || v.key === oKey);
      aListKey = aListKey.filter(v => v === aKey || v === oKey);
      setActiveKey(aKey);
      setTabList(aList);
      setTabListKey(aListKey);
    } else if (key === '3') {
      aList = aList.filter(v => v.key === oKey);
      aListKey = aListKey.filter(v => v === oKey);
      setActiveKey(oKey);
      setTabList(aList);
      setTabListKey(aListKey);
    }
  };

  const onEdit = (targetKey, action) => {
    let aKey = activeKey;
    if (action === 'remove') {
      let lastIndex;
      tabList.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const aList = [],
        aListKey = [];
      tabList.map(pane => {
        if (pane.key !== targetKey) {
          aList.push(pane);
          aListKey.push(pane.key);
        }
      });
      if (lastIndex >= 0 && aKey === targetKey) {
        aKey = aList[lastIndex].key;
      }
      router.push(aKey);
      setActiveKey(aKey);
      setTabList(aList);
      setTabListKey(aListKey);
    }
  };

  // 切换 tab页 router.push(key);
  const onChange = key => {
    setActiveKey(key);
    router.push(key);
  };

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
  const menu = (
    <Menu onClick={onClickHover}>
      <Menu.Item key="1">关闭当前菜单</Menu.Item>
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


  console.log(user.currentUser.menuList)
  return (
    <>
      <ProLayout
        logo={logo}
        menuHeaderRender={(logoDom, titleDom) => (
          <Link to="/">
            {titleDom}
          </Link>
        )}
        route={{
          routes: user.currentUser.menuList,
        }}
        openKeys={false}
        onCollapse={handleMenuCollapse}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || menuItemProps.children) {
            return defaultDom;
          }

          return (
            <Link to={menuItemProps.path} onClick={() => onHandlePage(menuItemProps)}>
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
        menuDataRender={() => user.currentUser.menuList}
        formatMessage={formatMessage}
        rightContentRender={rightProps => <RightContent {...rightProps} />}
        {...props}
        {...settings}
      >
        {/* <Authorized authority={authorized.authority} noMatch={noMatch}>
          {children}
        </Authorized> */}
        {hidenAntTabs ? (
          <Authorized authority={authorized.authority} noMatch={noMatch}>
            {children}
          </Authorized>
        ) : tabList && tabList.length ? (
          <Tabs
            lassName={styles.multitabs}
            activeKey={activeKey}
            onChange={onChange}
            tabBarExtraContent={operations}
            tabBarStyle={{ background: '#fff' }}
            tabPosition="top"
            tabBarGutter={-1}
            hideAdd
            type="editable-card"
            onEdit={onEdit}
          >
            {tabList.map(item => (
              <TabPane
                tab={formatMessage({
                  id: `menu.tab.${item.tab}`,
                })}
                key={item.key}
                closable={true}
              >
                <Authorized authority={authorized.authority} noMatch={noMatch}>
                  <Route
                    key={item.key}
                    path={item.path}
                    component={item.content}
                    exact={item.exact}
                  />
                </Authorized>
              </TabPane>
            ))}
          </Tabs>
        ) : null}
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

export default connect(({ global, settings, user }) => ({
  collapsed: global.collapsed,
  settings,
  user
}))(BasicLayout);
