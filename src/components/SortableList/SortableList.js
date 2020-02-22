import React, { PropTypes } from 'react'
import { Icon, Button, Radio } from 'antd'
import SortableGridItem from './SortableGridItem'
import Gallery from './LightBox'
import styles from './SortableList.less'

export default class SortableList extends React.Component {
  /**
   * 图片拖拽组件
   * @type {{onCopyLink: (复制图片链接),onSaveState: (保存修改后的数据), data: (原始图片列表)}}
   */

  static propTypes = {
    onCopyLink: PropTypes.func.isRequired,
    onSaveState: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props)
    this.state = {
      draggingIndex: null, // 当前拖拽id
      data: props.data, // 图片列表
      currentImage: 0, // 当前图片顺序
      lightboxIsOpen: false, // 预览弹窗是否显示
    }
  }

  // 拖拽后即时更新图片列表
  updateState = (obj) => {
    this.setState(obj)
    if (obj.items) {
      this.props.onSaveState(obj.items)
    }
  };

  // back单选
  onCheckChange = (index, e) => {
    const checked = e.target.checked
    let newData = this.state.data
    // 限制当前选中值为1，其余值君为0，模拟单选组效果
    newData = newData.map((item, i) => {
      if (index === i) {
        item.is_back = '1'
      } else {
        item.is_back = '0'
      }
      return item
    })
    this.setState({
      data: newData,
    })
  }

  // 图片删除
  onDeleteItem = (index) => {
    let newData = this.state.data
    newData.forEach((item, i) => {
      if (index === i) {
        newData.splice(index, 1)
      }
    })
    this.setState({
      data: newData,
    })
    this.props.onSaveState(newData)
  }

  // 点击显示预览弹框
  onLightboxShow = (index) => {
    this.setState({
      currentImage: index,
      lightboxIsOpen: true,
    })
  }
  changeOpenState = (value) => {
    this.setState({
      lightboxIsOpen: value,
    })
  }

  render () {
    const { draggingIndex, data, lightboxIsOpen, currentImage } = this.state
    const { onCopyLink } = this.props
    let childProps = { className: 'myClass1' }
    let images = []
    // 判断是否包含大图路径，如大图路径缺失则显示缩略图
    data.forEach((item) => {
      if (item.img_original && item.img_original.indexOf('http') > -1) {
        images.push({ src: item.img_original })
      } else {
        images.push({ src: item.img_thumb })
      }
    })
    let listItems = data.map(function (item, i) {
      return (
        <SortableGridItem
          key={i}
          updateState={this.updateState}
          items={data}
          draggingIndex={draggingIndex}
          sortId={i}
          outline="list"
          childProps={childProps}
        >
          <div className={styles.topImg}>
            <img src={item.img_thumb} />
            <span className={styles.flag_icon} />
            <div className={styles.operIcon}>
              <Icon type="eye-o" onClick={() => this.onLightboxShow(i)} />
              <Icon type="delete" onClick={() => this.onDeleteItem(i)} />
            </div>
          </div>
          <div className={styles.operate}>
            <div >
              <Button type="primary" ghost onClick={() => onCopyLink(item.img_original)}>Copy Link</Button>
            </div>
            <div className={styles.right}>
              <Radio checked={item.is_back === '1'} onChange={e => this.onCheckChange(i, e)}>Back</Radio>
            </div>
          </div>
        </SortableGridItem>
      )
    }, this)

    return (
      <div className="list">
        {listItems}
        {
          lightboxIsOpen ?
            <Gallery
              images={images}
              showThumbnails
              lightboxIsOpen={lightboxIsOpen}
              currentImage={currentImage}
              changeOpenState={this.changeOpenState}
            /> : ''
        }
      </div>
    )
  }
}
