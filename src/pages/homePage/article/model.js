
import { query, remove,  updateSort } from './service'
import { message } from 'antd'

//数据添加nav_id数组
function addTreeNode(list, id, pid) {
  if(list.length) {
    list.map((item, index) => {
      item.par_id = pid.concat(item.id);
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
      keys.push(item.id);
      if(item.children) {
        treeExpandedKeys(item.children, keys)
      }
    })
  }
  return keys
}
export default {
  namespace: 'article',

  state: {
    data: [],
    expandedRowKeys: [],
    cateIds: [],
    status: 0,
    key: 'footer-article-list1'
  },


  effects: {

    * query ({ payload = {} }, { call, put }) {
      const result = yield call(query, payload);
      const { code, data, } = result;
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
        window.location = './login.html'
      } else {
        message.error(result.message)
      }
    },

    * singleRemove ({ payload }, { call, put }) {
      const result = yield call(remove, payload)
      const { code, } = result;
      if (code === 200) {
        yield put({
           type: 'query',
         })
      } else if (code === 401) {
        window.location = './login.html'
      } else {
        message.error(result.message)
      }
    },

    * saveCategory ({ payload }, { call, put }) {
      const result = yield call(updateSort, payload)
      const { code } = result;
      if (code === 200) {
        yield put({
           type: 'query',
         })
         message.success(result.message)
      } else if (code === 401) {
        window.location = './login.html'
      } else {
        message.error(result.message)
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
