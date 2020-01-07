
import React, { Component } from 'react';
import PropTypes from 'prop-types'
import SortableTree from 'react-sortable-tree';
import styles from './index.less'
import { Icon, Spin, Popconfirm } from 'antd';


class SortableTreeList extends Component {

  render() {
    const {
      dispatch,
      menuList,
      handleChangeEditVisible,
      handleChangeAddVisible,
      handleDel,
      handeExpend,
      handleChangeValues,
    } = this.props

    return (

      <div className={styles.treeWrap}>

        <SortableTree
          canDrag={false}   // 禁止拖动
          treeData={menuList && menuList !== undefined ? menuList : []}
          onChange={
            (treeData)=>handleChangeValues(treeData)
          }
          onVisibilityToggle={(node) => {
            handeExpend(node)
          }}
          generateNodeProps={({ node, path }) => ({
            title: (
              <div className={styles.line}>
                <Icon type={node.icon} className={styles.icon} />
                <label className={styles.name}>{node.name_zh}</label>
                <div className={styles.opt}>
                  <a onClick={() => handleChangeAddVisible(node.menu_id, true)}>添加子菜单</a>
                  <a  onClick={() => handleChangeEditVisible(node.menu_id, true)}>编辑</a>
                  {
                    node.name_zh === '菜单管理' || node.name_zh === '平台菜单' || node.name_zh === '店铺菜单' ? "" : <Popconfirm
                    title="确定删除吗"
                    onConfirm={() => handleDel(node.menu_id)}
                    okText="确定"
                    cancelText="取消">
                    <a >删除</a>
                  </Popconfirm>
                  }
                </div>
              </div>
            )
          })
          }
        />
      </div>
    );
  }
}

export default SortableTreeList;
