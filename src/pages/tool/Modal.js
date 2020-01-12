import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input,  Modal, Tooltip, Icon, Switch } from 'antd'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
}

const modal = ({
  currentItem = {},
  editConfig,
  form: {
    getFieldDecorator,
    validateFields,
    setFieldsValue,
  },
  ...modalProps
}) => {
console.log(editConfig)
  return (
    <Modal {...modalProps}>
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
                  initialValue: item.value,
                  rules: item.rules,
                })(<span>{currentItem[item.key]}</span>)}

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
