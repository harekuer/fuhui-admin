/* global location */
import pathToRegexp from 'path-to-regexp'
import { message } from 'antd'
import { detail, update } from '../service'

export default {

  namespace: 'articleDetail',

  state: {
    data: {
      title: '',
      content: ''
    },
    articleList: [],
  },

  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen((location) => {
        const match = pathToRegexp('/osAdmin/home/article/detail').exec(location.pathname);
        const { state } = location;
        if (match) {
          dispatch({
            type: 'querySuccess',
            payload: {
              data: {
                title: '',
                content: ''
              },
            },
          })
          if(state && state.type === 'update') {
            dispatch({
              type: 'query',
              payload: {
                id: state.id,
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
      const { code,  data } = result
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
