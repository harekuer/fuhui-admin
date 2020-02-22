import React from 'react'
import PropTypes from 'prop-types'
import { Table, Modal} from 'antd'
import { tableConfig, makeTooltip } from './autoConfig'
import copy from 'copy-to-clipboard'
import { Success } from '@/utils/warn'

const confirm = Modal.confirm

const List = ({ listData, column, onOperateItem, location, dispatch,langIndex, statusLoading, ...tableProps }) => {
  const { query } = location
  const onView = (record) => {
    let win = window.open(record.view_url, '_blank')
    win.focus()
  }


  const onCopyLink = (url) => {
    copy(url)
    Success('Copy success')
  }

  const onShowModal =(record, item) => {
    let obj = {}
    let currentItem = {}
    item.query.forEach((option) => {
      obj[option] = record[option]
    })
    if(item.url){
      dispatch({
        type: 'tool/getDetail',
        payload: {
          data: {
            ...obj,
          },
          url: item.url
        }
      });
    }else {
      currentItem = record
    }
    if(item.configUrl){
      dispatch({
        type: 'tool/editConfig',
        payload: {
          data: {},
          url: item.configUrl
        }
      });
    }
    
    // modal显示
    dispatch({
      type: 'tool/updateState',
      payload: {
        modalVisible: true,
        currentItem,
      }
    })
    
  }


  const columnList = () => {
    let columns = []
    column.forEach((item) => {
      let obj = {}
      if(item.hasTooltips){
        obj.title = makeTooltip(item.title, item.tips);
      }else{
        obj.title = item.title
      }
      
      obj.dataIndex = item.key
      obj.key = item.key
      if (item.width) {
        obj.width = 220
      }
      if (item.render) {
        if (item.render === 'modal') {
          obj.render = tableConfig(item, onShowModal)
        } else if(item.render === 'switch'){
            obj.render = tableConfig(item, onChangeStatus, langIndex, null, statusLoading);
            obj.width = 80;
        } else {
          obj.render = tableConfig(item, onShowModal)
        }
      }
      columns.push(obj)
    })
    return columns
  }


  return (
    <div>
      <Table
        bordered
        scroll={{ x: 1450 }}
        {...tableProps}
        columns={columnList()}
        rowKey={(record, index) => index}
      />
    </div>
  )
}

List.propTypes = {
  listData: PropTypes.array,
  location: PropTypes.object,
}

export default List
