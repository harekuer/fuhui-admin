/* global location */
import pathToRegexp from 'path-to-regexp'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import { detail, create, update, categoryTree } from '../service'

export default {

  namespace: 'categoryDetail',

  state: {
    data: {
      categoriesArr: [],
      add_time: '',
      categories_id: '',
      categories_name: '',
      meta_description: '',
      meta_keyword: '',
      meta_title: '',
      parent_id: '',
      sort: '',
    },
    categoryList: [],
  },

  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        const match = pathToRegexp('/osAdmin/category/detail').exec(location.pathname);
        const { state } = location;
        if (match) {
          dispatch({
            type: 'querySuccess',
            payload: {
              data: {
                categoriesArr: [],
                add_time: '',
                categories_id: '',
                categories_description:'',
                categories_name: '',
                meta_description: '',
                meta_keyword: '',
                meta_title: '',
                parent_id: '',
                sort: '',
              },
            },
          })
          dispatch({
            type: 'getCategoryTree',
          })
          if(state.type && state.type === 'update') {
            
            dispatch({
              type: 'query',
              payload: {
                categories_id: state.category,
                lang: state.lang,
              }
            })
          }

        }
      })
    },
  },

  effects: {
    * query ({  payload }, { call, put }) {
      const result = yield call(detail, payload)
      const { code, data } = result
      if (code === 200) {
        yield put({
          type: 'querySuccess',
          payload: {
            data: data,
          },
        })
      } else {
        message.error(result.message)
      }
    },

    * change ({ payload }, { call, put }) {
      const result = yield call(update, payload)
      if (result.code === 200) {
        message.success(result.message)
      } else {
        message.error(result.message)
      }
    },

    * add ({ payload }, { call, put }) {
      const result = yield call(update, payload)
      if (result.code === 200) {
        message.success(result.message)
      } else {
        message.error(result.message)
      }
    },

    * getCategoryTree ({  payload }, { call, put }) {
      const result = yield call(categoryTree, payload)
      const { code,  data } = result
      if (code === 200) {
        yield put({
          type: 'updateState',
          payload: {
            categoryList: data,
          },
        })
      } else {
        message.error(result.message)
      }
    },

  },

  reducers: {
    querySuccess (state, { payload }) {
      const { data } = payload
      return {
        ...state,
        data,
      }
    },
    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
}
