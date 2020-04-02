import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import UEditor from '@/components/Ueditor'
import { Form, Input, Button,  Card } from 'antd'


import styles from './index.less'

const FormItem = Form.Item;
const UPDATE = 'update';


const Detail = ({
  articleDetail,
  loading,
  dispatch,
  location,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
}) => {
  const { data } = articleDetail;
  const { state } = location;
  const dataLoading = state && state.type === 'update'? loading.effects['articleDetail/query'] : false;
  const formItemLayout =  {
    labelCol: { span: 2 },
    wrapperCol: {
      xl:{span: 20},
      lg:{span: 20},
      md:{span: 21}
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
        content:UE.getEditor('articleContent').getContent(),
      }
      dispatch({
        type: 'articleDetail/change',
        payload: {
          ...formData,
          id: data.id,
          module: state.module? state.module : 'footer-article-list1',
          lang: state.lang? state.lang : 'en'
        },
      })
    })
  }


  const articleForm = [
    {
      label: '文章标题',
      name: 'title',
      value: data.title,
      rules: [{ required: true, message: '请输入文章标题', max: 255,}],
      hasFeedback: true,
      node: (
        <Input maxLength={255}/>
      )
    },
    {
      label: '内容',
      name: 'content',
      value: data.content,
      rules: [],
      hasFeedback: true,
      node: (
        <div>
          {
            !dataLoading ? <UEditor
            name="articleContent"
            height="650"
            content={data.content}
          /> : null
          }
        </div>
      )
    },
  ]

  return (
    <Card bordered={false}>
      <div className="content-inner">
        <div className={styles.detail}>
          <Form layout="horizontal">
            {
              articleForm.map(item => {
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
              <Button type="primary" onClick={() => saveEdit()}>保存</Button>
              {/* <Button style={{ marginLeft: '15px' }} onClick={() => goBack()}>返回</Button> */}
            </FormItem>
          </Form>
        </div>
      </div>
    </Card>
    
  )
}

Detail.propTypes = {
  form: PropTypes.object,
  articleDetail: PropTypes.object,
}

export default connect(({ articleDetail, loading }) => ({ articleDetail, loading }))(Form.create()(Detail))
