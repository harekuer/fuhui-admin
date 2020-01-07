
import { query, menuInfo, addOrEditMenu, deleteMenu } from './service'

import { Error } from 'utils/warn'


export default  {
  namespace: 'siteMenu',

  state: {
    menuList: [],               // 菜单集合
    menuInfo: null,             // 菜单详情
    addInfo: null,              // 菜单详情
    editModalVisible: false,   // 编辑弹窗
    addModalVisible: false,    // 新增弹窗
    expendIds: []               // 展开的节点id集合
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/_os/menu/siteMenu') {
          dispatch({
            type: 'query'
          })
        }
      })
    },
  },

  effects: {

    // 请求获取菜单列表
    * query({ payload = {} }, { call, put, select }) {

      const { expendIds } = yield select(state => state.siteMenu)
      const { code, data, message } = yield call(query, payload);

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
        Error(message);
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
        Error(message);
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
        Error(message);
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
        Error(message);
      }
    },

    // 删除菜单
    * deleteMenu({ payload }, { select, call, put }) {
      const { code, data, message } = yield call(deleteMenu, payload);

      if (code === 200) {

        yield put({ type: 'query' })

      } else {
        Error(message);
      }
    },
  },


  reducers: {
    updateState(state, { payload }) {
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
  data.map((i,index) => {
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
