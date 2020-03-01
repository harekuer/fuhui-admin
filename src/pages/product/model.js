import { query, save, getConfig, categoryTree } from './service';
import { routerRedux } from 'dva/router';
import { message} from 'antd';

const Model = {
  namespace: 'productDetail',
  state: {
    data: {
      productKeywords: [''],
      customMoreProperty: [
        {
          text: '',
          value: '',
        }
      ],
      ladderPrice: [
        {
          min_order:'',
          price:''
        }
      ],
      productImage: [],
      sku: [],
    },
    config: {},
    initColor: '#F10',
    choosedSize: [],
    choosedColor: [],
    priceUnit: '',
    categoryList: [],
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

    * getCategoryTree ({  payload }, { call, put }) {
      const result = yield call(categoryTree, payload)
      const { code, message, data } = result
      if (code === 200) {
        yield put({
          type: 'updateState',
          payload: {
            categoryList: data,
          },
        })
      } else {
        throw message
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

