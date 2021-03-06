import React, { Component, PropTypes } from 'react';
//import SortableTree, { toggleExpandedForAll } from 'react-sortable-tree';
import SortableTree, { toggleExpandedForAll }  from 'react-sortable-tree/dist/index.cjs.js';
import {  Modal, Button} from 'antd'
import 'react-sortable-tree/style.css';
import styles from './SortList.less'

const confirm = Modal.confirm

export default class SortList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: props.data,
      expendedKeys:props.ids,
      expendAll: true,
    };
  }

  showDeleteConfirm = (node) => {
    const { onDeleteItem } = this.props;
    confirm({
      title: '确定删除该分类吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        onDeleteItem(node.categories_id)
      },
    });
  }

  expand(expanded) {
    const { treeData } = this.state
    const { ids } = this.props
    let levelIds = []
    if(expanded === false){
      treeData.forEach(item => {
        levelIds.push(item.categories_id)
      })
    } else {
      levelIds = ids
    }
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
      expendedKeys: levelIds,
      expendAll: expanded
    });
  }

  expandAll() {
    let { expendAll } = this.state
    this.expand(!expendAll);
  }

  //数据添加nav_id数组
  changeTreeNode = (list, id, pid) => {
    if(list.length) {
      list.map((item, index) => {
        item.par_id = pid.concat(item.categories_id);
        item.nav_id = id.concat(index);
        item.sort = index;
        if(item.children) {
          this.changeTreeNode(item.children, item.nav_id, item.par_id)
        }
        return item
      })
    }
  }

  SaveAllNode = (data) => {
    let newData = data;
    this.changeTreeNode(newData, [], []);
    this.props.onSave(newData)
  }

  //expandedRowKeys数组
  treeExpandedKeys = (list, keys) => {
    if(list.length) {
      list.forEach((item, index) => {
        keys.push(item.categories_id);
        if(item.expanded && item.children) {
          this.treeExpandedKeys(item.children, keys)
        }
      })
    }
    return keys
  }


  render() {
    const getNodeKey = ({ treeIndex }) => treeIndex;
    const { expendedKeys,expendAll } = this.state;
    const {  toEditPage, addItem } = this.props;
    return (
      <div>
        <div className={styles.addBtnLeft}>
          <div>
            <Button size="large" type="primary" onClick={() => addItem()} className="margin-right" >新增类目</Button>
            <Button size="large" type="ghost" onClick={() => this.expandAll()}>{expendAll? '收起': '展开'}全部</Button>
          </div>
          <div>
            <Button size="large"  onClick={() => this.SaveAllNode(this.state.treeData)}>保存</Button>
            {/* <Button size="large" type="primary" style={{marginLeft:'15px'}}>{Intl.get('attr-href-oa')}</Button> */}
          </div>
        </div>
        <div className={styles.table_th}>
          <ul className={styles.title}>
            <li style={{ width: '8%' }}>分类id</li>
            <li style={{ width: '92%', textAlign: 'left', paddingLeft: '90px' }}>分类</li>
          </ul>
          <ul className={styles.title_fr}>
            <li>操作</li>
          </ul>
        </div>
        <div style={{height: expendedKeys.length*63+'px'}}>
          <ul className={styles.list_id}>
            {
              expendedKeys.map(item => {
                return (
                  <li key={item}>{item}</li>
                )
              })
            }
          </ul>
          <div className={styles.list_tree}>
            <SortableTree
              treeData={this.state.treeData}
              //canDrag={false}   // 禁止拖动
              onChange={treeData => {
                const ids = this.treeExpandedKeys(treeData, [])
                this.setState({
                  treeData: treeData,
                  expendedKeys:ids,
                })
              }}
              generateNodeProps={({ node, path }) => ({
                title: (
                  <div className={styles.line}>
                    <div style={{ width: '100%', textAlign: 'left' }}>{node.categories_name}<a href={node.url} target="_blank"> [预览]</a></div>
                  </div>
                ),
                buttons: [
                  <div>
                    <div className="operate">
                      <a  onClick={() => toEditPage(node.categories_id)}>编辑</a> &nbsp;&nbsp;
                      <a onClick={() => this.showDeleteConfirm(node)}>删除</a>
                    </div>
                  </div>
                ],
              })}
            />
          </div>
        </div>
      </div>
    );
  }
}
