import React from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Row, Col, Input, Select, DatePicker, Tooltip, Icon } from 'antd'
import { searchConfig } from './autoConfig'

const Option = Select.Option
const RangePicker = DatePicker.RangePicker
const InputGroup = Input.Group;

const ColProps = {
  xs: 24,
  sm: 12,
  style: {
    marginBottom: 16,
  },
}


const TwoColProps = {
  ...ColProps,
  xl: 96,
}

const Filter = ({
  search,
  dateRange,
  langIndex,
  onEdit,
  onFilterChange,
  filter,
  form: {
    getFieldDecorator,
    getFieldsValue,
    setFieldsValue,
    validateFields,
  },
}) => {
  const handleSubmit = () => {
    let fields = getFieldsValue()
    let searchData = {} // 搜索数据集
    if (dateRange && dateRange.length) {
      validateFields((errors, fieldsValue) => {
        let date = {}
        dateRange.forEach((item) => { // dateRange数据格式为[['aaa','bbb'],['ccc','ddd']]
          const name = item[0] // form name 设置为dateRange数组的第一个值 'aaa','bbb'
          const rangeTime = fieldsValue[name] // 获取时间区间控件的值 fieldsValue['aaa']
          item.forEach((option, index) => {
            date[option] = rangeTime && rangeTime.length ? rangeTime[index].format('YYYY-MM-DD') : undefined
          })
        })
        searchData = {
          ...fields,
          ...date,
        }
      })
      onFilterChange(searchData)
    } else {
      onFilterChange(fields)
    }
  }

  const handleReset = () => {
    const fields = getFieldsValue()
    for (let item in fields) {
      if ({}.hasOwnProperty.call(fields, item)) {
        if (fields[item] instanceof Array) {
          fields[item] = []
        } else {
          fields[item] = undefined
        }
      }
    }
    setFieldsValue(fields)
    handleSubmit()
  }

  const handleChange = (key, values) => {
    let fields = getFieldsValue()
    fields[key] = values
    onFilterChange(fields)
  }
  const {} = filter


  return (
    <Row gutter={24}>
      {
        search.filter && search.filter.map((item, index) => {
          if (Array.isArray(item.key)) {
            if(item.type === 'NumRange') { //当类型为次数范围
              return (
                <Col {...ColProps} xl={{ span: 6 }} md={{ span: 8 }} key={index}>
                  <InputGroup compact>
                    {getFieldDecorator(item.key[0], { initialValue: undefined })(<Input style={{ width: '46%', textAlign: 'center' }} size="large" placeholder={item.placeholder[langIndex][0]} />)}
                    <Input style={{ width: '8%', borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} size="large" placeholder="~" disabled />
                    {getFieldDecorator(item.key[1], { initialValue: undefined })(<Input style={{ width: '46%', textAlign: 'center', borderLeft: 0 }} size="large" placeholder={item.placeholder[langIndex][1]} />)} 
                  </InputGroup>
                </Col>
              )
            } else {//当类型为时间范围
              return (
                <Col {...ColProps} xl={{ span: 6 }} md={{ span: 8 }} key={index}>
                  {getFieldDecorator(item.key[0], { initialValue: undefined })(<RangePicker size="large" placeholder={item.placeholder[langIndex]} style={{ width: '100%' }} />)}
                </Col>
              )
            }
          }
          return (
            <Col {...ColProps} xl={{ span: 4 }} md={{ span: 6 }} key={index}>
              {getFieldDecorator(item.key, { initialValue: item.type.value ? item.type.value : undefined })(
                searchConfig(item, langIndex)
              )}
            </Col>
          )
        })
      }
      {
        search.action ?
          <Col {...TwoColProps} xl={{ span: 24 }} md={{ span: 24 }} sm={{ span: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <Button type="primary" className="margin-right" size="large" onClick={handleSubmit}>搜索</Button>
                <Button size="large" onClick={handleReset}>重置</Button>
              </div>
              <div>
                {
                  search.action.map((item, index) => {
                    return <Button size="large" type="primary" onClick={() => onEdit(item)} key={index}>{Array.isArray(item.text) ? item.text[langIndex] : item.text}</Button>
                  })
                }
                
              </div>
            </div>
          </Col> :
          <Col {...TwoColProps} xl={{ span: 4 }} md={{ span: 8 }} sm={{ span: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <Button type="primary" className="margin-right" size="large" onClick={handleSubmit}>搜索</Button>
                <Button size="large" onClick={handleReset}>重置</Button>
              </div>
              <div />
            </div>
          </Col>
      }
    </Row>
  )
}

Filter.propTypes = {
  onAdd: PropTypes.func,
  form: PropTypes.object,
  filter: PropTypes.object,
  onFilterChange: PropTypes.func,
}

export default Form.create()(Filter)
