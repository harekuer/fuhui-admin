import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { UEditor } from 'components'
import { Form, Input, InputNumber, Button, TreeSelect } from 'antd'
import Intl from 'react-intl-universal'
import { timeFormat, getNowFormatDate } from 'utils'
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
  const { query } = location;
  const dataLoading = query.type === 'update'? loading.effects['categoryDetail/query'] : loading.effects['categoryDetail/getCategoryTree'];
  const nowTime = getNowFormatDate();
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
      const data = {
        ...getFieldsValue(),
        categories_description: UE.getEditor('description').getContent(),
      }
      if(query.type === UPDATE) {
        dispatch({
          type: 'categoryDetail/change',
          payload: {
            ...data,
            categories_id: query.category,
          },
        })
      } else {
        dispatch({
          type: 'categoryDetail/add',
          payload: {
            ...data,
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
      obj.label = item.categories_name;
      if(Number(item.child_num) > 0) {
        obj.children = categoryTreeList(item.children)
      }
      list.push(obj)
    })
    return list
  }

  const treeData = query.type === UPDATE? categoryTreeList(data.categoriesArr) : categoryTreeList(categoryList);

  const categoryForm = [
    {
      label: Intl.get('cg-edit-parent'),
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
      label: Intl.get('cg-edit-cname'),
      name: 'categories_name',
      value: data.categories_name,
      rules: [{ required: true, message: Intl.get('cg-edit-cname-error'), max: 255,}],
      hasFeedback: true,
      node: (
        <Input maxLength="255"/>
      )
    },
    {
      label: Intl.get('cg-edit-desc'),
      name: 'categories_description',
      value: data.categories_description,
      rules: [],
      hasFeedback: false,
      node: (
        <div>
          {
            dataLoading ? "" :
            <UEditor
               name="description"
               content={data.categories_description}
               height="350"
             />
          }
        </div>
      )
    },
    {
      label: Intl.get('cg-edit-meta-title'),
      name: 'meta_title',
      value: data.meta_title,
      rules: [{max: 255}],
      hasFeedback: true,
      node: (
        <Input />
      )
    },
    {
      label: Intl.get('cg-edit-meta-kw'),
      name: 'meta_keyword',
      value: data.meta_keyword,
      rules: [{max: 255}],
      hasFeedback: true,
      node: (
        <Input />
      )
    },
    {
      label: Intl.get('cg-edit-meta-desc'),
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
          <FormItem label={Intl.get('cg-edit-date')} {...formItemLayout}>
            {
              query.type === 'create' ?
              <span>{nowTime}</span> : <span>{timeFormat(Number(data.add_time))}</span>
            }
          </FormItem>
          <FormItem {...buttonItemLayout}>
            <Button type="primary" onClick={() => saveEdit()}>{Intl.get('btn.save')}</Button>
            <Button style={{ marginLeft: '15px' }} onClick={() => goBack()}>{Intl.get('btn.back')}</Button>
          </FormItem>
        </Form>
      </div>
    </div>
  )
}

Detail.propTypes = {
  form: PropTypes.object,
  categoryDetail: PropTypes.object,
}

export default connect(({ categoryDetail, loading }) => ({ categoryDetail, loading }))(Form.create()(Detail))
