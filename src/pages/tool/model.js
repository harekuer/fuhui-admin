
import { query, getList  } from './service'

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
      const { code, count, data, message } = result

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
      } else {
        throw message
      }
    },

    * getList({ payload = {} }, { select, call, put }) {
        const { filterForm } = yield select(_ => _.tool)
        const result = yield call(getList, { ...filterForm, ...payload.data }, payload.url);
        const { code, data, count, message, page, limit } = result

        if (code === 200) {
            let list = data.rows
            yield put({
                type: 'querySuccess',
                payload: {
                    list,
                    pagination: {
                        current: Number(page) || 1,
                        pageSize: Number(limit) || 10,
                        total: Number(count),
                    },
                },
            })
        } else {
            Error(message)
        }
    },

    * searchList({ payload = {} }, { select, call, put }) {
        const { filterForm } = yield select(_ => _.tool)
        const result = yield call(getList, { ...payload.data, ...filterForm }, payload.url)
        const { code, data, count, message, page, limit } = result

        if (code === 200) {
            let list = data.rows
            yield put({
                type: 'querySuccess',
                payload: {
                    list,
                    pagination: {
                        current: Number(page) || 1,
                        pageSize: Number(limit) || 10,
                        total: Number(count),
                    },
                },
            })
        } else {
            Error(message)
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
