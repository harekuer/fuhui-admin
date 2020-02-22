import React from 'react'
import PropTypes from 'prop-types'
import { FormConfig } from './autoConfig'
import { Form, Input,  Modal,Button } from 'antd'
import List from './List'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 18,
  },
}

const modal = ({
  currentItem,
  editConfig,
  onOk,
  onCancel,
  loading,
  dispatch,
  location,
  form: {
    getFieldDecorator,
    getFieldsValue,
    validateFields,
  },
  ...modalProps
}) => {
  const handleOk = (url) => {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const item = {
        ...getFieldsValue(),
        id: currentItem.suppliers_id,
      }
      onOk(item, url)
    })
  }

  const btns = (
    <div>
      <Button onClick={onCancel}>
      取消
      </Button>
      {
        editConfig.operate && editConfig.operate.map((item,index) => {
          return (
            <Button key={index} type="primary" loading={loading.models.tool} onClick={()=>handleOk(item.url)}>
            {item.text}
            </Button>
          )
        })
      }
    </div>
  )

  const listProps = {
    dataSource: currentItem,
    listData: currentItem,
    column: editConfig.table,
    pagination: false,
    scroll: { x: 580 },
    dispatch,
    location,
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

  return (
    <Modal 
    {...modalProps}
    onCancel={onCancel}
    footer={btns}
    >
      {
        editConfig.data ? 
        <Form layout="horizontal">
        {
          editConfig.data.map((item) => {
            return (
              <FormItem
                key={item.key}
                {...formItemLayout}
                label={item.label}
                hasFeedback={false}
              >
                {getFieldDecorator(item.key, {
                  initialValue: currentItem[item.key],
                  rules: item.rules,
                })(FormConfig(item,currentItem,0))}
              </FormItem>
            )
          })
        }
      </Form> : <List {...listProps} />
      }
      
    </Modal>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  type: PropTypes.string,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
