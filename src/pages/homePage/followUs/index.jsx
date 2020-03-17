  import { Table, Card,Alert,Input, InputNumber, Form ,Popconfirm, Button,Radio } from 'antd';
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
    // to avoid expensive index followUses.
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
@connect(({ followUs, loading }) => ({
    followUs,
    loading: loading.models.followUs,
}))

class TableList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            data: props.list,
            editingKey: '' 
        };
        this.columns = [
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: '名称',
              dataIndex: 'title',
              key: 'title',
              editable: true,
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
          type: 'followUs/fetch',
          payload: {
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
      const { dispatch, followUs} = this.props;
      let { list } = followUs;
      const dragRow = list[dragIndex];
      list = update(list, {$splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]})
      dispatch({
        type: 'followUs/updateState',
        payload: {
            list,
        },
      })
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
            const { dispatch, followUs} = this.props;
            let { list,lang } = followUs;
            const newData = list;
            const index = newData.findIndex(item => key === item.id);
            
            if (index > -1) {
              const item = newData[index];
              newData.splice(index, 1, { ...item, ...row });
                dispatch({
                    type: 'followUs/update',
                    payload: {
                        id: key !== '0'? key : undefined,
                        title: row.title,
                        url: row.url,
                        lang,
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
    onDelete(key) {
      const { dispatch, followUs} = this.props;
      let { lang } = followUs;
      dispatch({
          type: 'followUs/remove',
          payload: {
              id: key,
              lang,
          }
      })
    }

    onAdd = () => {
        const { dispatch, followUs} = this.props;
        let {list } = followUs;
        let obj ={
            id: '0',
            title: ''
        }
        list.push(obj)
        dispatch({
            type: 'followUs/queryList',
            payload: list
        })
        this.setState({ editingKey: '0'});
    }

    onSaveSort = () => {
        const { dispatch, followUs} = this.props;
        let { list,lang } = followUs;
        let sort= []
        let id = []
        list.forEach((item,index) => {
            sort.push({id:item.id,sort:index})
        })
        dispatch({
            type: 'followUs/updateSort',
            payload: {
              sort_array: sort,
              lang,
            }
        })
    }

    onChange = (e) =>{
      const { dispatch } = this.props;
      const value = e.target.value
      dispatch({
        type: 'followUs/fetch',
        payload: {
          lang: value,
        }
      })
      dispatch({
        type: 'followUs/updateState',
        payload: {
          lang: value,
        }
      })
    }
  
    render() {
        const {
            followUs: { list},
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
            {/* <Alert style={{marginBottom: '15px'}} message="*备注：搜索推荐词最多可设置10个，页面外显最多6个。" type="error" /> */}
            <Radio.Group onChange={this.onChange} defaultValue="en" style={{marginBottom: '15px'}}>
              <Radio.Button value="en">EN</Radio.Button>
              <Radio.Button value="es">ES</Radio.Button>
              <Radio.Button value="zh">ZH</Radio.Button>
            </Radio.Group>
            <EditableContext.Provider value={this.props.form}>
                <DndProvider backend={HTML5Backend} context={window}>
                <Table
                    columns={columns}
                    bordered
                    dataSource={list}
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
            {
                list.length < 10 ? 
                <div style={{width: '100%',marginTop: '10px'}}><Button onClick={this.onAdd} disabled={this.state.editingKey !== ''} block>+新增</Button></div>
                 : null
            }
            <div className={styles.btnWrap}>
                <Button onClick={this.onSaveSort}>保存排序</Button>
            </div>
        </Card>
      );
    }
  }

  
  export default Form.create()(TableList);
  