import React from 'react'
import {
  Card,
  Tabs,
  Radio,
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
        lang: 'en'
      },
    })
  }

  onChangeTab = (key) => {
    const { dispatch,article } = this.props;
    const { lang } = article;
    dispatch({
      type: 'article/query',
      payload: {
        module: key,
        lang,
      }
    })
    dispatch({
      type: 'article/updateState',
      payload: {
        key,
      }
    })
  }

  onChange = (e) =>{
    const { dispatch, article} = this.props;
    let { key } = article;
    const value = e.target.value
    dispatch({
      type: 'article/query',
      payload: {
        module: key,
        lang: value,
      }
    })
    dispatch({
      type: 'article/updateState',
      payload: {
        lang: value,
      }
    })
  }


  render(){
    const { location, dispatch, article, user, queryLoading } = this.props
    const { data, expandedRowKeys, status,key,lang } = article

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
          pathname: '/osAdmin/home/article/detail',
          state: {
            type: 'create',
            module: key,
            lang,
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
          pathname: '/osAdmin/home/article/detail',
          state: {
            id: id,
            type: 'update',
            module: key,
            lang,
          },
        }))
      },
      onDeleteItem(id) {
        dispatch({
          type: 'article/singleRemove',
          payload: {
            module: key,
            id: id,
            lang,
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
            module: key,
            lang,
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
        <Radio.Group onChange={this.onChange} defaultValue="en" style={{marginBottom: '15px'}}>
            <Radio.Button value="en">EN</Radio.Button>
            <Radio.Button value="es">ES</Radio.Button>
            <Radio.Button value="zh">ZH</Radio.Button>
          </Radio.Group>
        <Tabs  onChange={this.onChangeTab} type="card">
            <TabPane tab="关于我们" key="footer-article-list1">
               {!queryLoading && <SortList {...sortProps} key={Math.random()}/> }
            </TabPane>
            <TabPane tab="客户服务" key="footer-article-list2">
               {!queryLoading && <SortList {...sortProps} key={Math.random()}/> }
            </TabPane>
            <TabPane tab="支付&物流" key="footer-article-list3">
               {!queryLoading && <SortList {...sortProps} key={Math.random()}/> }
            </TabPane>
            <TabPane tab="合作计划" key="footer-article-list4">
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
