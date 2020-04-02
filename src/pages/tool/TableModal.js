import { Table, Input, InputNumber, Popconfirm, Form } from 'antd';
import isEqual from 'lodash.isequal';

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
            })(this.getInput())}
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

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: props.listData, editingKey: '' };
    this.column = [
      {
        title: '账户ID',
        dataIndex: 'account_id',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        editable: true,
      },
      {
        title: '密码',
        dataIndex: 'password',
        editable: true,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    onClick={() => this.save(form, record.account_id)}
                    style={{ marginRight: 8 }}
                  >
                    保存
                  </a>
                )}
              </EditableContext.Consumer>
              <a onClick={() => this.cancel(record.account_id)}>取消</a>
            </span>
          ) : (
            <div>
              <a disabled={editingKey !== ''} onClick={() => this.edit(record.account_id)} style={{ marginRight: 8,}}>
                编辑
              </a>
              <Popconfirm title="确定删除该子账号?" onConfirm={() => this.onDelete(record.account_id)}>
                <a>删除</a>
              </Popconfirm>
            </div>
            
          );
        },
      },
    ]
  }

  static getDerivedStateFromProps(nextProps, preState) {
    if (isEqual(nextProps.listData, preState.data)) {
      return null;
    }

    return {
      data: nextProps.listData,
    };
  }


  isEditing = record => record.account_id === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  onDelete(key) {
    const { dispatch } = this.props;
    let obj = {
      account_id: key,
    }
    this.promiseSave(obj,'tool/deleteAccount').then((result) => {
      if(result === 200){
        let newData = [...this.state.data];
        this.setState({ data: newData, editingKey: '' });
      }
    })
    dispatch({
      type: 'tool/deleteAccount',
      payload: {
        account_id: key,
      },
    });
  }

  promiseSave = (obj,action) => {
    const { dispatch } = this.props;
    return new Promise((resolve) => {
      dispatch({
        type: action,
        payload: {
          saveData: {
            ...obj,
          },
          resolve,
        },
      })
    })
  }

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.account_id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        let obj = {
          account_id: this.state.editingKey,
          email: row.email,
          password: row.password,
        }
        this.promiseSave(obj,'tool/saveAccount').then((result) => {
          if(result === 200){
            this.setState({ data: newData, editingKey: '' });
          }
        })
      }
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  render() {
    const components = {
      body: {
        cell: EditableCell,
      },
    };


    const columns = this.column.map(col => {
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
      <EditableContext.Provider value={this.props.form}>
        <Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
          rowKey={(record, index) => index}
          pagination={{
            onChange: this.cancel,
          }}
        />
      </EditableContext.Provider>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);

export default EditableFormTable