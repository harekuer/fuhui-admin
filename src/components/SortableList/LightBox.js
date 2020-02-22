import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './SortableList.less'
import Lightbox from 'react-images'

export default class Gallery extends Component {
  static propTypes = {
    images: PropTypes.array, // 图片列表
  	showThumbnails: PropTypes.bool, // 是否显示缩略图
  	lightboxIsOpen: PropTypes.bool, // 是否显示预览弹框
    changeOpenState: PropTypes.func, // 修改预览状态
  };
  state = {
    lightboxIsOpen: this.props.lightboxIsOpen,
    currentImage: this.props.currentImage,
  };

  // 显示Lightbox图片预览弹窗
  openLightbox () {
    event.preventDefault()
    this.setState({
      currentImage: this.props.currentImage,
      lightboxIsOpen: true,
    })
  }

  // 关闭Lightbox图片预览弹窗
  closeLightbox () {
    this.setState({
      currentImage: 0,
      lightboxIsOpen: false,
    })
    this.props.changeOpenState(false)
  }

  // 浏览上一张
  gotoPrevious () {
    this.setState({
      currentImage: this.state.currentImage - 1, // currentImage数量减一
    })
  }
  // 浏览下一张
  gotoNext () {
    this.setState({
      currentImage: this.state.currentImage + 1,
    })
  }
  // 点击缩略图跳转至对应大图
  gotoImage (index) {
    this.setState({
      currentImage: index,
    })
  }
  handleClickImage () {
    if (this.state.currentImage === this.props.images.length - 1) return

    this.gotoNext()
  }
  render () {
    return (
      <div className="section">
        <Lightbox
          currentImage={this.state.currentImage}
          images={this.props.images}
          isOpen={this.state.lightboxIsOpen}
          onClickImage={this.handleClickImage.bind(this)}
          onClickNext={this.gotoNext.bind(this)}
          onClickPrev={this.gotoPrevious.bind(this)}
          onClickThumbnail={this.gotoImage.bind(this)}
          onClose={this.closeLightbox.bind(this)}
          showThumbnails={this.props.showThumbnails}
          theme={this.props.theme}
        />
      </div>
    )
  }
}
