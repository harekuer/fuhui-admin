
import { message } from 'antd'
import { query, remove, childList, categoryTree, updateCategory, removeDefaultCate, checkDefaultCate } from './service'

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
  },

  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
          
        if (location.pathname === '/osAdmin/category') {
            console.log('aa')
          dispatch({
            type: 'updateState',
            payload: {
              expandedRowKeys: [],
            },
          })
          dispatch({
            type: 'query',
            payload: {
              ...location.query,
            },
          })

        }
      })
    },
  },

  effects: {

    * query ({ payload = {} }, { call, put }) {
      const result = yield call(query, payload);
      const { code, data,  message } = result;
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
        let from = location.pathname
        window.location = `${location.origin}/admin/login?from=${from}`
      } else {
        throw message
      }
    },

    * singleRemove ({ payload }, { call, put }) {
      const result = yield call(remove, payload)
      const { code, message } = result;
      if (code === 200) {
        yield put({
           type: 'query',
         })
      } else if (code === 401) {
        let from = location.pathname
        window.location = `${location.origin}/admin/login?from=${from}`
      } else {
        throw message
      }
    },

    * saveCategory ({ payload }, { call, put }) {
      const result = yield call(updateCategory, payload)
      const { code, message } = result;
      if (code === 200) {
        message.success(message)
        yield put({
           type: 'query',
         })
      } else if (code === 401) {
        let from = location.pathname
        window.location = `${location.origin}/admin/login?from=${from}`
      } else {
        throw message
      }
    },

    * removeDefaultData ({ payload }, { call, put }) {
      const result = yield call(removeDefaultCate, payload)
      const { code, message } = result;
      if (code === 200) {
        message.success(message)
        yield put({
           type: 'query',
         })
         yield put({
           type: 'updateState',
           payload: {
             status: 0,
           },
         })
      } else if (code === 401) {
        window.location = `${location.origin}/admin/login`
      } else {
        throw message
      }
    },

    * checkDefaultProduct ({ payload }, { call, put }) {
      const result = yield call(checkDefaultData, payload)
      const { code, data, message } = result;
      if (code === 200) {
        if(Number(data.status) == 1) {
          message.error('该分类已包含产品，无法删除')
        } else {
          yield put({
             type: 'removeDefaultData',
           })
        }
      } else if (code === 401) {
        window.location = `${location.origin}/admin/login`
      } else {
        throw message
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
