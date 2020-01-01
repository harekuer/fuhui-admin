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

const Category = ({ location, dispatch, category, loading }) => {
  const { data, expandedRowKeys, status } = category
  const listLoading = loading.effects['category/query'];

  const sortProps = {
    data: data,
    ids: expandedRowKeys,
    defaultStatus: status,
    addItem() {
      dispatch(routerRedux.push({
        pathname: '/admin/category/detail',
        query: {
          type: 'create',
        },
      }))
    },
    toEditPage(id) {
      dispatch(routerRedux.push({
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

Category.propTypes = {
  category: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default connect(({ category, loading }) => ({ category, loading }))(Category)
