import { queryCurrent, queryMenu, query as queryUsers } from '@/services/user';
import { routerRedux } from 'dva/router';
import { message} from 'antd';

// 递归拷贝菜单数据
const getTreeList = (nodeList) => {
  let list = []
  if (nodeList.length) {
    nodeList.forEach((item) => {
      let obj = {}
      if(item.route !== 'null'){
        obj.path = item.route
        obj.component = item.route.replace('/osAdmin','.')
      } else {
        obj.path = '/'
      }
      obj.key = item.menu_id
      obj.icon = item.icon
      obj.name= item.name_zh
      obj.tabName= item.name_en
      obj.autoConfig = item.route_backend
      obj.url = item.url
      obj.isShow = item.is_show
      if (item.children) {
        // 递归处理树状结构
        obj.children = getTreeList(item.children)
      }
      list.push(obj)
    })
  }
  return list
}

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
        url: node.url,
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

const getActiveTab = (list,path) => {
  let obj = {}
  list.forEach(item => {
    if(item.key === path){
      obj = item
    } 
    if (item.children && item.children.length > 0) {
      getTreeList(item.children,path);
    }
  })
  return obj
}

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {
      name:'',
    },
    menuList: [],
    tabMenuList: [],
    activeTab: {},
    changeActiveTab: false,
  },
  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchMenu(_, { call, put }) {
      const response = yield call(queryMenu,{app_id:10002});
      const { data, code } = response
      if(code === 200){
        let list = []
        list = getTreeList(data)
        const tabMenuList = updateTreeList(list)
        const activeTab = getActiveTab(tabMenuList, location.pathname)
        yield put({
          type: 'updateState',
          payload: {
            menuList: list,
            tabMenuList,
            activeTab,
          },
        });
      } else if(code === 401){
        yield put(
            routerRedux.replace({
              pathname: '/user/login',
            }),
        );
      } else {
          message.error(response.message)
      }
    },

    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: {
          name: response.data.nickname,
        },
      });
    },
  },
  reducers: {
    saveCurrentUser(state, action) {
      return { ...state, currentUser: { ...state.currentUser, ...action.payload } || {} };
    },

    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },

    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
export default UserModel;
