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
      obj.name= item.icon
      if (item.children) {
        // 递归处理树状结构
        obj.children = getTreeList(item.children)
      }
      list.push(obj)
    })
  }
  return list
}

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {
      name:'',
      menuList: [],
    },
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
      const response = yield call(queryMenu);
      const { data, code } = response
      if(code === 200){
        let list = []
        list = getTreeList(data)

        yield put({
          type: 'saveCurrentUser',
          payload: {
            menuList: list,
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
      return { ...state, currentUser: {...state.currentUser,...action.payload} || {} };
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
