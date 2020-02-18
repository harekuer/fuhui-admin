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
    Tooltip,
  } from 'antd';
  import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
  import React, { Component } from 'react';
  import { PageHeaderWrapper } from '@ant-design/pro-layout';
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

      const addKeywords = () => {
        let newData = data
        newData.productKeywords.push('')
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
              hideRequiredMark
              style={{
                marginTop: 8,
              }}
            >
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
                          <li>
                            <Input
                              value={item}
                              style={{width: '95%'}}
                              placeholder={config.productKeywords && index === 0 ? config.productKeywords.props.placeholder : ''}
                              maxLength={config.productKeywords ? config.productKeywords.props.maxLength : 255}
                            />
                            {data.productKeywords && data.productKeywords.length < 2 ? null : <Icon type="delete" />}
                          </li>
                        )
                      })
                    }
                  </ul>
                  
                )}
                <div> {config.productKeywords ? config.productKeywords.props.info.bottom : ''} </div>
                {data.productKeywords && data.productKeywords.length < 3 ? <Button onClick={addKeywords}>  + 添加更多关键词 </Button> : null}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="formandbasic-form.goal.label" />}
              >
                {getFieldDecorator('goal', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({
                        id: 'formandbasic-form.goal.required',
                      }),
                    },
                  ],
                })(
                  <TextArea
                    style={{
                      minHeight: 32,
                    }}
                    placeholder={formatMessage({
                      id: 'formandbasic-form.goal.placeholder',
                    })}
                    rows={4}
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="formandbasic-form.standard.label" />}
              >
                {getFieldDecorator('standard', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({
                        id: 'formandbasic-form.standard.required',
                      }),
                    },
                  ],
                })(
                  <TextArea
                    style={{
                      minHeight: 32,
                    }}
                    placeholder={formatMessage({
                      id: 'formandbasic-form.standard.placeholder',
                    })}
                    rows={4}
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={
                  <span>
                    <FormattedMessage id="formandbasic-form.client.label" />
                    <em className={styles.optional}>
                      <FormattedMessage id="formandbasic-form.form.optional" />
                      <Tooltip title={<FormattedMessage id="formandbasic-form.label.tooltip" />}>
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
                {getFieldDecorator('client')(
                  <Input
                    placeholder={formatMessage({
                      id: 'formandbasic-form.client.placeholder',
                    })}
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={
                  <span>
                    <FormattedMessage id="formandbasic-form.invites.label" />
                    <em className={styles.optional}>
                      <FormattedMessage id="formandbasic-form.form.optional" />
                    </em>
                  </span>
                }
              >
                {getFieldDecorator('invites')(
                  <Input
                    placeholder={formatMessage({
                      id: 'formandbasic-form.invites.placeholder',
                    })}
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={
                  <span>
                    <FormattedMessage id="formandbasic-form.weight.label" />
                    <em className={styles.optional}>
                      <FormattedMessage id="formandbasic-form.form.optional" />
                    </em>
                  </span>
                }
              >
                {getFieldDecorator('weight')(
                  <InputNumber
                    placeholder={formatMessage({
                      id: 'formandbasic-form.weight.placeholder',
                    })}
                    min={0}
                    max={100}
                  />,
                )}
                <span className="ant-form-text">%</span>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="formandbasic-form.public.label" />}
                help={<FormattedMessage id="formandbasic-form.label.help" />}
              >
                <div>
                  {getFieldDecorator('public', {
                    initialValue: '1',
                  })(
                    <Radio.Group>
                      <Radio value="1">
                        <FormattedMessage id="formandbasic-form.radio.public" />
                      </Radio>
                      <Radio value="2">
                        <FormattedMessage id="formandbasic-form.radio.partially-public" />
                      </Radio>
                      <Radio value="3">
                        <FormattedMessage id="formandbasic-form.radio.private" />
                      </Radio>
                    </Radio.Group>,
                  )}
                  <FormItem
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    {getFieldDecorator('publicUsers')(
                      <Select
                        mode="multiple"
                        placeholder={formatMessage({
                          id: 'formandbasic-form.publicUsers.placeholder',
                        })}
                        style={{
                          margin: '8px 0',
                          display: getFieldValue('public') === '2' ? 'block' : 'none',
                        }}
                      >
                        <Option value="1">
                          <FormattedMessage id="formandbasic-form.option.A" />
                        </Option>
                        <Option value="2">
                          <FormattedMessage id="formandbasic-form.option.B" />
                        </Option>
                        <Option value="3">
                          <FormattedMessage id="formandbasic-form.option.C" />
                        </Option>
                      </Select>,
                    )}
                  </FormItem>
                </div>
              </FormItem>
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
  