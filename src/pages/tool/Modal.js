import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input,  Modal, Tooltip, Icon, Switch,Radio,Checkbox ,Button} from 'antd'

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
  currentItem = {},
  editConfig,
  onOk,
  onCancel,
  form: {
    getFieldDecorator,
    validateFields,
    setFieldsValue,
  },
  ...modalProps
}) => {
  const btns = () => {
    let arr = []
    editConfig.operate && editConfig.operate.map((item,index) => {
      let obj = (
        <Button key={index} type="primary"  onClick={()=>onOk(item.url)}>
        {item.text}
      </Button>
      )
      arr.push(obj)
    })
    return arr
  }


  return (
    <Modal 
    {...modalProps}
    onCancel={onCancel}
    footer={[
      <Button key="cancel" onClick={onCancel}>
        取消
      </Button>,
      <Button key="submit" type="primary" onClick={onOk}>
        确定
      </Button>,
    ]}
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
                  initialValue: item.value,
                  rules: item.rules,
                })(
                  <div>
                    {
                      item.type && item.type !== '' ?
                      <Radio.Group>
                        {
                          item.options.map(option => {
                            return <Radio value={option.value} key={option.value}> {option.label} </Radio>
                          })
                        }
                      </Radio.Group>
                      :<span>{currentItem[item.key]}</span>
                    }
                  </div>
                )}

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
