import React from 'react'
import PropTypes from 'prop-types'
import { Table, Modal} from 'antd'
import { tableConfig, makeTooltip } from './autoConfig'
import copy from 'copy-to-clipboard'
import { Success } from '@/utils/warn'

const confirm = Modal.confirm

const List = ({ listData, column, onOperateItem, location, langIndex, statusLoading, ...tableProps }) => {
  const { query } = location
  const onView = (record) => {
    let win = window.open(record.view_url, '_blank')
    win.focus()
  }


  const onCopyLink = (url) => {
    copy(url)
    Success('Copy success')
  }


  const columnList = () => {
    let columns = []
    column.forEach((item) => {
      let obj = {}
      if(item.hasTooltips){
        obj.title = makeTooltip(item.title[langIndex], item.tips);
      }else{
        obj.title = item.title[langIndex]
      }
      
      obj.dataIndex = item.key
      obj.key = item.key
      if (item.width) {
        obj.width = 220
      }
      if (item.render) {
        if (item.render === 'popover') {
          obj.render = tableConfig(item, onShowModal, langIndex)
        } else if(item.render === 'switch'){
            obj.render = tableConfig(item, onChangeStatus, langIndex, null, statusLoading);
            obj.width = 80;
        } else {
          obj.render = tableConfig(item, onOperateItem, langIndex, onCopyLink)
        }
      }
      columns.push(obj)
    })
    return columns
  }


  return (
    <div>
      <Table
        {...tableProps}
        bordered
        scroll={{ x: 1450 }}
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
