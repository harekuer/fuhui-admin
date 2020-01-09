import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Form, Input, Button, InputNumber } from 'antd'
import styles from './index.less'

const FormItem = Form.Item
const { TextArea } = Input


const Detail = ({
  tool,
  loading,
  dispatch,
  location,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
}) => {
  const { data, formList, langIndex,  } = tool
  const { query } = location
  const formItemLayout = {
    labelCol: { span: 3 },
    wrapperCol: {
      xl: { span: 10 },
      lg: { span: 14 },
      md: { span: 16 },
    },
  }
  const buttonItemLayout = {
    wrapperCol: { span: 14, offset: 3 },
  }


  const saveEdit = () => {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
        id: query.func,
      }
      dispatch({
        type: 'funcDetail/change',
        payload: {
          ...data,
        },
      })
    })
  }

  const formItem = () => {
      const list = []
      formList.forEach((item) => {
        const obj ={
            label: item.title[langIndex],
            name: item.key,
            value: data[item.key],
            rules: [{ required: item.isRequired }],
            hasFeedback: false,
            node: (
              <Input maxLength={11} placeholder="eg:blog" />
            ),
        }
      })
  }
  const editForm = [
    {
      label: '功能名',
      name: 'func_name',
      value: data.func_name,
      rules: [{ required: true }],
      hasFeedback: true,
      node: (
        <Input maxLength={11} placeholder="eg:blog" />
      ),
    },
    {
      label: '功能标识',
      name: 'func_mark',
      value: data.func_mark,
      rules: [{ required: true }],
      hasFeedback: true,
      node: (
        <Input />
      ),
    },
    {
      label: '描述',
      name: 'func_desc',
      value: data.func_desc,
      rules: [],
      hasFeedback: true,
      node: (
        <TextArea rows={3} />
      ),
    },
    {
      label: '价格',
      name: 'func_price',
      value: data.func_price,
      rules: [],
      hasFeedback: true,
      node: (
        <InputNumber precision={2} style={{ width: '100%' }} max={100000000000.00} maxLength={11} placeholder="¥" />
      ),
    },
    {
      label: '默认URL',
      name: 'func_url',
      value: data.func_url,
      rules: [],
      hasFeedback: true,
      node: (
        <div>
          <Input placeholder="eg:/blog" />
          <span style={{ color: 'red' }}>提示：如果这个功能有独立页，请填写该页面的URL</span>
        </div>
      ),
    },
  ]

  return (
    <div className="content-inner">
      <div className={styles.detail}>
        <Form layout="horizontal">
          {
            editForm.map((item) => {
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
          <FormItem {...buttonItemLayout}>
            <Button type="primary" onClick={() => saveEdit()}>Save</Button>
          </FormItem>
        </Form>
      </div>
    </div>
  )
}

Detail.propTypes = {
  form: PropTypes.object,
  funcDetail: PropTypes.object,
}

export default connect(({ funcDetail, loading }) => ({ funcDetail, loading }))(Form.create()(Detail))
