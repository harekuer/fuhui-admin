import React from 'react'
import PropTypes from 'prop-types'
import { FormConfig } from './autoConfig'
import { Form, Input,  Modal,Button,Radio} from 'antd'

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
  form: {
    getFieldDecorator,
    getFieldsValue,
    validateFields,
  },
  ...modalProps
}) => {
console.log(currentItem)
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

  return (
    <Modal 
    {...modalProps}
    onCancel={onCancel}
    footer={btns}
    >
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

      </Form>
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
