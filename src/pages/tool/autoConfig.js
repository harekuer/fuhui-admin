import { Link } from 'dva/router'
import { Input, Select, Switch, Icon, Tooltip, Radio, Checkbox} from 'antd'
import classnames from 'classnames'
import styles from './autoConfig.less'
import SingleUpload from '@/components/SinglePicture/SingleUpload.js';

const Option = Select.Option
const { TextArea } = Input
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

/**
 * 表格组件配置
 * @param   {String}   item 当前列配置
 * @param   {func}   renderItem  删除时显示弹窗
 * @param   {Num}   langIndex  语言顺序 0中文，1英文
 * @param   {func}   onCopyLink  复制链接
 * @param   {bool}   loading  switch 切换状态时loading值
 * @return  {func}
 */
const tableConfig = (item, renderItem, langIndex, onCopyLink, loading) => { // 根据参数配置显示相应的UI组件，
  const config = {
    html: (text) => {
      return (
        <div dangerouslySetInnerHTML={createMarkup(text)} />
      )
    },
    popover: (text, record) => {
      return (
        <a href="javascript:;" onClick={() => renderItem(record)}>{text}</a>
      )
    },
    url_blank: (text, record) => {
      let url = ''
      let longUrl = ''
      if (item.query) { // 将返回的query数组拼接成字符串
        item.query.forEach((option) => {
          url += `${option}=${record[option]}&`
        })
      }
      // 若item.url配置中包含/,则表示改地址为实际地址，不用获取列表该参数
      if (item.url.indexOf('/') > -1) {
        longUrl = item.url
      } else {
        longUrl = record[item.url]
      }
      return (
        <a href={`${longUrl}${url !== '' ? `?${url}` : ''}`} target="_blank">{text}</a>
      )
    },
    url_self: (text, record) => {
      let url = ''
      if (item.query) { // 将返回的query数组拼接成字符串
        item.query.forEach((option) => {
          url += `${option}=${record[option]}`
        })
      }
      // 若item.url配置中包含/,则表示改地址为实际地址，不用获取列表该参数
      if (item.url.indexOf('/') > -1) {
        longUrl = `${item.url}?${url}`
      } else {
        longUrl = `${record[item.url]}?${url}`
      }
      return (
        <Link to={record[item.url]} >{text}</Link>
      )
    },
    // img: (text, record) => {
    //   return (
    //     <SinglePicture
    //       width={520}
    //       height={628}
    //       showRemove={false}
    //       limit={1}
    //       fileList={[text]}
    //     />
    //   )
    // },
    operate: (text, record) => {
      return (
        <div className="operate">
          {
            item.action && item.action.map((item, index) => {
              let url = ''
              if (item.query) { // 将返回的query数组拼接成字符串
                item.query.forEach((option,index) => {
                  url += `${index > 0 ? '&' : ''}${option}=${record[option]}`
                })
              }

              if (!item.target || item.target === '_self') {
                if (item.callback === 'delete' || item.callback === 'refresh') { // 删除处理或刷新
                  if (Number(record.is_can_delete) === 0) {
                    return null
                  }
                  return (
                    <a href='javascript:;' onClick={() => renderItem(record, item, item.callback)} key={index}>
                      {Array.isArray(item.text) ? item.text[langIndex] : item.text}
                    </a>
                  )
                } else if(item.callback === 'copy') { //根据query值复制链接
                  return (
                    <a href={item.url} onClick={() => onCopyLink(record[item.query[0]])} key={index}>
                      {Array.isArray(item.text) ? item.text[langIndex] : item.text}
                    </a>
                  )
                }
                // 当前页无刷新跳转，一般是跳转至编辑页
                if(record.coupon_id){ //优惠券列表需提交type参数 update see
                  return (<Link
                    to={{ pathname: item.url, search: `?${url}`, query: {type: record.coupon_code_type == '2' && record.show_audit == 0 ? 'see' : 'update'} }}
                    key={index}
                  >{record.coupon_code_type == '2' && record.show_audit == 0 ? '查看' : '编辑'}</Link>)
                } else {
                  return (<Link
                    to={{ pathname: item.url, search: `?${url}` }}
                    key={index}
                  >{Array.isArray(item.text) ? item.text[langIndex] : item.text}</Link>)
                }
              } // 外链或新开窗口
                <a href={`${item.url}?${url}`} target={item.target} style={{ marginRight: '10px' }} key={index}>
                {Array.isArray(item.text) ? item.text[langIndex] : item.text}
              </a>
            })
          }
        </div>
      )
    },
    switch: (text, record, index) => {
        return (
            <div className={styles.status}>
                <div className={classnames({[styles.load_icon]: true, [styles.isShow]: loading && record.statusLoading })}>
                <Icon type="loading"/>
                </div>
                <Switch checked={record.coupon_status == '1'} disabled={record.new_status_value? record.new_status_value !== '2' : false} onChange={(isChecked) => renderItem(record, isChecked, index)} size="small"/>
            </div>
        )            
    }
  }
  return config[item.render]
}

/**
 * 将JSON字符串解析为html
 * @param   {Object}   text  字符串
 * @return  {html}
 */
const createMarkup = (text) => {
  return { __html: text }
}

/**
 * 搜索组件配置
 * @param   {Object}   item  search配置
 * @return  {html}
 */
const searchConfig = (item, langIndex) => { // 目前类型为input及select
  const Type = item.type
  if (Type && Type === 'Input') {
    return (
      <Input placeholder={Array.isArray(item.placeholder) ? item.placeholder[langIndex] : item.placeholder} size="large" />
    )
  } else if (Type && Type.indexOf('Select') > -1) {
    let selectType = Type.split('_')
    return (
      <Select placeholder={Array.isArray(item.placeholder) ? item.placeholder[langIndex] : item.placeholder} mode={selectType.length > 1 ? 'multiple' : ''} size="large" style={{ width: '100%' }} allowClear>
        {
          item.options.map((option, index) => {
            return (
              <Option value={String(option.value)} key={index}>{option.label}</Option>
            )
          })
        }
      </Select>
    )
  }
}

const makeTooltip = (text, tips) => {
    return (
        <div style={{whiteSpace:'nowrap'}}>
            {text}
            <Tooltip title={<div dangerouslySetInnerHTML={{__html: tips}}></div>} placement="right">
                <Icon type="question-circle" className={styles.iconTips} />
            </Tooltip>
        </div>  
    )
}

/**
 * 表单配置
 * @param   {Object}   item  单项配置内容
 * @return  {html}
 */
const FormConfig = (item, langIndex) => {
  const config = {
    Input: (item) => {
     return <Input placeholder={Array.isArray(item.placeholder) ? item.placeholder[langIndex] : item.placeholder} size="large" />
    },
    TextArea: (item) => {
      return <TextArea rows={item.rows ? item.rows : 5} />
    },
    Select:(item) => {
      return (
        <Select placeholder={Array.isArray(item.placeholder) ? item.placeholder[langIndex] : item.placeholder}  size="large" style={{ width: '100%' }} allowClear>
          {
            item.options.map((option, index) => {
              return (
                <Option value={String(option.value)} key={index}>{option.label}</Option>
              )
            })
          }
        </Select>
      )
    },
    Select_multiple:(item) => {
      return (
        <Select placeholder={Array.isArray(item.placeholder) ? item.placeholder[langIndex] : item.placeholder} mode="multiple" size="large" style={{ width: '100%' }} allowClear>
          {
            item.options.map((option, index) => {
              return (
                <Option value={String(option.value)} key={index}>{option.label}</Option>
              )
            })
          }
        </Select>
      )
    },
    Radio: (item) => {
      return (
        <RadioGroup >
          {
            item.options.map((option, index) => {
              return (
                <Radio value={String(option.value)} key={index}>{option.label}</Radio>
              )
            })
          }
      </RadioGroup>
      )
    },
    Checkbox: (item) => {
      return (
        <CheckboxGroup options={item.options} />
      )
    },

  }
 return config[item.render]
}

module.exports = {
  tableConfig,
  searchConfig,
  makeTooltip
}
