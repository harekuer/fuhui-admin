import React, { Component } from 'react';
import { Button, Modal, Spin, Form, Checkbox, Input, InputNumber, Radio } from 'antd'
import styles from './index.less'

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: {
    xl: { span: 14 },
    lg: { span: 14 },
    md: { span: 14 }
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 14,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 6,
    },
  },
};

class addModal extends Component {

  render() {
    const {
      addModalVisible,
      handleCancel,
      handleAddMenu,
      parentId,
      addInfo,
      isCenter,
      saveLoading,
      form: {
        getFieldDecorator,
        validateFields,
        getFieldValue,
      },
    } = this.props


    // 新增表单
    const addForm = [
      {
        label: '父级ID',
        name: 'parent_id',
        value: parentId,
        node: (
          <Input placeholder="" disabled />
        )
      },
      {
        label: '菜单名称',
        name: 'menu_name',
        value: addInfo && addInfo.menu_name,
        rules: [
          { required: true, message: "菜单名称不能为空" },
        ],
        colon: true,
        node: (
          <Input placeholder="" />
        )
      },
      {
        label: '英文名称',
        name: 'menu_name_en',
        value: addInfo && addInfo.name_en || null,
        rules: [
          { required: true, message: "英文名称不能为空" },
        ],
        node: (
          <Input placeholder="" />
        )
      },
      {
        label: '前端路由',
        name: 'route',
        value: addInfo && addInfo.route,
        rules: [
          { required: true, message: "路由不能为空" },
        ],
        node: (
          <Input placeholder='父级菜单无需跳转则输入"null"' />
        )
      },
      {
        label: '后端路由',
        name: 'route_backend',
        value: addInfo && addInfo.route_backend,
        node: (
          <Input placeholder="" />
        )
      },
      {
        label: '请求接口',
        name: 'url',
        value: addInfo && addInfo.url,
        node: (
          <Input placeholder="" />
        )
      },
      {
        label: '排序',
        name: 'sort',
        value: addInfo && addInfo.sort,
        rules: [
          { required: true, message: "排序不能为空" },
        ],
        node: (
          <InputNumber />
        )
      },
      {
        label: '图标',
        name: 'icon',
        value: addInfo && addInfo.icon,
        rules: [
          { required: false },
        ],
        node: (
          <Input placeholder="图标建议由前端填入" />
        )
      },

    ];

    /**
     * 提交
     */
    const handleSubmit = () => {
      validateFields((err, values) => {
        if (err) return;

        handleAddMenu({
          ...values,
          is_show: values.is_show ? 1 : 0     // true=1,否则为0
        })
      })

    }

    return (
      <div>
        <Modal
          title="新增"
          wrapClassName="vertical-center-modal"
          visible={addModalVisible}
          footer={null}
          width={520}
          onCancel={() => handleCancel(false)}
          maskClosable={false}
        >
          <Spin tip="Loading..." spinning={false}>
            {
              addInfo !== null ?
                <Form layout="horizontal" className={styles.minForm}>
                  {
                    addForm.map(item => {
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

                  <FormItem {...formItemLayout} label="是否显示">
                    {getFieldDecorator('is_show', {
                      valuePropName: 'checked',
                      initialValue:true
                    })(
                      <Checkbox>是否显示在左侧菜单</Checkbox>
                    )}
                  </FormItem>
                </Form>
                :
                null
            }

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <Button
                type="primary"
                size="large"
                style={{ marginRight: 10 }}
                onClick={handleSubmit}
                loading={saveLoading}
              >保存</Button>
            </div>
          </Spin>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(addModal);
