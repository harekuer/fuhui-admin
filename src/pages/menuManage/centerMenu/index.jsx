
import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'dva'
import EditModal from '../components/editModal'
import AddModal from '../components/addModal'
import SortableTreeList from '../components/SortableTreeList'
import { Button,Spin, Alert } from 'antd'


class CenterMenu extends Component {

  constructor() {
    super()

    this.state = {
      parentId: 0,
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'centerMenu/query',
    });
  }

  render() {
    const _this = this

    const { loading, dispatch, centerMenu, } = this.props,
    queryLoading = loading.effects['centerMenu/query']      // 加载状态
    const { app_id } = centerMenu

    const {
      menuList,
      menuInfo,
      addInfo,
      editModalVisible,
      addModalVisible,
      expendIds
    } = centerMenu

    // 菜单列表props
    const sortableTreeListProps = {
      dispatch,
      menuList,
      handleChangeEditVisible: function (id, state) {
        // 打开弹窗
        onChangeVisible({ editModalVisible: state })
        console.log(id)
        // 获取菜单详情
        dispatch({
          type: 'centerMenu/getMenuInfo',
          payload: {
            menu_id: id,
            type: 1,
          }
        })

      },
      handleChangeAddVisible: function (id, state) {
        // 新增菜单
        onChangeVisible({ addModalVisible: state })

        _this.setState({
          parentId: id
        })
      },
      handleDel: function (id) {
        // 删除
        dispatch({
          type: 'centerMenu/deleteMenu',
          payload: {
            menu_id: id
          }
        })
      },
      handeExpend: function (n) {
        // 获取节点id
        let menu_id = n.node.menu_id;

        // 如果是展开，则添加到集合
        // 如果是折叠，则删除集合的该元素
        if (n.expanded === true) {
          expendIds.push(menu_id)
        } else {
          let index = expendIds.indexOf(menu_id)
          expendIds.splice(index, 1)
        }

        // 更新到modal
        dispatch({
          type: 'centerMenu/updateState',
          payload: {
            expendIds: expendIds
          }
        })
      },
      handleChangeValues:function(treeData){
        // 树节点值的变动
        dispatch({
          type: 'centerMenu/updateState',
          payload: {
            menuList: treeData
          }
        })
      }
    }

    // 编辑菜单props
    const editProps = {
      editModalVisible,
      menuInfo,
      isCenter: true, //是否中心后台菜单
      infoLoading: loading.effects['centerMenu/getMenuInfo'],
      saveLoading: loading.effects['centerMenu/editMenu'],
      handleCancel: function (params) {
        onChangeVisible({ editModalVisible: params })
      },
      handleSaveMenu: function (params) {
        // 保存菜单
        dispatch({
          type: 'centerMenu/editMenu',
          payload: { ...params,app_id, }
        })
      }
    }

    // 新增菜单props
    const addProps = {
      addModalVisible,
      addInfo,
      isCenter: true, //是否中心后台菜单
      parentId: _this.state.parentId,
      saveLoading: loading.effects['centerMenu/addMenu'],
      handleCancel: function (params) {
        onChangeVisible({ addModalVisible: params })
      },
      handleAddMenu: function (params) {

        dispatch({
          type: 'centerMenu/addMenu',
          payload: {
            ...params,
            app_id,
          }
        })
      }
    }


    /**
     * 打开/关闭弹窗
     * @param {object} params
     */
    const onChangeVisible = (params) => {
      // 清空新增modal
      dispatch({
        type: 'centerMenu/updateState',
        payload: {
          addInfo: {
            parent_id: 0,
            menu_name: null,
            route: null,
            sort: 0,
            icons: null,
          },
        }
      })

      // 重新赋值
      dispatch({
        type: 'centerMenu/updateState',
        payload: {
          ...params
        }
      })
    }


    return (
      <div className="content-inner" >
        <Spin tip="Loading..." spinning={queryLoading} style={{marginTop:50,width:'100%'}}>
          {
            menuList.length > 0?
            <div>
              <Button type="primary" onClick={() => {
                this.setState({ parentId: 0 })
                onChangeVisible({ addModalVisible: true })
              }}>添加一级菜单</Button>

              <SortableTreeList {...sortableTreeListProps} />
            </div>
            :null
          }
        </Spin>

        <EditModal {...editProps} />
        <AddModal {...addProps} />
      </div>
    );
  }
}



CenterMenu.propTypes = {
  menuList: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default connect(({ centerMenu, loading, app }) => ({ centerMenu, loading, app }))(CenterMenu)
