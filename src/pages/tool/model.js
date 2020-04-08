
import { query, getList,getConfig,accountEdit,accountDelete  } from './service'
import { routerRedux } from 'dva/router';
import { message} from 'antd';

const langIndex = 0 

export default {
  namespace: 'tool',

  state: {
    langIndex,
    column: [],
    dateRange: [],
    search: {},
    filter: {},
    filterForm: {},
    currentItem: {},
    editConfig: {
      data: [],
      table: [],
    },
    modalVisible: false,
    isPaging: false,
    url:'/_os/index.php?com=index&t=tableConfig',
    list: [],
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: total => `Total ${total} items`,
      current: 1,
      total: 0,
    },
  },


  effects: {

    * query ({ payload = {} }, { select, call, put }) {
      const { search,column, filterForm } = yield select(_ => _.tool)
      let queryObj = queryObj = {
        ...filterForm,
        ...payload.data,
        cfg: 'supplier_datalist'
      }
      const result = yield call(query, queryObj, payload.url)
      const { code, count, data, } = result

      if (code === 200) {
        const FilterList = data.search.filter
        const dateRange = []
        FilterList.forEach((item) => {
          if (item.type === 'DateRange') {
            dateRange.push(item.key)
          }
        })
        yield put({
          type: 'updateState',
          payload: {
            search: data.search,
            column: data.table,
            dateRange,
            isPaging: data.pagination,
            url: data.search.url,
          },
        })
        yield put({
            type: 'getList',
            payload: {
              data:{},
              url: data.search.url,
            },
          })
      } else if(code === 401){
        yield put(
            routerRedux.replace({
              pathname: '/user/login',
            }),
        );
      } else {
        message.error(result.message)
      }
    },

    * getList({ payload = {} }, { select, call, put }) {
        const { filterForm } = yield select(_ => _.tool)
        const result = yield call(getList, { ...filterForm, ...payload.data }, payload.url);
        const { code, data, message} = result

        if (code === 200) {
            let list = data.rows
            const { page,pageSize,total } = data
            yield put({
                type: 'querySuccess',
                payload: {
                    list,
                    pagination: {
                        current: Number(page) || 1,
                        pageSize: Number(pageSize) || 10,
                        total: Number(total),
                    },
                },
            })
          } 
          // else if(code === 401){
          //   yield put(
          //       routerRedux.replace({
          //         pathname: '/user/login',
          //       }),
          //   );
          // } else {
          //     throw message
          // }
    },

    * searchList({ payload = {} }, { select, call, put }) {
        const { filterForm } = yield select(_ => _.tool)
        const result = yield call(getList, { ...payload.data, ...filterForm }, payload.url)
        const { code, data, count, message, page, limit } = result

        if (code === 200) {
            let list = data.rows
            const { page,pageSize,total } = data
            yield put({
                type: 'querySuccess',
                payload: {
                    list,
                    pagination: {
                      current: Number(page) || 1,
                      pageSize: Number(pageSize) || 20,
                      total: Number(total),
                    },
                },
            })
        } else {
            Error(message)
        }
    },

    * editConfig({ payload = {} }, { select, call, put }) {
      const result = yield call(getConfig, payload.data, payload.url)
      const { code, data,  } = result
      if (code === 200) {
          yield put({
            type: 'updateState',
            payload: {
              editConfig: {
                data: data.data,
                table: data.table,
                operate: data.operate,
              }
            },
          })
        } else if(code === 401){
          yield put(
              routerRedux.replace({
                pathname: '/user/login',
              }),
          );
        } else {
          message.error(result.message)
        }
    },

    * getDetail({ payload = {} }, { select, call, put }) {
      const result = yield call(getList, payload.data, payload.url)
      const { code, data, message, } = result

      if (code === 200) {
          yield put({
            type: 'updateState',
            payload: {
              currentItem: data
            },
          })
      } else {
          Error(message)
      }
    },

    * saveEdit({ payload = {} }, { select, call, put }) {
      const { url } = yield select(_ => _.tool)
      const result = yield call(getList, payload.data, payload.url)
      const { code, data, } = result

      if (code === 200) {
          yield put({
            type: 'updateState',
            payload: {
              modalVisible: false,
            },
          })
          yield put({
            type: 'getList',
            payload: {
              data:{},
              url: url,
            },
          })
        } else if(code === 401){
          yield put(
              routerRedux.replace({
                pathname: '/user/login',
              }),
          );
        } else {
          message.error(result.message)
        }
    },

    * saveAccount({ payload = {} }, { call, put }) {
      const { resolve, saveData } = payload
      const result = yield call(accountEdit,saveData )
      const { code, } = result
      !!resolve && resolve(code)
      if (code === 200) {
        message.success(result.message)
        } else if(code === 401){
          yield put(
              routerRedux.replace({
                pathname: '/user/login',
              }),
          );
        } else {
          message.error(result.message)
        }
    },

    * deleteAccount({ payload = {} }, { call, put }) {
      const { resolve, saveData } = payload
      const result = yield call(accountDelete, saveData)
      const { code, data, } = result
      !!resolve && resolve(code)
      if (code === 200) {
        message.success(result.message)
        } else if(code === 401){
          yield put(
              routerRedux.replace({
                pathname: '/user/login',
              }),
          );
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
    querySuccess (state, { payload }) {
      const { list, pagination } = payload
      return {
        ...state,
        list,
        pagination: {
          ...state.pagination,
          ...pagination,
        },
      }
    },
  },
}
