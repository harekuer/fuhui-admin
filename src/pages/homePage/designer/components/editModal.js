import React, { Component } from 'react';
import { Button, Modal, Spin, Form, Input, InputNumber, Checkbox, Radio } from 'antd'
// import styles from './index.less'

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
      extraData,
      infoLoading,
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
          // ...values,
          // menu_id: menuInfo.menu_id,
          // type: 1,
          // is_show: values.is_show ? 1 : 0     // true=1,否则为0
        })
      })

    }

    // 编辑表单
    const editForm = [
      // {
      //   label: '菜单名称',
      //   name: 'menu_name',
      //   value: menuInfo && menuInfo.name_zh || null,
      //   rules: [
      //     { required: true, message: "菜单名称不能为空" },
      //   ],
      //   node: (
      //     <Input placeholder="" />
      //   )
      // },
      
    ];

    return (

      <Modal
        title="推荐内容设置"
        wrapClassName="vertical-center-modal"
        visible={editModalVisible}
        footer={null}
        width={520}
        onCancel={() => handleCancel(false)}
        maskClosable={false}
      >
        <Spin tip="Loading..." spinning={infoLoading}>
          <div>dshdkjsakdjsakl</div>
        </Spin>
      </Modal>
    );
  }
}

export default Form.create()(editModal);
