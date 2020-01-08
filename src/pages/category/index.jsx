import React from 'react'
import {
  Card,
} from 'antd';
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'dva'
import SortList from './component/SortList'
import styles from './List.less'

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))

class Category extends React.Component {

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'updateState',
      payload: {
        expandedRowKeys: [],
      },
    })
    dispatch({
      type: 'query',
      payload: {
        ...location.query,
      },
    })
  }


  render(){
    const { location, dispatch, category, loading } = this.props
    const { data, expandedRowKeys, status } = category
    const listLoading = loading

  const sortProps = {
    data: data,
    ids: expandedRowKeys,
    defaultStatus: status,
    addItem() {
      dispatch(routerRedux.replace({
        pathname: '/osAdmin/category/detail',
        state: {
          type: 'create',
        },
      }))
    },
    toEditPage(id) {
      dispatch(routerRedux.replace({
        pathname: '/admin/category/detail',
        query: {
          category: id,
          type: 'update',
        },
      }))
    },
    onDeleteItem(id) {
      dispatch({
        type: 'category/singleRemove',
        payload: {
          categories_id: id,
        },
      })
    },
    onSave(treeData) {
      let arrayData = [];
      let listData = saveTreeNode(treeData, arrayData)
      dispatch({
        type: 'category/saveCategory',
        payload: {
          category_array: listData,
        },
      })
    },
    onRemoveDefault () {
      dispatch({
        type: 'category/checkDefaultProduct',
      })
    }
  }

  //遍历全部数组以便提交表单数据
  const saveTreeNode = (list, arrayData) => {
    if(list.length) {
      list.forEach((item, index) => {
        let itemObj = {};
        const len = item.par_id.length
        if(len === 1) {
          itemObj.parent_ids = '0'
        } else if (len > 1) {
          itemObj.parent_id = item.par_id[len - 2]
        }
        itemObj.categories_id = item.categories_id;
        itemObj.sort = item.sort;
        arrayData.push(itemObj);
        if(item.children) {
          saveTreeNode(item.children, arrayData)
        }
      })
    }
    return arrayData
  }

  return (
    <GridContent>
      <Card bordered={false}>
        <div className="content-inner">
          {!listLoading && <SortList {...sortProps} key={Math.random()}/> }
        </div>
      </Card> 
    </GridContent>
    
  )
  }
}


export default Category
