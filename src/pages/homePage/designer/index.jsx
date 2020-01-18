import { Table, Card, Alert, Input, InputNumber, Form, Popconfirm, Button, Tabs } from 'antd';
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SingleUpload from '@/components/SinglePicture/SingleUpload.js';
import SinglePicture from '@/components/SinglePicture/SinglePicture.js';
import update from 'immutability-helper';
import EditModal from './components/editModal'
import styles from './index.less';

let dragingIndex = -1;
const { TabPane } = Tabs;

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
    console.log(this.props.inputType)
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
            })(<Input />)}
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
class TableList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.list,
      editingKey: '',
    };
    this.columns = [
      {
        title: '排序',
        dataIndex: 'sort',
        key: 'sort',
      },
      {
        title: '分类名称',
        dataIndex: 'title',
        key: 'title',
        editable: true,
      },
      {
        title: '推荐内容',
        dataIndex: 'content',
        key: 'content',
        render: (text, record) => {
          const { editingKey } = this.state;
          return (
            <a disabled={editingKey !== ''} onClick={() =>this.handleChangeEditVisible(record.sort, true)}>编辑</a>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        render: (text, record) => {
            const { editingKey } = this.state;
            const editable = this.isEditing(record);
            return editable ? (
              <span>
                <EditableContext.Consumer>
                  {form => (
                    <a
                      onClick={() => this.save(form, record.id)}
                      style={{ marginRight: 8 }}
                    >
                      保存
                    </a>
                  )}
                </EditableContext.Consumer>
                <Popconfirm title="取消编辑?" onConfirm={() => this.cancel(record.id)}>
                  <a>取消</a>
                </Popconfirm>
              </span>
            ) : (
              <span>
                  <a disabled={editingKey !== ''} onClick={() => this.edit(record.id)} style={{ marginRight: 8 }}>
                  编辑
                  </a>
                  <a onClick={() => this.onDelete(record.id)}>
                  删除
                  </a>
              </span>
            );
          },
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'designer/fetch',
      payload: {
        module: 'index-designer',
      }
    });
  }


  components = {
    body: {
      row: DragableBodyRow,
    },
  };
  moveRow = (dragIndex, hoverIndex) => {
    const { dispatch, designer } = this.props;
    let { list } = designer;
    const dragRow = list[dragIndex];
    list = update(list, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    });
    dispatch({
      type: 'designer/updateState',
      payload: {
        list,
      },
    });
  };
  isEditing = record => record.id === this.state.editingKey;
  cancel = () => {
    this.setState({
      editingKey: '',
    });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }

      const { dispatch, designer } = this.props;
      let { list } = designer;
      const newData = list;
      const index = newData.findIndex(item => key === item.id);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        dispatch({
          type: 'designer/update',
          payload: {
            module: 'index-designer',
            id: key !== '0' ? key : undefined,
            title: row.title,
            //extra: row.extra,
          },
        });
        this.setState({
          editingKey: '',
        });
      } else {
        this.setState({
          editingKey: '',
        });
      }
    });
  }

  edit(key) {
    this.setState({
      editingKey: key,
    });
  }

  onDelete(key) {
    const { dispatch } = this.props;
    dispatch({
      type: 'designer/remove',
      payload: {
        module: 'index-designer',
        id: key,
      },
    });
  }

  onAdd = () => {
    const { dispatch, designer } = this.props;
    let { list } = designer;
    let obj = {
      id: '0',
      sort: '',
      title: '',
    };
    list.push(obj);
    dispatch({
      type: 'designer/queryList',
      payload: list,
    });
    this.setState({
      editingKey: '0',
    });
  };
  onSaveSort = () => {
    const { dispatch, designer } = this.props;
    let { list, key  } = designer;
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

  onChangeTab = (key) => {
    const { dispatch } = this.props;
    this.setState({ editingKey: ''});
    dispatch({
      type: 'designer/fetch',
      payload: {
        module: key,
      }
    })
    dispatch({
      type: 'designer/updateState',
      payload: {
        key,
      }
    })
  }

  handleChangeEditVisible = (id, state) => {
    const { dispatch, designer } = this.props;
    let { key } = designer;
    dispatch({
      type: 'designer/updateState',
      payload: {
        editModalVisible: state
      }
    })
    // 获取详情
    dispatch({
      type: 'designer/fetch',
      payload: {
        module: key,
        id
      }
    })
   }



  render() {
    const {
      designer,
      designer: { list },
      loading,
      dispatch,
    } = this.props;
    const { editModalVisible,extraData } = designer
    const components = {
      body: {
        cell: EditableCell,
        row: DragableBodyRow,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    // 编辑菜单props
    const editProps = {
      editModalVisible,
      extraData,
      infoLoading: loading.effects['designer/fetch'],
      handleCancel: function (params) {
        onChangeVisible({ editModalVisible: params })
      },
      handleSaveMenu: function (params) {
        // 保存菜单
        // dispatch({
        //   type: 'siteMenu/editMenu',
        //   payload: { ...params }
        // })
      }
    }
    const onChangeVisible = (params) => {
      dispatch({
        type: 'designer/updateState',
        payload: {}
      })

      dispatch({
        type: 'designer/updateState',
        payload: {
          ...params
        }
      })
    }

    return (
      <Card bordered={false}>
        <Tabs onChange={this.onChangeTab} type="card">
          <TabPane tab="设计师推荐" key="index-designer">
            <Alert message="*备注：最多可添加5个分类" type="error" style={{ marginBottom: '15px' }} />

            <EditableContext.Provider value={this.props.form}>
              <DndProvider backend={HTML5Backend} context={window}>
                <Table
                  columns={columns}
                  bordered
                  dataSource={list}
                  components={components}
                  pagination={false}
                  loading={loading.effects['designer/fetch']}
                  rowKey={(record, index) => index}
                  rowClassName="editable-row"
                  onRow={(record, index) => ({
                    index,
                    moveRow: this.moveRow,
                  })}
                />

              </DndProvider>
            </EditableContext.Provider>

            <EditModal {...editProps} />

            {list.length < 5 ? (
              <div
                style={{
                  width: '100%',
                  marginTop: '10px',
                }}
              >
                <Button onClick={this.onAdd} disabled={this.state.editingKey !== ''} block>
                  +新增
            </Button>
              </div>
            ) : null}
          </TabPane>
         
        </Tabs>
        <div className={styles.btnWrap}>
          <Button onClick={this.onSaveSort}>保存排序</Button>
        </div>
        
      </Card>
    );
  }
}

export default Form.create()(TableList);
