
import { query, menuInfo, addOrEditMenu, deleteMenu } from './service'
import { message} from 'antd';


export default {
  namespace: 'centerMenu',

  state: {
    menuList: [],               // 菜单集合
    menuInfo: null,             // 菜单详情
    addInfo: null,              // 菜单详情
    editModalVisible: false,    // 编辑弹窗
    addModalVisible: false,     // 新增弹窗
    expendIds: []               // 展开的节点id集合
  },

  // subscriptions: {
  //   setup({ dispatch, history }) {
  //     history.listen((location) => {
  //       if (location.pathname === '/osAdmin/menu/centerMenu') {
  //         dispatch({
  //           type: 'query'
  //         })
  //       }
  //     })
  //   },
  // },

  effects: {

    // 请求获取菜单列表
    * query({ payload = { } }, { call, put, select }) {

      const { expendIds } = yield select(state => state.centerMenu)
      const response  = yield call(query, payload);
      const { code, data} = response

      if (code === 200) {

        // 过滤一遍，添加展开参数
        let newData = addExpendId(data, expendIds)

        yield put({
          type: 'updateState',
          payload: {
            menuList: newData
          },
        })
      } else {
        message.error(response.message);
      }
    },

    // 请求获取菜单列表
    * getMenuInfo({ payload = {} }, { call, put }) {

      const { code, data, message } = yield call(menuInfo, payload);

      if (code === 200) {
        yield put({
          type: 'updateState',
          payload: {
            menuInfo: data
          },
        })
      } else {
        message.error(message);
      }
    },

    // 新增菜单
    * addMenu({ payload }, { select, call, put }) {
      const { code, data, message } = yield call(addOrEditMenu, payload);

      if (code === 200) {
        yield put({
          type: 'updateState',
          payload: {
            addInfo: null,
            addModalVisible: false
          },
        })

        yield put({ type: 'query' })

      } else {
        message.error(message);
      }


    },

    // 编辑菜单
    * editMenu({ payload }, { select, call, put }) {
      const { code, data, message } = yield call(addOrEditMenu, payload);

      if (code === 200) {

        yield put({
          type: 'updateState',
          payload: {
            menuInfo: null,
            editModalVisible: false
          },
        })

        yield put({ type: 'query' })

      } else {
        message.error(message);
      }
    },

    // 删除菜单
    * deleteMenu({ payload }, { select, call, put }) {
      const { code, data, message } = yield call(deleteMenu, payload);

      if (code === 200) {

        yield put({ type: 'query' })

      } else {
        message.error(message);
      }
    },
  },


  reducers: {
    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
  },
  },

}



/**
 * 遍历菜单，添加展开节点
 * @param {*} data
 * @param {*} ids
 */
const addExpendId = (data, ids) => {
  data.map(i => {
    // 如果节点在展开数组上，则添加展开参数
    if (ids.indexOf(i.menu_id) >= 0) {
      i.expanded = true
    }

    if (i.children) {
      addExpendId(i.children, ids)
    }
  })

  return data;
}
