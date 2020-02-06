
  import { Table, Card,Alert,Input, InputNumber, Form ,Popconfirm, Button, Tabs } from 'antd';
  import React from 'react';
  import { connect } from 'dva';
  import { DndProvider, DragSource, DropTarget } from 'react-dnd';
  import HTML5Backend from 'react-dnd-html5-backend';
  import update from 'immutability-helper';
  import SingleUpload from '@/components/SinglePicture/SingleUpload.js';
  import SinglePicture from '@/components/SinglePicture/SinglePicture.js';
  import styles from './index.less';
  


let dragingIndex = -1;
const { TabPane } = Tabs;

class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, ...restProps } = this.props;
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
  getInput = (record, setFieldsValue) => {
    if (this.props.inputType === 'upload') {
      return <SingleUpload
        limit={1}
        file={record.image}
        isEdit={true}
        action={`/_os/index.php?com=common&t=imageUpload&module=${record.module}`}
        changeImage={(fileList) => {
          const { dispatch } = this.props
          let newData = this.props.record
          let newList = this.props.list
          let images = []
          if (fileList.length) {
            images = fileList.map((item) => {
              return item.path
            })
            newList.map(item => {
              if(item.id === newData.id){
                item.image = `//:${fileList[0].url}`
              }
              return item
            })
          } else {
            newList = []
          }
          dispatch({
            type: 'banner/updateState',
            payload: {
                list:newList,
            },
          })
          setFieldsValue({image:images[0]})
        }}
      />;
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
            })(this.getInput(record,setFieldsValue))}
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
@connect(({ entrance, loading }) => ({
    entrance,
    loading: loading.models.entrance,
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
              title: '单品图片',
              dataIndex: 'image',
              key: 'image',
              editable: true,
              render: (text, record) => {
                return <SinglePicture limit={1} fileList={[text]} showRemove={false} />
              },
            },
            {
              title: '单品链接',
              dataIndex: 'url',
              key: 'url',
              editable: true,
            },
            {
              title: '标题',
              dataIndex: 'title',
              key: 'title',
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
                            保存
                          </a>
                        )}
                      </EditableContext.Consumer>
                      <Popconfirm title="确定撤销编辑?" onConfirm={() => this.cancel(record.id)}>
                        <a>取消</a>
                      </Popconfirm>
                    </span>
                  ) : (
                    <span>
                      <a
                        disabled={editingKey !== ''}
                        onClick={() => this.edit(record.id)}
                        style={{
                          marginRight: 8,
                        }}
                      >
                        编辑
                      </a>
                      {
                        record.id == '0'? null : <a onClick={() => this.onDelete(record.id)}>删除</a>
                      }
                    </span>
                  );
                },
            },
          ];
      }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
          type: 'entrance/fetch',
          payload: {
            module: 'index-entrance-design',
          }
        });
    }
  
    components = {
      body: {
        row: DragableBodyRow,
      },
    };
  
    moveRow = (dragIndex, hoverIndex) => {
      const { dispatch, entrance} = this.props;
      let { list } = entrance;
      const dragRow = list[dragIndex];
      list = update(list, {$splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]})
      dispatch({
        type: 'entrance/updateState',
        payload: {
            list,
        },
      })
    };

    isEditing = record => record.id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    onDelete(key) {
      const { dispatch, entrance } = this.props;
      const module = entrance.key
      dispatch({
        type: 'entrance/remove',
        payload: {
          id: key,
          module,
        },
      });
    }

    save(form, currentKey) {
        form.validateFields((error, row) => {
            if (error) {
              return;
            }
            const { dispatch, entrance} = this.props;
            let { list,key } = entrance;
            const newData = list;
            const index = newData.findIndex(item => currentKey === item.id);
            
            if (index > -1) {
              const item = newData[index];
              newData.splice(index, 1, { ...item, ...row });
                dispatch({
                    type: 'entrance/update',
                    payload: {
                        module: key,
                        id: currentKey !== '0'? currentKey : undefined,
                        image: row.image,
                        url: row.url,
                        title: row.title,
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
        const { dispatch, entrance} = this.props;
        let {list, key } = entrance;
        let obj ={
            id: '0',
            title: '',
            module: key,
            title: '',
        }
        list.push(obj)
        dispatch({
            type: 'entrance/queryList',
            payload: list,
        })
        this.setState({ editingKey: '0'});
    }

    onSaveSort = () => {
      const { dispatch, entrance} = this.props;
      let { list,key } = entrance;
      let sort= []
      list.forEach((item,index) => {
          sort.push({id:item.id,sort:index})
      })
      dispatch({
          type: 'entrance/updateSort',
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
        type: 'entrance/fetch',
        payload: {
          module: key,
        }
      })
      dispatch({
        type: 'entrance/updateState',
        payload: {
          key,
        }
      })
    }
  
    render() {
        const {
            entrance: { list},
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
                inputType: col.dataIndex === 'image' ? 'upload' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: this.isEditing(record),
                dispatch,
                list,
                }),
            };
        });

      return (
        <Card bordered={false}>
          <Tabs  onChange={this.onChangeTab} type="card">
            <TabPane tab="设计专区" key="index-entrance-design">

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
            <TabPane tab="现货专区" key="index-entrance-spot">
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
            <TabPane tab="定制专区" key="index-entrance-customized">
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
  