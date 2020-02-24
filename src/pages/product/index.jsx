import {
    Button,
    Card,
    DatePicker,
    Form,
    Icon,
    Input,
    InputNumber,
    Radio,
    Select,
    Checkbox,
    Tooltip,
  } from 'antd';
  import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
  import React, { Component } from 'react';
  import UEditor from '@/components/Ueditor'
  import SortableList from '@/components/SortableList'
  import MultiUpload from '@/components/MultiUpload'
  import { connect } from 'dva';
  import styles from './style.less';
  import { array } from 'prop-types';
  
  const FormItem = Form.Item;
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const { TextArea } = Input;
  
  class BasicForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
          data: props.list,
          editingKey: '',
        };
      }
    handleSubmit = e => {
      const { dispatch, form } = this.props;
      e.preventDefault();
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          dispatch({
            type: 'formAndbasicForm/submitRegularForm',
            payload: values,
          });
        }
      });
    };

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
          type: 'productDetail/getConfig',
        });
    }
  
    render() {
      const { submitting,productDetail, dispatch } = this.props;
      const { data, config } = productDetail
      const { 
        form: { getFieldDecorator, getFieldValue },
      } = this.props;
      const formItemLayout = {
        labelCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 4,
          },
        },
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 12,
          },
          md: {
            span: 18,
          },
        },
      };
      const submitFormLayout = {
        wrapperCol: {
          xs: {
            span: 24,
            offset: 0,
          },
          sm: {
            span: 10,
            offset: 7,
          },
        },
      };

      const sortProps = {
        data: data.productImage,
        onSaveState (obj) {
          console.log(obj)
        },
      }
    
      const multiProps = {
        id: 'flashContainer',
        products_id: '',
        onUploadItem: (addItem) => {
          onAddItem(addItem)
        },
      }


      const changeProperty = (key,index,value) => {
        let newData = data
        if(key === 'delete'){
          newData.customMoreProperty = newData.customMoreProperty.filter((item,_index) => _index !== index)
        } else if (key === 'add'){
          newData.customMoreProperty.push({text: '',value: ''})
        }else {
          newData.customMoreProperty[index][key] = value
        }
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            data: newData,
          }
        });
      }

      const formatLabel = (list) => {
        list.map(item => {
          item.label = item.text
          return item
        })
        return list
      }

      const changeKeyword = (key,index,value) => {
        let newData = data
        if(key === 'delete'){
          newData.productKeywords = newData.productKeywords.filter((item,_index) => _index !== index)
        } else if (key === 'add'){
          newData.productKeywords.push('')
        }else {
          newData.productKeywords[index] = value
        }
        dispatch({
          type: 'productDetail/updateState',
          payload: {
            data: newData,
          }
        });
      }

      return (
        <Card bordered={false}>
            <Form
              onSubmit={this.handleSubmit}
              style={{
                marginTop: 8,
              }}
            >
              <Card size="small" title="基础信息" >
                <FormItem
                  {...formItemLayout}
                  label={
                      <span>
                        {config.productTitle ? config.productTitle.props.label: ''}
                        <em className={styles.optional}>
                          <Tooltip title={config.productTitle ? config.productTitle.props.info.help : ''}>
                            <Icon
                              type="info-circle-o"
                              style={{
                                marginRight: 4,
                              }}
                            />
                          </Tooltip>
                        </em>
                      </span>
                    }
                >
                  {getFieldDecorator('productTitle', {
                    initialValue: data.productTitle,
                    rules: [
                      {
                        required: true,
                        message: '',
                      },
                    ],
                  })(
                    <Input
                      placeholder='请输入产品名称'
                      maxLength={config.productTitle ? config.productTitle.props.maxLength : 255}
                    />,
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={
                      <span>
                        {config.productKeywords ? config.productKeywords.props.label: ''}
                        <em className={styles.optional}>
                          <Tooltip title={config.productKeywords ? config.productKeywords.props.info.help : ''}>
                            <Icon
                              type="info-circle-o"
                              style={{
                                marginRight: 4,
                              }}
                            />
                          </Tooltip>
                        </em>
                      </span>
                    }
                >
                  {getFieldDecorator('productKeywords', {
                    initialValue: data.productKeywords,
                    rules: [
                      {
                        required: true,
                        type: array,
                        message: '请至少填写一个关键词',
                      },
                    ],
                  })(
                    <ul style={{paddingLeft: '0'}}>
                      {
                        data.productKeywords && data.productKeywords.map((item,index) => {
                          return (
                            <li key={index}>
                              <Input
                                value={item}
                                style={{width: '95%'}}
                                placeholder={config.productKeywords && index === 0 ? config.productKeywords.props.placeholder : ''}
                                maxLength={config.productKeywords ? config.productKeywords.props.maxLength : 255}
                                onChange={e => changeKeyword('update',index, e.target.value)}
                              />
                              {data.productKeywords && data.productKeywords.length < 2 ? null : <Icon onClick={() => changeKeyword('delete',index)} type="delete" className={styles.delete} />}
                            </li>
                          )
                        })
                      }
                    </ul>
                    
                  )}
                  <div> {config.productKeywords ? config.productKeywords.props.info.bottom : ''} </div>
                  {data.productKeywords && data.productKeywords.length < 3 ? <Button onClick={() =>changeKeyword('add')}>  + 添加更多关键词 </Button> : null}
                </FormItem>
                <div>
                  <div className={styles.attrTitle}> 
                    <FormItem
                      {...formItemLayout}
                      label={config.productAttr? config.productAttr.props.label : ''}
                    >
                      {config.productAttr? config.productAttr.props.info.top : ''} 
                    </FormItem>
                  </div>
                  {
                    config.productAttr && config.productAttr.props.dataSource ? 
                    <div>
                      {
                        config.productAttr.props.dataSource.map((item,index) => {
                          return (
                            <FormItem
                              key={index}
                              {...formItemLayout}
                              label={item.label}
                            >
                              {
                                item.uiType === 'select' || item.uiType === 'combobox' || item.uiType === 'sequentialCombobox'? <div>
                                  {getFieldDecorator(item.name, {
                                    initialValue: data.productAttr? data.productAttr[item.name].value : [],
                                    rules: [{required: item.required, message: item.required? '请补充该选项' : ''}],
                                  })(
                                    <Select mode={item.uiType === 'select' ? '' : 'multiple'} showArrow allowClear style={{width: '50%'}}>
                                      {
                                        item.dataSource.map((option,_index) => {
                                        return <Option key={option.value}>{option.text}</Option>
                                        })
                                      }
                                    </Select>
                                  )}
                                </div> : null
                              }
                              {
                                item.uiType === 'input'? <div>
                                  {getFieldDecorator(item.name, {
                                    initialValue: data.productAttr? data.productAttr[item.name].value : '',
                                    rules: [],
                                  })(
                                    <Input style={{width: '50%'}}/>
                                  )}
                                </div> : null
                              }
                              {
                                item.uiType === 'checkbox'? <div>
                                  {getFieldDecorator(item.name, {
                                    initialValue: data.productAttr? data.productAttr[item.name].value : [],
                                    rules: [],
                                  })(
                                    <Checkbox.Group
                                      options={formatLabel(item.dataSource)}
                                    />
                                  )}
                                </div> : null
                              }
                              
                            </FormItem>
                          )
                        })
                      }
                    </div> : null
                  }
                </div>
              <FormItem
                {...formItemLayout}
                label={config.customMoreProperty? config.customMoreProperty.props.label : ''}
              >
                {getFieldDecorator('customMoreProperty', {
                  initialValue: data.customMoreProperty? data.customMoreProperty : [],
                  rules: [],
                })(
                  <ul>
                      {
                        data.customMoreProperty.map((item,index) => {
                          return (
                            <li key={index}>
                              <Input
                                value={item.text}
                                style={{width: '30%'}}
                                placeholder={config.customMoreProperty ? config.customMoreProperty.props.locale.textPlaceholder : ''}
                                maxLength={40}
                                onChange={e => changeProperty('text',index, e.target.value)}
                              />
                              <Input
                                value={item.value}
                                style={{width: '30%',marginLeft: '10px'}}
                                placeholder={config.customMoreProperty ? config.customMoreProperty.props.locale.valuePlaceholder : ''}
                                maxLength={40}
                                onChange={e => changeProperty('value',index, e.target.value)}
                              />
                               {data.customMoreProperty.length > 1 && data.customMoreProperty.length < 10 ? <Icon onClick={() => changeProperty('delete',index)} type="delete" className={styles.delete} /> : null}
                            </li>
                          )
                        })
                      }
                      <li> {config.customMoreProperty ? config.customMoreProperty.props.locale.tips : ''} </li>
                    <li><Button onClick={() => changeProperty('add')}>{config.customMoreProperty ? config.customMoreProperty.props.locale.addButtonLabel : ''} </Button></li>
                  </ul>
                )}
              </FormItem>
              </Card>

              <Card size="small" title="SKU属性编辑" >
              <FormItem
                {...formItemLayout}
                label={config.productSize? config.productSize.props.label : ''}
              >
                {getFieldDecorator('productSize', {
                  initialValue: data.productSize? data.productSize : [],
                  rules: [],
                })(
                  <Checkbox.Group
                    options={formatLabel(config.productSize? config.productSize.props.dataSource : [])}
                  />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={config.productColor? config.productColor.props.label : ''}
              >
                {getFieldDecorator('productColor', {
                  initialValue: data.productColor? data.productColor : [],
                  rules: [],
                })(
                  <Select showArrow allowClear style={{width: '50%'}}>
                    {
                      config.productColor && config.productColor.props.dataSource.map((option,_index) => {
                      return <Option key={option.value}><div className={styles.outline}><div className={styles.inline} style={{background: option.rgb}}></div></div>{option.text}</Option>
                      })
                    }
                  </Select>
                )}
              </FormItem>
              </Card>

              <Card size="small" title="商品描述" >
              <FormItem
                {...formItemLayout}
                label={config.productImage? config.productImage.props.label : ''}
              >
                {getFieldDecorator('productImage', {
                  initialValue: data.productImage,
                  rules: [
                    {
                      required: true,
                      message: '请选择产品图片',
                    },
                  ],
                })(
                  <div>
                    <div className={styles.imgBtn}>
                      <MultiUpload {...multiProps} text="上传图片" />
                    </div>
                    {
                      config.productImage  && config.productImage.length ?
                        <SortableList {...sortProps} /> : ''
                    }
                  </div>
                )}
              </FormItem>
              <UEditor
                  name="content"
                  height="350"
                  content={data.productPropText == null ? '' : data.productPropText}
                />
              </Card>
              
              <FormItem
                {...submitFormLayout}
                style={{
                  marginTop: 32,
                }}
              >
                <Button type="primary" htmlType="submit" loading={submitting}>
                  <FormattedMessage id="formandbasic-form.form.submit" />
                </Button>
                <Button
                  style={{
                    marginLeft: 8,
                  }}
                >
                  <FormattedMessage id="formandbasic-form.form.save" />
                </Button>
              </FormItem>
            </Form>
          </Card>
      );
    }
  }
  
  export default Form.create()(
    connect(({ productDetail,loading }) => ({
        productDetail,
        submitting: loading.effects['formAndbasicForm/submitRegularForm'],
    }))(BasicForm),
  );
  