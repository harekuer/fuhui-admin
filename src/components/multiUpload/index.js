import React from 'react'
import { Spin, Button } from 'antd'
import defaultSettings from '../../../config/defaultSettings';
import createScript from '../Ueditor/createScript'


const { allUrl, configUrl, langUrl } = defaultSettings 

class MultiUpload extends React.Component {
  /**
   * 多图片上传
   * @type {{name: (编辑器id,必须唯一不能重复),content: (内容区域赋值 html string), width: (宽度), height: (高度), disabled: (是否可编辑)}}
   */

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
    }
  }

  loadUE () {
    // 顺序很重要~按顺序引入UEditor文件
    createScript(configUrl, () => {
      createScript(allUrl, () => {
        createScript(langUrl, ::this.initUE)
      })
    })
  }


  initUE () {
    const baseURL = 'public/ueditor/' // 文件路径
    const { id, onUploadItem, products_id } = this.props
    // UE.delEditor('container');
    const self = this
    const ueEditor = UE.getEditor(id, {
      isShow: false,
      enableAutoSave: false,
      autoSyncData: false,
      autoFloatEnabled: false,
      wordCount: false,
      sourceEditor: null,
      scaleEnabled: true,
      iframeUrlMap: { insertimage: '~/dialogs/image/multiUpload.html' },
    })

    ueEditor.ready((ueditor) => {
      if (!ueditor) {
        UE.delEditor(id)
        self.initUE()
      }
      // 自定义额外参数
      ueEditor.execCommand('serverparam', {
        products_id,
      })
      // //设置编辑器不可用
      // ueEditor.setDisabled();
      // //隐藏编辑器，因为不会用到这个编辑器实例，所以要隐藏
      // ueEditor.hide();
      // 侦听图片上传
      ueEditor.addListener('beforeInsertImage', (t, arg) => {
        onUploadItem(arg)
      })
    })
  }

  componentDidMount () {
    if (!window.baidu || !baidu.editor) {
      this.loadUE()
      this.setState({ loading: true })
    } else {
      this.initUE()
    }
  }

  componentWillUnmount () {
    // 一定要写这一句
    // this.ue.destroy();
    UE.delEditor(this.props.id)
  }

  // 弹出图片上传的对话框
  upImage () {
    const { id } = this.props
    const ue = UE.getEditor(id)
    const myImage = ue.getDialog('insertimage')
    myImage.render()
    myImage.open()
  }

  render () {
    const { id, products_id } = this.props
    return (
      <div>
        <div style={{ lineHeight: 1, display: 'none' }}>
          <script id={id} name="content" type="text/plain" />
        </div>
        <Button type="primary" onClick={() => this.upImage()}>上传图片</Button>
      </div>
    )
  }
}

MultiUpload.defaultProps = {
  content: '',
  width: '100%',
  height: '350px',
  inModal: false,
}


export default MultiUpload
