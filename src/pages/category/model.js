
import { query, remove, update, categoryTree, updateCategory, removeDefaultCate, checkDefaultCate } from './service'
import { message } from 'antd'

//数据添加nav_id数组
function addTreeNode(list, id, pid) {
  if(list.length) {
    list.map((item, index) => {
      item.par_id = pid.concat(item.categories_id);
      item.nav_id = id.concat(index);
      item.sort = index;
      item.expanded = true;
      if(item.children) {
        addTreeNode(item.children, item.nav_id, item.par_id)
      }
      return item
    })
  }
}

//expandedRowKeys数组
function treeExpandedKeys(list, keys) {
  if(list.length) {
    list.forEach((item, index) => {
      keys.push(item.categories_id);
      if(item.children) {
        treeExpandedKeys(item.children, keys)
      }
    })
  }
  return keys
}
export default {
  namespace: 'category',

  state: {
    data: [],
    expandedRowKeys: [],
    cateIds: [],
    status: 0,
    lang:'en'
  },

  // subscriptions: {
  //   setup ({ dispatch, history }) {
  //     history.listen((location) => {
  //       if (location.pathname === '/osAdmin/category') {
  //         dispatch({
  //           type: 'updateState',
  //           payload: {
  //             expandedRowKeys: [],
  //           },
  //         })
  //         dispatch({
  //           type: 'query',
  //           payload: {
  //             ...location.query,
  //           },
  //         })

  //       }
  //     })
  //   },
  // },

  effects: {

    * query ({ payload = {} }, { call, put }) {
      const result = yield call(query, payload);
      const { code, data} = result;
      if (code === 200) {
        let list = data === null? [] : data;
        const rowKeys = treeExpandedKeys(list, []);
        addTreeNode(list, [], []);
        yield put({
          type: 'updateState',
          payload: {
            data: list,
            expandedRowKeys: rowKeys,
          },
        })
      } else if (code === 401) {
        window.location = `${location.origin}/user/login`
      } else {
        message.error(result.message)
        //throw message
      }
    },

    * singleRemove ({ payload }, { call, put }) {
      const result = yield call(remove, payload)
      const { code} = result;
      if (code === 200) {
        yield put({
           type: 'query',
           payload: {
             lang: payload.lang,
           }
         })
      } else if (code === 401) {
        window.location = `${location.origin}/user/login`
      } else {
        message.error(result.message)
        //throw message
      }
    },

    * saveCategory ({ payload }, { call, put }) {
      const result = yield call(updateCategory, payload)
      const { code } = result;
      if (code === 200) {
          yield put({
           type: 'query',
           payload: {
            lang: payload.lang,
           }
         })
         message.success(result.message)
      } else if (code === 401) {
        window.location = `${location.origin}/user/login`
      } else {
        message.error(result.message)
        //throw message
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
