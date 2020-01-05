import React, { PropTypes } from 'react';
import { Upload, Icon, Modal, message, Button } from 'antd';
import { Error } from 'utils/warn'
import styles from './SingleUpload.less';

export default class TextStyleUpload extends React.Component {

  /**
   * 文件上传组件
   * @type {{width: (大图弹窗大小), action: (图片上传接口), name: 上传所带参数, previewIcon: (是否显示预览按钮), className: (特殊样式)}}
   */

  constructor(props) {
    super(props);
    const fileList = [];
    if(props.file){
      fileList.push({
        uid:-1,
        url: props.file,
        name:props.file,
        thumbUrl:props.file,
        status: 'done',
      })
    }
    this.state = {
      previewVisible: false,//是否显示大图弹窗
      previewImage: '', //预览大图src
      fileList: fileList,//添加图片列表
    };
  }

  //文件上传之前检查格式及文件大小，不符合要求则弹出提示
  beforeUpload = (file) => {
    //验证文件格式
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/gif';
    if (!isJPG) {
      Error('You can only upload JPG,PNG,JPEG,GIF file!');
      file.flag = true;
    }
    //验证文件大小不超过1MB
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
      Error('Image must smaller than 1MB!');
      file.flag = true;
    }
    return isJPG && isLt2M;
  }

  //文件上传处理
  handleChange = ({ fileList, file }) => {

    if (file.flag) {
      return;
    }
    let newFile = fileList

    // 1. Limit the number of uploaded files
    //    Only to show two recent uploaded files, and old ones will be replaced by the new
    newFile = newFile.slice(-(this.props.limit || 1));

    // 3. filter successfully uploaded files according to response from server
    newFile = newFile.filter((file) => {
      if (file.response) {
        if (file.response.code !== 200) {
          Error(file.response.message)
        }
        return file.response.code === 200;
      }
      return true;
    });

    // 2. read from response and show file link
    newFile = newFile.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.data.img_url;
        file.path = file.response.data.img_path;
      }
      return file;
    });

    // always setState
    //console.log(fileList)
    this.setState({ fileList: newFile}, function(){
      this.props.changeImage(newFile);
    })

  }

  render() {
    const { fileList } = this.state;
    const {  action, name, previewIcon, className } = this.props;


    return (
      <div className="clearfix">
        <Upload
          action={action || "/bg_os/index.php?com=banners&t=uploadImg"}
          name={name || 'file'}
          fileList={fileList}
          beforeUpload={this.beforeUpload}
          onChange={this.handleChange}
        >
          <Button>
            <Icon type="upload" /> 选择文件
          </Button>
        </Upload>
      </div>
    );
  }
}
