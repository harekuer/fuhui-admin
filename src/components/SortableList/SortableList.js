import React, { PropTypes } from 'react'
import { Icon } from 'antd'
import SortableGridItem from './SortableGridItem'
import Gallery from './LightBox'
import styles from './SortableList.less'

export default class SortableList extends React.Component {
  /**
   * 图片拖拽组件
   * @type {{onCopyLink: (复制图片链接),onSaveState: (保存修改后的数据), data: (原始图片列表)}}
   */

  // static propTypes = {
  //   onSaveState: PropTypes.func.isRequired,
  // };

  constructor (props) {
    super(props)
    this.state = {
      draggingIndex: null, // 当前拖拽id
      data: props.data, // 图片列表
      currentImage: 0, // 当前图片顺序
      lightboxIsOpen: false, // 预览弹窗是否显示
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.data.length > prevState.data.length){
      return {
        data: nextProps.data
      }
    } else {
      return null
    }
  }

  // 拖拽后即时更新图片列表
  updateState = (items) => {
    this.setState(items)
    this.props.onSaveState(items)
  };

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
    const { data, lightboxIsOpen, currentImage } = this.state
    let images = []
    // 判断是否包含大图路径，如大图路径缺失则显示缩略图
    data.forEach((item) => {
      images.push({ src: item.image_url })
    })
    console.log(images)
    let listItems = data.map(function (item, i) {
      return (
        <SortableGridItem
          key={i}
          onSortItems={this.updateState}
          items={data}
          sortId={i}
          outline="list"
        >
          <div className={styles.topImg}>
            <img src={item.image_url} />
            <span className={styles.flag_icon} />
            <div className={styles.operIcon}>
              <Icon type="eye-o" onClick={() => this.onLightboxShow(i)} />
              <Icon type="delete" onClick={() => this.onDeleteItem(i)} />
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
