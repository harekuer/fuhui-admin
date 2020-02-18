import { query, save, getConfig } from './service';
import { routerRedux } from 'dva/router';
import { message} from 'antd';

const Model = {
  namespace: 'productDetail',
  state: {
    data: {
      productKeywords: ['']
    },
    config: {},
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);
      const { data, code } =response
      if(code === 200){
        yield put({
            type: 'queryData',
            payload: data === null ? {} : data,
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

    *update({ payload }, { call, put }) {
      const response = yield call(update, payload); // post
      const { data, code } =response
      if(code === 200){
        yield put({
            type: 'fetch',
            payload: {},
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

    *getConfig({ payload }, { call, put }) {
        const response = yield call(getConfig, payload); // post
        const { data, code } =response
        if(code === 200){
            yield put({
                type: 'updateState',
                payload: {
                    config: data
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

    *updateSort({ payload }, { call, put }) {
        const response = yield call(updateSort, payload); // post
        const { data, code } =response
        if(code === 200){
            message.success(response.message)
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

  },
  reducers: {
    queryData(state, action) {
      return { ...state, data: action.payload };
    },

    updateState (state, { payload }) {
        return {
          ...state,
          ...payload,
        }
    },

    appendList(
      state = {
        list: [],
      },
      action,
    ) {
      return { ...state, list: state.list.concat(action.payload) };
    },
  },
};
export default Model;

