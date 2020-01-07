
import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'dva'
import EditModal from '../components/editModal'
import AddModal from '../components/addModal'
import SortableTreeList from '../components/SortableTreeList'
import { Button, Spin, Alert } from 'antd'


class SiteMenu extends Component {

  constructor() {
    super()

    this.state = {
      parentId: 0
    }
  }

  render() {
    const _this = this

    const { loading, dispatch, siteMenu } = this.props,
      queryLoading = loading.effects['siteMenu/query']


    const {
      menuList,
      menuInfo,
      addInfo,
      editModalVisible,
      addModalVisible,
      expendIds
    } = siteMenu

    // 菜单列表props
    const sortableTreeListProps = {
      dispatch,
      menuList,
      loading: loading.effects['siteMenu/query'],// || loading.effects['siteMenu/deleteMenu'],
      handleChangeEditVisible: function (id, state) {
        // 打开弹窗
        onChangeVisible({ editModalVisible: state })

        // 获取菜单详情
        dispatch({
          type: 'siteMenu/getMenuInfo',
          payload: {
            menu_id: id
          }
        })

      },
      handleChangeAddVisible: function (id, state) {
        onChangeVisible({ addModalVisible: state })

        _this.setState({
          parentId: id
        })
      },
      handleDel: function (id) {
        // 删除
        dispatch({
          type: 'siteMenu/deleteMenu',
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
          type: 'siteMenu/updateState',
          payload: {
            expendIds: expendIds
          }
        })
      },
      handleChangeValues: function (treeData) {
        dispatch({
          type: 'siteMenu/updateState',
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
      isCenter: false, //是否中心后台菜单
      infoLoading: loading.effects['siteMenu/getMenuInfo'],
      saveLoading: loading.effects['siteMenu/editMenu'],
      handleCancel: function (params) {
        onChangeVisible({ editModalVisible: params })
      },
      handleSaveMenu: function (params) {
        // 保存菜单
        dispatch({
          type: 'siteMenu/editMenu',
          payload: { ...params }
        })
      }
    }

    // 新增菜单props
    const addProps = {
      addModalVisible,
      addInfo,
      isCenter: false, //是否中心后台菜单
      parentId: _this.state.parentId,
      saveLoading: loading.effects['siteMenu/addMenu'],
      handleCancel: function (params) {
        onChangeVisible({ addModalVisible: params })
      },
      handleAddMenu: function (params) {

        dispatch({
          type: 'siteMenu/addMenu',
          payload: {
            ...params
          }
        })
      }
    }


    /**
     * 打开/关闭弹窗
     * @param {object} params
     */
    const onChangeVisible = (params) => {
      dispatch({
        type: 'siteMenu/updateState',
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

      dispatch({
        type: 'siteMenu/updateState',
        payload: {
          ...params
        }
      })
    }


    return (
      <div className="content-inner" >
        <Alert
          message="Warning"
          description="该菜单仅限开发人员进行操作，请谨慎操作删除功能."
          type="warning"
          style={{marginBottom: '15px'}}
          showIcon
        />
        <Spin tip="Loading..." spinning={queryLoading} style={{marginTop:50,width:'100%'}}>
          {
            menuList.length > 0 ?
              <div>
                <Button type="primary" onClick={() => {
                  this.setState({ parentId: 0 })
                  onChangeVisible({ addModalVisible: true })
                }}>添加一级菜单</Button>

                <SortableTreeList {...sortableTreeListProps} />
              </div>
              : null
          }

        </Spin>

        <EditModal {...editProps} />
        <AddModal {...addProps} />
      </div>
    );
  }
}



SiteMenu.propTypes = {
  menuList: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default connect(({ siteMenu, loading, app }) => ({ siteMenu, loading, app }))(SiteMenu)
