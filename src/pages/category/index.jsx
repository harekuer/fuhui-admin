import React from 'react'
import {
  Card,
  Radio,
} from 'antd';
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'dva'
import SortList from './component/SortList'
import styles from './List.less'

@connect(({ category, user,loading }) => ({
  category,
  user,
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
        lang: 'en'
      },
    })
  }


  render(){
    const { location, dispatch, category, user, loading } = this.props
    const { data, expandedRowKeys, status,lang } = category
    const listLoading = loading
  const sortProps = {
    data: data,
    ids: expandedRowKeys,
    defaultStatus: status,
    addItem() {
      const { tabMenuList } = user
      const path = location.pathname
      let obj ={}
      tabMenuList.forEach(item => {
        if(item.key === '/osAdmin/category/detail'){
          obj.activeTab = {
            ...item,
            state: {
              type: 'create',
              lang,
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
        pathname: '/osAdmin/category/detail',
        state: {
          type: 'create',
          lang,
        },
      }))
    },
    toEditPage(id) {
      const { tabMenuList } = user
      let obj ={}
      tabMenuList.forEach(item => {
        if(item.key === '/osAdmin/category/detail'){
          obj.activeTab = {
            ...item,
            state: {
              category: id,
              type: 'update',
              lang,
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
        pathname: '/osAdmin/category/detail',
        state: {
          category: id,
          type: 'update',
          lang,
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

  const onChange = (e) =>{
    const { dispatch, category} = this.props;
    let { key } = category;
    const value = e.target.value
    dispatch({
      type: 'category/query',
      payload: {
        lang: value,
      }
    })
    dispatch({
      type: 'category/updateState',
      payload: {
        lang: value,
      }
    })
  }

  return (
    <GridContent>
      <Card bordered={false}>
        <div style={{borderBottom:'1px solid #ddd'}}>
          <Radio.Group onChange={onChange} defaultValue="en" style={{marginBottom: '15px'}}>
            <Radio.Button value="en">EN</Radio.Button>
            <Radio.Button value="es">ES</Radio.Button>
            <Radio.Button value="zh">ZH</Radio.Button>
          </Radio.Group>
          </div>
        <div className="content-inner">
          
          {!listLoading && <SortList {...sortProps} key={Math.random()}/> }
        </div>
      </Card> 
    </GridContent>
    
  )
  }
}


export default Category
