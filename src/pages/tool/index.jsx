import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'dva'
import List from './List'
import Filter from './Filter'
import Modal from './Modal'
import reqwest from 'reqwest'
import { routerRedux } from 'dva/router'
import { Error, Success } from '@/utils/warn'

class Tool extends Component {

  constructor() {
    super()

    this.state = {}
  }

  componentDidMount() {
    const { dispatch, user } = this.props;
    let url = '/_os/index.php?com=index&t=tableConfig'
    if(user.activeTab.url != ''){
      url = user.activeTab.url
    }

    dispatch({
      type: 'tool/query',
      payload: {
        data: {},
        url: url,
      }
    });
  }
  render(){
    const { location, dispatch, tool,user, loading } = this.props;
    const { list, column, pagination, search, dateRange, filterForm, langIndex, isPaging,modalVisible,currentItem, editConfig } = tool

  const listProps = {
    dataSource: list,
    listData: list,
    column,
    loading: loading.effects['tool/query'],
    pagination: isPaging === false ? false : pagination,
    dispatch,
    location,
    onChange (page) {
      const { query, pathname } = location
      
      dispatch({
        type: 'tool/updateState',
        payload: {
          filterForm: {
            page: page.current,
            limit: page.pageSize,
          },
        },
      })
      dispatch({
        type: 'tool/query',
        payload: {
          data: {
            page: page.current,
            limit: page.pageSize,
          },
          url: search.url,
        },
      })
    },
    onOperateItem(record, item, key) {
      let url = ''
      if (item.query) { // 将返回的query数组拼接成字符串
        item.query.forEach((option,index) => {
          url += `&${option}=${record[option]}`
        })
      }
      reqwest({
        url: `${item.url}${url}`,
        method: 'post',
      })
        .then(function (resp) {
          if (resp.code === 200) {
            Success('刷新成功')
          } else {
            Error(resp.message)
          }
        })
        .fail(function (resp) {
          Error(resp.message)
        })
    }
  }

  const filterProps = {
    langIndex,
    filter: {
      ...location.query,
      ...filterForm,
    },
    search,
    dateRange,
    onFilterChange (value) {
      dispatch({
        type: 'tool/updateState',
        payload: {
          filterForm: {
            ...value,
          },
        },
      })
      dispatch({
        type: 'tool/searchList',
        payload: {
          data: {
            ...value,
          },
          url: search.url,
        },
      })
    },
    onEdit(item) {
      const { tabMenuList } = user
      const path = location.pathname
      const newKey = `${path}/detail`
      let obj ={}
      if(item.type === 'add'){ //新增按钮处理
        tabMenuList.forEach(item => {
          if(item.key === newKey){
            obj.activeTab = {
              ...item,
              state: {
                type: 'create'
              }
            }
            obj.changeActiveTab = true
          }
        })
        dispatch({
          type: 'user/updateState',
          payload: {
            ...obj,
          },
        })
        dispatch(routerRedux.replace({
          pathname: newKey,
          state: {
            type: 'create',
          },
        }))
      } else if(item.type === 'edit'){ //新增按钮处理
        tabMenuList.forEach(item => {
          if(item.key === newKey){
            obj.activeTab = {
              ...item,
              state: {
                type: 'create'
              }
            }
            obj.changeActiveTab = true
          }
        })
        dispatch({
          type: 'user/updateState',
          payload: {
            ...obj,
          },
        })
        dispatch(routerRedux.replace({
          pathname: newKey,
          state: {
            type: 'create',
          },
        }))
      } else {
        reqwest({
          url: item.url,
          method: 'post',
        })
          .then(function (resp) {
            if (resp.code === 200) {
              Success('刷新成功')
            } else {
              Error(resp.message)
            }
          })
          .fail(function (resp) {
            Error(resp.message)
          })
      }
    }
  }

  const modalProps = {
    currentItem,
    editConfig,
    visible: modalVisible,
    maskClosable: false,
    loading,
    dispatch,
    location,
    width: 620,
    title: '编辑/查看',
    wrapClassName: 'vertical-center-modal',
    onOk (item, url) {
      dispatch({
        type: 'tool/saveEdit',
        payload: {
          data: item,
          url,
        }
      })
    },
    onCancel () {
      // 关闭modal显示
      dispatch({
        type: 'tool/updateState',
        payload: {
          modalVisible: false,
        }
      })
    },
  }

  return (
    <div className="content-inner">
      {search && <Filter {...filterProps} />}
      {column.length && <List {...listProps} />}
      {modalVisible && <Modal {...modalProps}/>}
    </div>
  )
  }
}


Tool.propTypes = {
  tool: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default connect(({ tool,user, loading }) => ({ tool, user, loading }))(Tool)
