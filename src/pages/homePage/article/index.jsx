import React from 'react'
import {
  Card,
  Tabs
} from 'antd';
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'dva'
import SortList from './component/SortList'
import styles from './List.less'

const { TabPane } = Tabs;

@connect(({ article, user,loading }) => ({
  article,
  user,
  loading: loading.models.article,
  queryLoading:loading.effects['articledetail/query']
}))

class ArticleList extends React.Component {

  componentDidMount() {
    const { dispatch,location } = this.props;
    dispatch({
      type: 'article/updateState',
      payload: {
        expandedRowKeys: [],
      },
    })
    dispatch({
      type: 'article/query',
      payload: {
        ...location.state,
        module: 'footer-article-list1',
      },
    })
  }

  onChangeTab = (key) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'article/query',
      payload: {
        module: key,
      }
    })
    dispatch({
      type: 'article/updateState',
      payload: {
        key,
      }
    })
  }


  render(){
    const { location, dispatch, article, user, queryLoading } = this.props
    const { data, expandedRowKeys, status,key } = article

    const sortProps = {
      data: data,
      ids: expandedRowKeys,
      defaultStatus: status,
      addItem() {
        const { tabMenuList } = user
        const path = location.pathname
        let obj ={}
        tabMenuList.forEach(item => {
          if(item.key === '/osAdmin/home/article/detail'){
            obj.activeTab = {
              ...item,
              state: {
                type: 'create',
                module: key,
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
          pathname: '/osAdmin/home/article/detail',
          state: {
            type: 'create',
            module: key,
          },
        }))
      },
      toEditPage(id) {
        const { tabMenuList } = user
        let obj ={}
        tabMenuList.forEach(item => {
          if(item.key === '/osAdmin/home/article/detail'){
            obj.activeTab = {
              ...item,
              state: {
                id: id,
                type: 'update',
                module: key,
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
          pathname: '/osAdmin/home/article/detail',
          state: {
            id: id,
            type: 'update',
            module: key,
          },
        }))
      },
      onDeleteItem(id) {
        dispatch({
          type: 'article/singleRemove',
          payload: {
            categories_id: id,
          },
        })
      },
      onSave(treeData) {
        let arrayData = [];
        let listData = saveTreeNode(treeData, arrayData)
        dispatch({
          type: 'article/saveArticle',
          payload: {
            sort_array: listData,
          },
        })
      },
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
        itemObj.id= item.id;
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
        <Tabs  onChange={this.onChangeTab} type="card">
            <TabPane tab="文章列1" key="footer-article-list1">
               {!queryLoading && <SortList {...sortProps} key={Math.random()}/> }
            </TabPane>
            <TabPane tab="文章列2" key="footer-article-list2">
               {!queryLoading && <SortList {...sortProps} key={Math.random()}/> }
            </TabPane>
            <TabPane tab="文章列3" key="footer-article-list3">
               {!queryLoading && <SortList {...sortProps} key={Math.random()}/> }
            </TabPane>
            <TabPane tab="文章列4" key="footer-article-list4">
               {!queryLoading && <SortList {...sortProps} key={Math.random()}/> }
            </TabPane>
          </Tabs>
          
        </div>
      </Card> 
    </GridContent>
    
  )
  }
}


export default ArticleList
