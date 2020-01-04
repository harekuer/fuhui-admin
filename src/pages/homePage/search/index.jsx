  import { Table, Card,Alert,Input, InputNumber, Form ,Popconfirm } from 'antd';
  import React, { Component, Fragment } from 'react';
  import { connect } from 'dva';
  import moment from 'moment';
  import { DndProvider, DragSource, DropTarget } from 'react-dnd';
  import HTML5Backend from 'react-dnd-html5-backend';
  import update from 'immutability-helper';
  import styles from './index.less';
  


let dragingIndex = -1;

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
      connectDropTarget(<tr {...restProps} className={className} style={style} />),
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

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
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
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow),
);


/* eslint react/no-multi-comp:0 */
@connect(({ search, loading }) => ({
    search,
    loading: loading.models.search,
}))
class TableList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            data: [
                {
                  id: '1',
                  name: 'John Brown',
                  age: 32,
                  address: 'New York No. 1 Lake Park',
                },
                {
                  id: '2',
                  name: 'Jim Green',
                  age: 42,
                  address: 'London No. 1 Lake Park',
                },
                {
                  id: '3',
                  name: 'Joe Black',
                  age: 32,
                  address: 'Sidney No. 1 Lake Park',
                },
            ],
            editingKey: '' 
        };
        this.columns = [
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: '推荐词',
              dataIndex: 'name',
              key: 'name',
              editable: true,
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
                            Save
                          </a>
                        )}
                      </EditableContext.Consumer>
                      <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.id)}>
                        <a>Cancel</a>
                      </Popconfirm>
                    </span>
                  ) : (
                    <a disabled={editingKey !== ''} onClick={() => this.edit(record.id)}>
                      Edit
                    </a>
                  );
                },
            },
          ];
      }


    

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
          type: 'search/fetch',
        });
    }
  
    components = {
      body: {
        row: DragableBodyRow,
      },
    };
  
    moveRow = (dragIndex, hoverIndex) => {
      const { data } = this.state;
      const dragRow = data[dragIndex];
  
      this.setState(
        update(this.state, {
          data: {
            $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
          },
        }),
      );
    };

    isEditing = record => record.id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, key) {
        form.validateFields((error, row) => {
        if (error) {
            return;
        }
        const newData = [...this.state.data];
        const index = newData.findIndex(item => key === item.id);
        if (index > -1) {
            const item = newData[index];
            newData.splice(index, 1, {
            ...item,
            ...row,
            });
            this.setState({ data: newData, editingKey: '' });
        } else {
            newData.push(row);
            this.setState({ data: newData, editingKey: '' });
        }
        });
    }

    edit(key) {
        this.setState({ editingKey: key });
    }
  
    render() {
        const {
            search: { list},
            loading,
        } = this.props;

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
      return (
        <Card bordered={false}>
            <Alert message="*备注：搜索推荐词最多可设置10个，页面外显最多6个；推荐词6个的情况下，外显的搜索词将从设置的内容中随机抽取显示，用户每次刷新将会重新抽取，搜索词排序随机" type="error" />

            <EditableContext.Provider value={this.props.form}>
                <DndProvider backend={HTML5Backend}>
                <Table
                    columns={columns}
                    bordered
                    dataSource={this.state.data}
                    components={components}
                    rowClassName="editable-row"
                    onRow={(record, index) => ({
                        index,
                        moveRow: this.moveRow,
                    })}
                />
                </DndProvider>
            </EditableContext.Provider>
        </Card>
      );
    }
  }

  
  export default Form.create()(TableList);
  