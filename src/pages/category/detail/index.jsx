import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Form, Input, Button, TreeSelect, Card } from 'antd'
import moment from 'moment'

import styles from './index.less'

const FormItem = Form.Item;
const { TextArea } = Input;
const UPDATE = 'update';


const Detail = ({
  categoryDetail,
  loading,
  dispatch,
  location,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
}) => {
  const { data, categoryList } = categoryDetail;
  const { state } = location;
  const dataLoading = state.type && state.type === 'update'? loading.effects['categoryDetail/query'] : loading.effects['categoryDetail/getCategoryTree'];
  const formItemLayout =  {
    labelCol: { span: 3 },
    wrapperCol: {
      xl:{span: 12},
      lg:{span: 16},
      md:{span: 18}
     },
  };
  const buttonItemLayout = {
    wrapperCol: { span: 14, offset: 3 },
  };

  const saveEdit = () => {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const formData = {
        ...getFieldsValue(),
      }
      if(state.type && state.type === UPDATE) {
        dispatch({
          type: 'categoryDetail/change',
          payload: {
            ...formData,
            categories_id: data.categories_id,
            lang: state.lang,
          },
        })
      } else {
        dispatch({
          type: 'categoryDetail/add',
          payload: {
            ...formData,
            lang: state.lang,
          },
        })
      }
    })
  }

  const goBack = () => {
    dispatch(routerRedux.push({
      pathname: '/admin/category',
    }))
  }

  //递归拷贝类目数据
  const categoryTreeList = (nodeList) => {
    let list = [];
    nodeList.forEach(item => {
      let obj = {};
      obj.key = item.categories_id;
      obj.value = item.categories_id;
      obj.title = item.categories_name;
      if(item.children) {
        obj.children = categoryTreeList(item.children)
      }
      list.push(obj)
    })
    return list
  }

  const treeData = categoryTreeList(categoryList);

  const categoryForm = [
    {
      label: '父类目',
      name: 'parent_id',
      value: data.parent_id === '0'? '' : data.parent_id,
      rules: [],
      hasFeedback: true,
      node: (
        <TreeSelect
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          getPopupContainer={triggerNode => triggerNode.parentNode}
          treeData={treeData}
          placeholder="Please select"
          treeDefaultExpandAll
          allowClear
        />
      )
    },
    {
      label: '分类名称',
      name: 'categories_name',
      value: data.categories_name,
      rules: [{ required: true, message: '请输入分类名称', max: 255,}],
      hasFeedback: true,
      node: (
        <Input maxLength={255}/>
      )
    },
    {
      label: 'Meta title',
      name: 'meta_title',
      value: data.meta_title,
      rules: [{max: 255}],
      hasFeedback: true,
      node: (
        <Input />
      )
    },
    {
      label: 'Meta keywords',
      name: 'meta_keyword',
      value: data.meta_keyword,
      rules: [{max: 255}],
      hasFeedback: true,
      node: (
        <Input />
      )
    },
    {
      label: 'Meta description',
      name: 'meta_description',
      value: data.meta_description,
      rules: [{max: 500}],
      hasFeedback: true,
      node: (
        <TextArea rows={3} />
      )
    },
  ]

  return (
    <Card bordered={false}>
      <div className="content-inner">
        <div className={styles.detail}>
          <Form layout="horizontal">
            {
              categoryForm.map(item => {
                return (
                  <FormItem
                    key={item.name}
                    {...formItemLayout}
                    label={item.label}
                    hasFeedback={item.hasFeedback}
                  >
                    {getFieldDecorator(item.name, {
                      initialValue: item.value,
                      rules: item.rules,
                    })(item.node)}
                  </FormItem>
                )
              })
            }
            {/* <FormItem label='Date' {...formItemLayout}>
              {
                state.type === 'create' ?
                <span>{nowTime}</span> : <span>{moment(data.add_time).format('YYYY-MM-DD')}</span>
              }
            </FormItem> */}
            <FormItem {...buttonItemLayout}>
              <Button type="primary" onClick={() => saveEdit()}>保存</Button>
              <Button style={{ marginLeft: '15px' }} onClick={() => goBack()}>返回</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    </Card>
    
  )
}

Detail.propTypes = {
  form: PropTypes.object,
  categoryDetail: PropTypes.object,
}

export default connect(({ categoryDetail, loading }) => ({ categoryDetail, loading }))(Form.create()(Detail))
