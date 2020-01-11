import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'dva'
import List from './List'
import Filter from './Filter'
import reqwest from 'reqwest'
import { Error, Success } from '@/utils/warn'

class Tool extends Component {

  constructor() {
    super()

    this.state = {}
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tool/query',
      payload: {
        data: {},
        url: '/_os/index.php?com=index&t=tableConfig'
      }
    });
  }
  render(){
    const { location, dispatch, tool, loading } = this.props;
    const { list, column, pagination, search, dateRange, filterForm, langIndex, isPaging } = tool

  const listProps = {
    dataSource: list,
    listData: list,
    column,
    loading: loading.effects['tool/query'],
    pagination: isPaging === false ? false : pagination,
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

  return (
    <div className="content-inner">
      {search && <Filter {...filterProps} />}
      {column.length && <List {...listProps} />}
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

export default connect(({ tool, loading }) => ({ tool, loading }))(Tool)
