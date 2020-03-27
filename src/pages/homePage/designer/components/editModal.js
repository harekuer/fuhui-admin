import React, { Component, Fragment } from 'react';
import { Table, Button, Modal, Spin, Form, Input, InputNumber, Select,Popconfirm } from 'antd'
import { connect } from 'dva';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

let dragingIndex = -1;
const { Option } = Select;

class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };
    let { className } = restProps;

    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }

      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />)
    );
  }
}

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber />;
    }
    return <Input />;
  };
  renderCell = ({ getFieldDecorator, setFieldsValue }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      dispatch,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(<InputNumber min={0}/>)}
          </Form.Item>
        ) : (
            children
          )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};
const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index; // Don't replace items with themselves

    if (dragIndex === hoverIndex) {
      return;
    } // Time to actually perform the action

    props.moveRow(dragIndex, hoverIndex); // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index designeres.

    monitor.getItem().index = hoverIndex;
  },
};
const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow)
);
/* eslint react/no-multi-comp:0 */

@connect(({ designer, loading }) => ({
  designer,
  loading
}))

class editModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: props.list,
      editingKey: -1,
    };
    this.columns = [
      {
        title: '排序',
        dataIndex: 'sort',
        key: 'sort',
        render: (text, record, index) => {
          return index
        }
      },
      {
        title: props.tabkey === 'index-designer' ? '设计师ID' : props.tabkey === 'index-factory'? '工厂ID' : '产品ID',
        dataIndex: props.tabkey === 'index-designer' ? 'designer_id' : props.tabkey === 'index-factory'? 'factory_id' :'product_id',
        key: props.tabkey === 'index-designer' ? 'designer_id' : props.tabkey === 'index-factory'? 'factory_id' : 'product_id',
        editable: true,
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        render: (text, record,index) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(index);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    onClick={() => this.save(form, index)}
                    style={{ marginRight: 8 }}
                  >
                    保存
                    </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm title="确定撤销编辑?" onConfirm={() => this.cancel(index)}>
                <a>取消</a>
              </Popconfirm>
            </span>
          ) : (
              <span>
                <a disabled={editingKey !== -1} onClick={() => this.edit(index)} style={{ marginRight: 8 }}>
                编辑
                </a>
                {props.tabkey === 'index-group-image'? <a onClick={() => this.onDelete(index)}>删除</a>: null}
              </span>
            );
        },
      },
    ];
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { dispatch, designer } = this.props;
    let { list,extraData } = designer;

    const dragRow = extraData.extra["rows"][dragIndex];
    extraData.extra["rows"] = update(extraData.extra["rows"], {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    });
    
    dispatch({
      type: 'designer/updateState',
      payload: {
        extraData
      },
    });
  };
  isEditing = index => index === this.state.editingKey;
  cancel = () => {
    this.setState({
      editingKey: -1,
    });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const { dispatch, designer } = this.props;
      let { extraData } = designer;
      const { extra } = extraData
      const newData = extra.rows;
      if (key > -1) {
        const item = newData[key];
        newData.splice(key, 1, { ...item, ...row });
        dispatch({
          type: 'designer/updateState',
          payload: {
            extraData: {
              ...extraData,
              extra: {
                ...extra,
                rows: newData,
              }
            }
          },
        });
        this.setState({
          editingKey: -1,
        });
      } else {
        this.setState({
          editingKey: -1,
        });
      }
    });
  }

  edit(key) {
    this.setState({
      editingKey: key,
    });
  }

  onDelete(index) {
    const { dispatch, designer } = this.props;
    let { extraData } = designer;
    extraData.extra.rows.splice(index,1);
    dispatch({
      type: 'designer/updateState',
      payload: {
        extraData,
      },
    });
  }

  onAdd = () => {
    const { dispatch, designer } = this.props;
    let { extraData, key } = designer;
    let extraObj = {}
    if(key === 'index-designer'){
      extraObj.designer_id= ''
    } else if(key === 'index-factory'){
      extraObj.factory_id = ''
    } else {
      extraObj.product_id = ''
    }
    extraData.extra.rows.push(extraObj);
    dispatch({
      type: 'designer/updateState',
      payload: {
        extraData,
      }
    });
    this.setState({
      editingKey: extraData.extra.rows.length - 1,
    });
  };

  onSaveSort = () => {
    const { dispatch, designer } = this.props;
    let { list, key } = designer;
    let sort = [];
    let id = [];
    list.forEach((item, index) => {
      sort.push({
        id: item.id,
        sort: index,
      });
    });
    dispatch({
      type: 'designer/updateSort',
      payload: {
        module: key,
        sort_array: sort,
      }
    });
  };

  render() {
    const {
      editModalVisible,
      extraData, 
      tabkey,
      infoLoading,
      saveLoading,
      handleCancel,
      handleSaveExtra,
      form: {
        getFieldDecorator,
        validateFields,
        getFieldValue,
      },
    } = this.props
    const { extra } = extraData
    const limit = tabkey === 'index-designer' ? 2 : 10

    const components = {
      body: {
        cell: EditableCell,
        row: DragableBodyRow,
      },
    };

    const columns = this.columns.map((col,index) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record,index) => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(index),
        }),
      };
    });

    const handleOk = () => {
      const { extra } = extraData
      handleSaveExtra(extraData.id, extra ? extra : {})
    }

    const handleChange = (value) => {
      const { dispatch } = this.props;
      let { extra } = extraData
      extra.level = value
      dispatch({
        type: 'designer/updateState',
        payload: {
          extraData: {
            ...extraData,
            extra,
          }
        },
      });
    }

    return (

      <Modal
        title="推荐内容设置"
        wrapClassName="vertical-center-modal"
        visible={editModalVisible}
        footer={[
            <Button key="cancel" size="large" onClick={() => handleCancel(false)}>取消</Button>,
            <Button type="primary" key="ok" size="large" disabled={!extra} onClick={handleOk} loading={saveLoading}>保存 </Button>,
          ]
        }
        width={520}
        onCancel={() => handleCancel(false)}
        maskClosable={false}
      >
        <Spin tip="Loading..." spinning={infoLoading}>
          {this.props.tabkey === 'index-designer'?
            <div style={{marginBottom: '15px'}}>
            <label>等级：</label>
            <Select defaultValue="A" style={{ width: 150 }} onChange={handleChange}>
              <Option value="A">A</Option>
              <Option value="B">B</Option>
              <Option value="C" >C</Option>
              <Option value="D">D</Option>
            </Select>
          </div> : null
          }
          
          <EditableContext.Provider value={this.props.form}>
            <DndProvider backend={HTML5Backend} context={window}>
              <Table
                columns={columns}
                bordered
                dataSource={extra ? extra.rows : []}
                components={components}
                pagination={false}
                rowKey={(record, index) => index}
                rowClassName="editable-row"
                onRow={(record, index) => ({
                  index,
                  moveRow: this.moveRow,
                })}
              />

            </DndProvider>
          </EditableContext.Provider>
          {extra.rows.length < limit ? (
              <div
                style={{
                  width: '100%',
                  marginTop: '10px',
                }}
              >
                <Button onClick={this.onAdd} disabled={this.state.editingKey !== -1} block>
                  +新增
            </Button>
              </div>
            ) : null}
        </Spin>
      </Modal>
    );
  }
}

export default Form.create()(editModal);
