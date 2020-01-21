import { query,update, remove, updateSort,extraInfo } from './service';
import { routerRedux } from 'dva/router';
import { message} from 'antd';

const Model = {
  namespace: 'designer',
  state: {
    list: [],
    key:'index-designser',
    editModalVisible: false,   // 编辑弹窗
    extraData:{},//弹窗详情
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);
      const { data, code } =response
      if(code === 200){
        yield put({
            type: 'queryList',
            payload:Array.isArray(data) ? data : []
            
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
        if(!payload.id){
            yield put({
                type: 'fetch',
                payload: {
                  module: payload.module,
                },
            });
        } 
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
      const { data, code } = response
      if (code === 200) {
        yield put({
          type: 'fetch',
          payload: {
            module: payload.module,
          },
        });
      } else if (code === 401) {
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
      const { data, code } = response
      if (code === 200) {
        message.success(response.message)
      } else if (code === 401) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
          }),
        );
      } else {
        message.error(response.message)
      }
    },

    *extraInfo({ payload }, { call, put }) {
      const response = yield call(extraInfo, payload);
      const { data, code } = response
      if (code === 200) {
        yield put({
          type: 'updateState',
          payload: {
            editModalVisible: false,
            extraData:{}
          }
        })
        message.success(response.message)
        

      } else if (code === 401) {
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

