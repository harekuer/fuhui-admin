import { Table, Card, Alert, Input, InputNumber, Form, Popconfirm, Button,Radio, } from 'antd';
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SingleUpload from '@/components/SinglePicture/SingleUpload.js';
import SinglePicture from '@/components/SinglePicture/SinglePicture.js';
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
      connectDropTarget(<tr {...restProps} className={className} style={style} />)
    );
  }
}

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = (record, setFieldsValue) => {
    if (this.props.inputType === 'upload') {
      return (
        <SingleUpload
          limit={1}
          file={record.image}
          isEdit={true}
          action={`/_os/index.php?com=common&t=imageUpload&module=index-banner-top`}
          changeImage={fileList => {
            const { dispatch } = this.props;
            let newData = this.props.record;
            let newList = this.props.list;
            let images = [];

            if (fileList.length) {
              images = fileList.map(item => {
                return item.path;
              });
            }

            newList.map(item => {
              if (item.id === newData.id) {
                item.image = `//${fileList[0].url}`;
              }

              return item;
            });
            dispatch({
              type: 'banner/updateState',
              payload: {
                list: newList,
              },
            });
            setFieldsValue({
              image: images[0],
            });
          }}
        />
      );
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
          <Form.Item
            style={{
              margin: 0,
            }}
          >
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(this.getInput(record, setFieldsValue))}
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
    // to avoid expensive index banneres.

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

@connect(({ banner, loading }) => ({
  banner,
  loading: loading.models.banner,
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
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'banner图片',
        dataIndex: 'image',
        key: 'image',
        editable: true,
        render: (text, record) => {
          return <SinglePicture limit={1} fileList={[text]} showRemove={false} />
        },
      },
      {
        title: 'banner链接',
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
                    style={{
                      marginRight: 8,
                    }}
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
              <a
                disabled={editingKey !== ''}
                onClick={() => this.edit(record.id)}
                style={{
                  marginRight: 8,
                }}
              >
                编辑
              </a>
              <a onClick={() => this.onDelete(record.id)}>删除</a>
            </span>
          );
        },
      },
    ];
  }

  componentDidMount() {
    const { dispatch, banner } = this.props;
    const { lang } = banner
    dispatch({
      type: 'banner/fetch',
      payload: {
        lang,
      }
    });
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
  };
  moveRow = (dragIndex, hoverIndex) => {
    const { dispatch, banner } = this.props;
    let { list } = banner;
    const dragRow = list[dragIndex];
    list = update(list, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    });
    dispatch({
      type: 'banner/updateState',
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

      const { dispatch, banner } = this.props;
      let { list,lang } = banner;
      const newData = list;
      const index = newData.findIndex(item => key === item.id);

      if (index > -1) {
        let relPath = ''
        if(row.iamge !== ''){
          const path = row.image.split('upload')
          const imgPath = path[path.length -1]
          relPath = `upload${imgPath}`
        }
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        dispatch({
          type: 'banner/update',
          payload: {
            id: key !== '0' ? key : undefined,
            image: relPath,
            url: row.url,
            lang,
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
    const { dispatch, banner } = this.props;
    let { lang } = banner;
    dispatch({
      type: 'banner/remove',
      payload: {
        id: key,
        lang,
      },
    });
  }

  onAdd = () => {
    const { dispatch, banner } = this.props;
    let { list,lang } = banner;
    let obj = {
      id: '0',
      image: '',
      url: '',
    };
    list.push(obj);
    dispatch({
      type: 'banner/queryList',
      payload: list,
    });
    this.setState({
      editingKey: '0',
    });
  };
  onSaveSort = () => {
    const { dispatch, banner } = this.props;
    let { list,lang } = banner;
    let sort = [];
    let id = [];
    list.forEach((item, index) => {
      sort.push({
        id: item.id,
        sort: index,
      });
    });
    dispatch({
      type: 'banner/updateSort',
      payload: {
        sort_array: sort,
        lang,
      },
    });
  };

  onChange = (e) => {
    const { dispatch} = this.props;
    const value = e.target.value
    this.setState({ editingKey: ''});
    dispatch({
      type: 'banner/fetch',
      payload: {
        lang:value,
      }
    })
    dispatch({
      type: 'banner/updateState',
      payload: {
        lang: value,
      }
    })
  }

  render() {
    const {
      banner: { list },
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
          list,
          dispatch,
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
        <Alert message="*备注：顶部banner最多可添加5个" type="error" style={{marginBottom: '15px'}}/>
        <EditableContext.Provider value={this.props.form}>
          <DndProvider backend={HTML5Backend} context={window}>
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
        <div className={styles.btnWrap}>
          <Button onClick={this.onSaveSort}>保存排序</Button>
        </div>
      </Card>
    );
  }
}

export default Form.create()(TableList);
