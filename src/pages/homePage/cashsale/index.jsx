
  import { Table, Card,Alert,Input, Radio, Form ,Popconfirm, Button, Tabs } from 'antd';
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
      if(record.module === 'index-spot-cate'){
        return <SingleUpload
        limit={2}
        file={record.image == '' ? [] : record.image.split(',')}
        isEdit={true}
        action={`/_os/index.php?com=common&t=imageUpload&module=${record.module}`}
        changeImage={(fileList) => {
          const { dispatch } = this.props
          let newData = this.props.record
          let newList = this.props.list
          let images = []
          let allPath = []
          if (fileList.length) {
            images = fileList.map((item) => {
              return item.path? item.path : item.url
            })
            allPath = fileList.map((item) => {
              return item.url
            })
          }
          newList.map(item => {
            if(item.id === newData.id){
              item.image = allPath.join(',')
            }
            return item
          })
          dispatch({
            type: 'cashsale/updateState',
            payload: {
                list:newList,
            },
          })
          setFieldsValue({image: allPath.join(',')})
        }}
      />;
      }else {
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
          }
          newList.map(item => {
            if(item.id === newData.id){
              item.image = fileList.length ?fileList[0].url : ''
            }
            return item
          })
          dispatch({
            type: 'cashsale/updateState',
            payload: {
                list:newList,
            },
          })
          setFieldsValue({image:images[0]})
        }}
      />;
      }
      
    }
    return <Input onDragStart={e => { e.stopPropagation();e.preventDefault(); }} draggable className="contenteditable-element"/>;
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
                  required: dataIndex === 'title' || dataIndex === 'content'? false : true,
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
            lang: 'en'
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
            if(record.module === 'index-spot-cate') {
              var images = text.split(',')
              return (
                <div>
                  {
                    images.map((item,index) => {
                      return <SinglePicture key={index} limit={1} fileList={[item]} showRemove={false} />
                    })
                  }
                </div>
              )
            } else {
              return <SinglePicture limit={1} fileList={[text]} showRemove={false} />
            }
          },
        },
        {
          title: '链接',
          dataIndex: 'url',
          key: 'url',
          editable: true,
        },
        {
          title: key === 'index-customized-cate'? '分类': '标题',
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
      if(key === 'index-spot-image'){
        let obj = {
          title: '副标题',
          dataIndex: 'content',
          key: 'content',
          editable: true,
        }
        column.splice(4, 0, obj);
      }
      return column
    }

    isEditing = record => record.id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    onDelete(key) {
      const { dispatch, cashsale } = this.props;
      const module = cashsale.key
      let { lang } = cashsale;
      dispatch({
        type: 'cashsale/remove',
        payload: {
          id: key,
          module,
          lang,
        },
      });
    }

    save(form, currentKey) {
        form.validateFields((error, row) => {
            if (error) {
              return;
            }
            const { dispatch, cashsale} = this.props;
            let { list,key,lang } = cashsale;
            const newData = list;
            const index = newData.findIndex(item => currentKey === item.id);
            if (index > -1) {
              let images = row.image
              let imgArr = images.split(',')
              let relPath = []
              relPath = imgArr.map(item=>{
                const path = item.split('upload')
                const imgPath = path[path.length -1]
                return `upload${imgPath}`
              })
              const item = newData[index];
              newData.splice(index, 1, { ...item, ...row });
                dispatch({
                    type: 'cashsale/update',
                    payload: {
                        module: key,
                        lang,
                        id: currentKey !== '0'? currentKey : undefined,
                        image: relPath.join(','),
                        url: row.url,
                        title: row.title,
                        content: key === 'index-spot-image'? row.content : undefined,
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
            title: '',
            module: key,
            content: '',
            image: '',
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
      let { list,key,lang } = cashsale;
      let sort= []
      list.forEach((item,index) => {
          sort.push({id:item.id,sort:index})
      })
      dispatch({
          type: 'cashsale/updateSort',
          payload: {
            module: key,
            sort_array: sort,
            lang,
          }
      })
  }

    onChangeTab = (key) => {
      const { dispatch, cashsale} = this.props;
      let { lang} = cashsale;
      this.setState({ editingKey: ''});
      dispatch({
        type: 'cashsale/fetch',
        payload: {
          module: key,
          lang,
        }
      })
      dispatch({
        type: 'cashsale/updateState',
        payload: {
          key,
        }
      })
    }

    onChange = (e) =>{
      const { dispatch, cashsale} = this.props;
      let { key } = cashsale;
      const value = e.target.value
      dispatch({
        type: 'cashsale/fetch',
        payload: {
          module: key,
          lang: value,
        }
      })
      dispatch({
        type: 'cashsale/updateState',
        payload: {
          lang: value,
        }
      })
    }
  
    render() {
        const {
            cashsale: { list, key},
            loading,
            dispatch,
        } = this.props;
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
          <Radio.Group onChange={this.onChange} defaultValue="en" style={{marginBottom: '15px'}}>
            <Radio.Button value="en">EN</Radio.Button>
            <Radio.Button value="es">ES</Radio.Button>
            <Radio.Button value="zh">ZH</Radio.Button>
          </Radio.Group>
          <Tabs  onChange={this.onChangeTab} type="card">
            <TabPane tab="侧边大图" key="index-spot-image">

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
            <TabPane tab="右侧分类" key="index-spot-cate">
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
          {
            key === 'index-spot-cate'? 
            <div className={styles.btnWrap}>
              <Button onClick={this.onSaveSort}>保存排序</Button>
          </div> : null
          }
        </Card>
      );
    }
  }

  
  export default Form.create()(TableList);
  