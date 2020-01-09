
import { query } from './service'

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
      }
      const result = yield call(query, queryObj, payload.url)
      const { code, count, config, message } = result

      let data = {
        "search":{
            "filter":[
                {
                    "key":"customers_id",
                    "placeholder":[
                        "客户ID",
                        "userID"
                    ],
                    "type":"Input"
                },
                {
                    "key":"customers_email",
                    "placeholder":[
                        "客户邮箱",
                        "Customer Email"
                    ],
                    "type":"Input"
                },
                {
                    "key":"coupon_code",
                    "placeholder":[
                        "券号码",
                        "Code"
                    ],
                    "type":"Input"
                },
                {
                    "key":"order_id",
                    "placeholder":[
                        "订单ID",
                        "Order ID"
                    ],
                    "type":"Input"
                },
                {
                    "key":[
                        "change_date",
                        "change_date_e"
                    ],
                    "placeholder":[
                        [
                            "领取时间 年/月/日",
                            "年/月/日"
                        ],
                        [
                            "Change date Year/Month/Day",
                            "Year/Month/Day"
                        ]
                    ],
                    "type":"DataRange"
                },
                {
                    "key":[
                        "redeem_date",
                        "redeem_date_e"
                    ],
                    "placeholder":[
                        [
                            "兑换时间 年/月/日",
                            "年/月/日"
                        ],
                        [
                            "Change date Year/Month/Day",
                            "Year/Month/Day"
                        ]
                    ],
                    "type":"DataRange"
                },
                {
                    "key":[
                        "expired_date",
                        "expired_date_e"
                    ],
                    "placeholder":[
                        [
                            "过期时间 年/月/日",
                            "年/月/日"
                        ],
                        [
                            "Expired Date Year/Month/Day",
                            "Year/Month/Day"
                        ]
                    ],
                    "type":"DataRange"
                },
                {
                    "key":"customer_coupon_status",
                    "placeholder":[
                        "券状态",
                        "coupon status"
                    ],
                    "type":"Select",
                    "options":[
                        {
                            "label":"All",
                            "value":"0"
                        },
                        {
                            "label":"Active",
                            "value":"1"
                        },
                        {
                            "label":"Inactive",
                            "value":"2"
                        }
                    ]
                },
                {
                    "key":"is_used",
                    "placeholder":[
                        "是否使用",
                        "Is Used"
                    ],
                    "type":"Select",
                    "options":[
                        {
                            "label":"All",
                            "value":"0"
                        },
                        {
                            "label":"未使用",
                            "value":"1"
                        },
                        {
                            "label":"已使用",
                            "value":"2"
                        }
                    ]
                },
                {
                    "key":"source_type",
                    "placeholder":[
                        "来源",
                        "Source"
                    ],
                    "type":"Select",
                    "options":[
                        {
                            "label":"All",
                            "value":"0"
                        },
                        {
                            "label":"优惠券中心领取",
                            "value":"1"
                        },
                        {
                            "label":"订阅发放",
                            "value":"2"
                        },
                        {
                            "label":"注册产品发放",
                            "value":"3"
                        },
                        {
                            "label":"内部券发放",
                            "value":"4"
                        },
                        {
                            "label":"详情页领取",
                            "value":"5"
                        }
                    ]
                }
            ],
            "url":"/bg_os/index.php?com=coupons_redeem"
        },
        "table":[
            {
                "title":[
                    "客户ID",
                    "Customers Id"
                ],
                "key":"customers_id"
            },
            {
                "title":[
                    "客户邮箱",
                    "Customers Email"
                ],
                "key":"customers_email"
            },
            {
                "title":[
                    "优惠劵码",
                    "Used Coupon"
                ],
                "key":"change_coupon_code",
                "render":"url_blank",
                "url":"/sg_os/couponManage/detail",
                "query":[
                    "coupon_id"
                ]
            },
            {
                "title":[
                    "领取时间(美国时间)",
                    "Exchange Time(America Time)"
                ],
                "key":"change_date"
            },
            {
                "title":[
                    "兑换时间(美国时间)",
                    "Redeem Time(America Time)"
                ],
                "key":"redeem_date"
            },
            {
                "title":[
                    "过期时间(美国时间)",
                    "End Time(America Time)"
                ],
                "key":"expired_date"
            },
            {
                "title":[
                    "是否使用",
                    "Is Used"
                ],
                "key":"is_used",
                "render":"html"
            },
            {
                "title":[
                    "使用订单",
                    "Orders Id"
                ],
                "key":"orders_id",
                "render":"html"
            },
            {
                "title":[
                    "来源",
                    "Source"
                ],
                "key":"source_type"
            }
        ]
    }

      if (code === 200) {
        // yield put({
        //   type: 'querySuccess',
        //   payload: {
        //     list: data,
        //     pagination: {
        //       current: Number(payload.page) || 1,
        //       pageSize: Number(payload.limit) || 10,
        //       total: Number(count),
        //     },
        //   },
        // })
        const FilterList = data.search.filter
        const dateRange = []
        FilterList.forEach((item) => {
          if (Array.isArray(item.key) && item.type === 'DataRange') {
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
          },
        })
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
