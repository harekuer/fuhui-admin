import React, { Component } from 'react';
import { Button, Modal, Spin, Form, Input, InputNumber, Checkbox, Radio } from 'antd'
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


class editModal extends Component {

  render() {
    const {
      editModalVisible,
      menuInfo,
      isCenter,
      infoLoading,
      saveLoading,
      handleCancel,
      handleSaveMenu,
      form: {
        getFieldDecorator,
        validateFields,
        getFieldValue,
      },
    } = this.props

    /**
     * 提交
     */
    const handleSubmit = () => {
      validateFields((err, values) => {
        if (err) return;

        handleSaveMenu({
          ...values,
          menu_id: menuInfo.menu_id,
          is_show: values.is_show ? 1 : 0     // true=1,否则为0
        })
      })

    }

    // 编辑表单
    const editForm = [
      {
        label: '菜单名称',
        name: 'menu_name',
        value: menuInfo && menuInfo.name_zh || null,
        rules: [
          { required: true, message: "菜单名称不能为空" },
        ],
        node: (
          <Input placeholder="" />
        )
      },
      {
        label: '英文名称',
        name: 'menu_name_en',
        value: menuInfo && menuInfo.name_en || null,
        rules: [
          { required: true, message: "英文名称不能为空" },
        ],
        node: (
          <Input placeholder="" />
        )
      },
      {
        label: 'ID',
        name: 'menu_id',
        value: menuInfo && menuInfo.menu_id || null,
        node: (
          <Input placeholder="" disabled />
        )
      },
      {
        label: '父级ID',
        name: 'parent_id',
        value: menuInfo && menuInfo.parent_id || null,
        rules: [
          { required: true, message: "父级ID不能为空" },
        ],
        node: (
          <Input placeholder="" />
        )
      },
      {
        label: '前端路由',
        name: 'route',
        value: menuInfo && menuInfo.route,
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
        value: menuInfo && menuInfo.route_backend,
        node: (
          <Input placeholder="" />
        )
      },
      {
        label: '排序',
        name: 'sort',
        value: menuInfo && menuInfo.sort || 0,
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
        value: menuInfo && menuInfo.icon,
        rules: [
          { required: false },
        ],
        node: (
          <Input placeholder="图标建议由前端填入"  />
        )
      },
    ];


    return (

      <Modal
        title="编辑"
        wrapClassName="vertical-center-modal"
        visible={editModalVisible}
        footer={null}
        width={520}
        onCancel={() => handleCancel(false)}
        maskClosable={false}
      >
        <Spin tip="Loading..." spinning={infoLoading}>
          <div style={{ minHeight: 300 }}>
            {
              menuInfo !== null ?
                <Form layout="horizontal" className={styles.minForm}>
                  {
                    editForm.map(item => {
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
                      initialValue:menuInfo.is_show == '1' ? true : false,
                    })(
                      <Checkbox>是否显示在左侧菜单</Checkbox>
                    )}
                  </FormItem>

                </Form>
                :
                null
            }

            <div style={{ textAlign: "right", marginTop: 20 }}>
              {
                menuInfo !== null ?
                  <Button
                    type="primary"
                    size="large"
                    style={{ marginRight: 10 }}
                    onClick={handleSubmit}
                    loading={saveLoading}
                  >保存</Button>
                  : null

              }

            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}

export default Form.create()(editModal);
