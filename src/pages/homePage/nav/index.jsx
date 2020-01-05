
  import { Table, Card,Alert,Input, InputNumber, Form ,Popconfirm, Button, Tabs } from 'antd';
  import React from 'react';
  import { connect } from 'dva';
  import { DndProvider, DragSource, DropTarget } from 'react-dnd';
  import HTML5Backend from 'react-dnd-html5-backend';
  import update from 'immutability-helper';
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
@connect(({ nav, loading }) => ({
    nav,
    loading: loading.models.nav,
}))
class TableList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            editingKey: '' 
        };
        this.columns = [
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: '导航名称',
              dataIndex: 'title',
              key: 'title',
              editable: true,
            },
            {
              title: '导航链接',
              dataIndex: 'url',
              key: 'url',
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
          type: 'nav/fetch',
          payload: {
            module: 'index-nav-top',
          }
        });
    }
  
    components = {
      body: {
        row: DragableBodyRow,
      },
    };
  
    moveRow = (dragIndex, hoverIndex) => {
      const { dispatch, nav} = this.props;
      let { list } = nav;
      const dragRow = list[dragIndex];
      list = update(list, {$splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]})
      dispatch({
        type: 'nav/updateState',
        payload: {
            list,
        },
      })
    };

    isEditing = record => record.id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, currentKey) {
        form.validateFields((error, row) => {
            if (error) {
              return;
            }
            const { dispatch, nav} = this.props;
            let { list,key } = nav;
            const newData = list;
            const index = newData.findIndex(item => currentKey === item.id);
            
            if (index > -1) {
              const item = newData[index];
              newData.splice(index, 1, { ...item, ...row });
                dispatch({
                    type: 'nav/update',
                    payload: {
                        module: key,
                        id: currentKey !== '0'? currentKey : undefined,
                        title: row.title,
                        url: row.url,
                    },
                })
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
        this.setState({ editingKey: key });
    }

    onAdd = () => {
        const { dispatch, nav} = this.props;
        let {list, key } = nav;
        let obj ={
            id: '0',
            title: ''
        }
        list.push(obj)
        dispatch({
            type: 'nav/queryList',
            payload: list,
        })
        this.setState({ editingKey: '0'});
    }

    onSaveSort = () => {
      const { dispatch, nav} = this.props;
      let { list,key } = nav;
      let sort= []
      list.forEach((item,index) => {
          sort.push({id:item.id,sort:index})
      })
      dispatch({
          type: 'nav/updateSort',
          payload: {
            module: key,
            sort_array: sort,
          }
      })
  }

    onChangeTab = (key) => {
      const { dispatch } = this.props;
      this.setState({ editingKey: ''});
      dispatch({
        type: 'nav/fetch',
        payload: {
          module: key,
        }
      })
      dispatch({
        type: 'nav/updateState',
        payload: {
          key,
        }
      })
    }
  
    render() {
        const {
            nav: { list},
            loading,
            dispatch,
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
          <Tabs  onChange={this.onChangeTab} type="card">
            <TabPane tab="顶部导航" key="index-nav-top">
              <Alert message="*备注：顶部导航最多可添加5个" type="error" />

              <EditableContext.Provider value={this.props.form}>
                  <DndProvider backend={HTML5Backend}>
                  <Table
                      columns={columns}
                      bordered
                      dataSource={list}
                      components={components}
                      pagination={false}
                      loading={loading}
                      rowKey={(record, index) => index}
                      rowClassName="editable-row"
                      onRow={(record, index) => ({
                          index,
                          moveRow: this.moveRow,
                      })}
                  />
                  </DndProvider>
              </EditableContext.Provider>
              {
                  list.length < 5 ? 
                  <div style={{width: '100%',marginTop: '10px'}}><Button onClick={this.onAdd} disabled={this.state.editingKey !== ''} block>+新增</Button></div>
                  : null
              }
            </TabPane>
            <TabPane tab="侧边导航" key="index-nav-left">
            <Alert message="*备注：顶部导航最多可添加8个" type="error" />
              <EditableContext.Provider value={this.props.form}>
                  <DndProvider backend={HTML5Backend}>
                  <Table
                      columns={columns}
                      bordered
                      dataSource={list}
                      components={components}
                      loading={loading}
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
              {
                  list.length < 8? 
                  <div style={{width: '100%',marginTop: '10px'}}><Button onClick={this.onAdd} disabled={this.state.editingKey !== ''} block>+新增</Button></div>
                  : null
              }
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
  