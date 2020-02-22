import React from 'react'
import { Spin } from 'antd'
import { config } from 'utils'
import createScript from './createScript'

const { allUrl, configUrl, langUrl } = config

class UEditor extends React.Component {
  /**
   * 富文本编辑器
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
    const id = this.props.name
    const { disabled, maxNum } = this.props
    // UE.delEditor('container');
    const self = this
    const ueEditor = UE.getEditor(id, {
      // UEDITOR_HOME_URL: baseURL,
      // serverUrl: '/ueditor/php/controller.php',
      initialFrameWidth: this.props.width,
      initialFrameHeight: this.props.height,
      zIndex: this.props.inModal ? 1001 : 999,
      lang: 'en',
      toolbars: [
        [
          'fullscreen', 'source', '|', 'undo', 'redo', '|',
          'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
          'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
          'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
          'directionalityltr', 'directionalityrtl', 'indent', '|',
          'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
          'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
          'simpleupload', 'insertimage', 'emotion', 'scrawl', 'insertvideo', 'music', 'attachment', 'map', 'gmap', 'insertframe', 'insertcode', 'webapp', 'pagebreak', 'template', 'background', '|',
          'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|',
          'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
          'print', 'preview', 'searchreplace', 'drafts', 'help',
        ],
      ],
      autoHeight: false,
      scaleEnabled: false,
      autoFloatEnabled: !this.props.inModal,
      removeFormatAttributes: 'lang, align, hspace, valign',
      maximumWords: maxNum || 10000, // 允许的最大字符数
    })

    ueEditor.ready((ueditor) => {
      if (!ueditor) {
        UE.delEditor(id)
        self.initUE()
      }
      // 若props传入参数disabled为true,则设置编辑器为不可编辑
      if (disabled) {
        ueEditor.setDisabled('fullscreen')
      }
      this.setState({ loading: false })
      ueEditor.setHeight(this.props.height)
      ueEditor.setContent(this.props.content)
    })
    
    if(self.props.onChange && typeof(self.props.onChange ) === 'function'){
        ueEditor.addListener('selectionchange', function(type) {
            self.props.onChange(this.getContent());
        });
    }
    
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
    UE.delEditor(this.props.name)
  }

  render () {
    return (
      <div style={{ lineHeight: 1 }}>
        { this.state.loading ? <Spin /> : null}
        <script id={this.props.name} name="content" type="text/plain" />
      </div>
    )
  }
}

UEditor.defaultProps = {
  content: '',
  width: '100%',
  height: '350px',
  inModal: false,
}

export default UEditor
