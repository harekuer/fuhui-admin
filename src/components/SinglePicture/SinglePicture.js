import React, { PropTypes } from 'react'
import { Upload, Icon, Modal } from 'antd'
import styles from './SinglePicture.less'

export default class SinglePicture extends React.Component {
  /**
   * 图片预览组件
   * @type {{width: (大图弹窗大小),fileList: (图片列表), height: 图片限制最大高度, showRemove: (是否显示删除按钮), className: (特殊样式),onRemove: (删除事件回调),}}
   */

  static propTypes = {
    limit: PropTypes.number.isRequired,
    fileList: PropTypes.array.isRequired,
  };

  constructor (props, context) {
    super(props, context)
    this.state = {
      previewVisible: false, // 弹窗是否可见
      previewImage: '', // 大图路径
      fileList:[
        {
          uid: 0,
          url: props.fileList[0]
        }
      ]
    }
  }

  // 父组件重传props时就会调用这个方法
  componentWillReceiveProps (nextProps) {
    this.setState({ fileList: [{
      uid: 0,
      url: nextProps.fileList[0]
    }] })
  }

  // 点击按钮或蒙层关闭
  handleCancel = () => this.setState({ previewVisible: false })

  // 点击预览按钮，显示大图弹窗
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    })
  }

  render () {
    const { previewVisible, previewImage,fileList } = this.state
    const {  width, height, showRemove, editPage, className, onRemove } = this.props // 图片尺寸限制
    const file = []
    // 为组件添加唯一id,uid
    // if (fileList.length) {
    //   fileList.map((item, index) => {
    //     file.push({ uid: index, url: item })
    //   })
    // }
    // 上传图片按钮样式
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    )

    return (
      <div className="clearfix inline">
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          showUploadList={{ showRemoveIcon: showRemove, showPreviewIcon: true }}
          onRemove={onRemove}
          onChange={null}
          className={className || 'singlePic'}
        >
          {this.props.fileList.length >= this.props.limit ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel} width={width} style={{ textAlign: 'center' }}>
          <img alt="example" style={{ maxWidth: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
}
