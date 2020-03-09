import { query, update,updateSort,remove } from './service';
import { routerRedux } from 'dva/router';
import { message} from 'antd';

const Model = {
  namespace: 'cashsale',
  state: {
    list: [],
    key: 'index-spot-image',
    lang: 'en',
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);
      const { data, code } =response
      if(code === 200){
        yield put({
            type: 'queryList',
            payload: Array.isArray(data) ? data : [],
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
          payload: {
            module: payload.module,
            lang: payload.lang,
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

    *remove({ payload }, { call, put }) {
      const response = yield call(remove, payload); // post
      const { data, code } =response
      if(code === 200){
          yield put({
            type: 'fetch',
            payload: {
              module: payload.module,
              lang: payload.lang,
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
    queryList(state, action) {
      return { ...state, list: action.payload };
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

