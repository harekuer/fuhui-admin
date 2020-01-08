
  import { Table, Card,Alert,Input, InputNumber, Form ,Popconfirm, Button, Tabs } from 'antd';
  import React from 'react';
  import { connect } from 'dva';
  import { DndProvider, DragSource, DropTarget } from 'react-dnd';
  import HTML5Backend from 'react-dnd-html5-backend';
  import update from 'immutability-helper';
  import SingleUpload from '@/components/SinglePicture/SingleUpload.js';
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
  getInput = (record, setFieldsValue) => {
    if (this.props.inputType === 'upload') {
      return <SingleUpload
        limit={1}
        file={record.value}
        isEdit={true}
        changeImage={(fileList) => {
          const { dispatch } = this.props
          let newData = this.props.record
          let newList = this.props.list
          let images = []
          if (fileList.length) {
            images = fileList.map((item) => {
              return item.path
            })
          }
          newList.map(item => {
            if(item.id === newData.id){
              item.image = `//:${fileList[0].url}`
            }
            return item
          })
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
@connect(({ cashsale, loading }) => ({
    cashsale,
    loading: loading.models.cashsale,
}))
class TableList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            editingKey: '' 
        };
      }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
          type: 'cashsale/fetch',
          payload: {
            module: 'index-spot-image',
          }
        });
    }
  
    components = {
      body: {
        row: DragableBodyRow,
      },
    };
  
    moveRow = (dragIndex, hoverIndex) => {
      const { dispatch, cashsale} = this.props;
      let { list } = cashsale;
      const dragRow = list[dragIndex];
      list = update(list, {$splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]})
      dispatch({
        type: 'cashsale/updateState',
        payload: {
            list,
        },
      })
    };


    columnList = () => {
      const { cashsale } = this.props
      const { key } = cashsale
      let column = [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
        },
        {
          title: '图片',
          dataIndex: 'image',
          key: 'image',
          editable: true,
          render: (text, record) => {
            return <SingleUpload limit={1} file={text} isEdit={false} />;
          },
        },
        {
          title: '链接',
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
      if(key === 'index-spot-cate'){
        let obj = {
          title: '分类',
          dataIndex: 'title',
          key: 'title',
          editable: true,
        }
        column.splice(2, 0, obj);
      }
      return column
    }

    isEditing = record => record.id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, currentKey) {
        form.validateFields((error, row) => {
            if (error) {
              return;
            }
            const { dispatch, cashsale} = this.props;
            let { list,key } = cashsale;
            const newData = list;
            const index = newData.findIndex(item => currentKey === item.id);
            
            if (index > -1) {
              const item = newData[index];
              newData.splice(index, 1, { ...item, ...row });
                dispatch({
                    type: 'cashsale/update',
                    payload: {
                        module: key,
                        id: currentKey !== '0'? currentKey : undefined,
                        image: row.image,
                        url: row.url,
                        title: key === 'index-spot-cate'? row.title : undefined,
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
        const { dispatch, cashsale} = this.props;
        let {list, key } = cashsale;
        let obj ={
            id: '0',
            title: ''
        }
        list.push(obj)
        dispatch({
            type: 'cashsale/queryList',
            payload: list,
        })
        this.setState({ editingKey: '0'});
    }

    onSaveSort = () => {
      const { dispatch, cashsale} = this.props;
      let { list,key } = cashsale;
      let sort= []
      list.forEach((item,index) => {
          sort.push({id:item.id,sort:index})
      })
      dispatch({
          type: 'cashsale/updateSort',
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
        type: 'cashsale/fetch',
        payload: {
          module: key,
        }
      })
      dispatch({
        type: 'cashsale/updateState',
        payload: {
          key,
        }
      })
    }
  
    render() {
        const {
            cashsale: { list, key},
            loading,
            dispatch,
        } = this.props;
        console.log('key',key)
        const components = {
            body: {
              cell: EditableCell,
              row: DragableBodyRow,
            },
          };
        
        const columns = this.columnList().map(col => {
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
            <TabPane tab="侧边大图" key="index-customized-image">

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
                  list.length < 1 ? 
                  <div style={{width: '100%',marginTop: '10px'}}><Button onClick={this.onAdd} disabled={this.state.editingKey !== ''} block>+新增</Button></div>
                  : null
              }
            </TabPane>
            <TabPane tab="右侧分类" key="index-customized-cate">
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
                  list.length < 16? 
                  <div style={{width: '100%',marginTop: '10px'}}><Button onClick={this.onAdd} disabled={this.state.editingKey !== ''} block>+新增</Button></div>
                  : null
              }
            </TabPane>
          </Tabs>
          {
            key === 'index-customized-cate'? 
            <div className={styles.btnWrap}>
              <Button onClick={this.onSaveSort}>保存排序</Button>
          </div> : null
          }
        </Card>
      );
    }
  }

  
  export default Form.create()(TableList);
  