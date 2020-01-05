import { Modal } from 'antd'

/**
 * 弹框：错误类型
 * @param {string} message
 */
function Error (message) {
  Modal.error({
    title: 'Error',
    content: message,
  })
}


/**
 * 弹框：成功类型，自动关闭
 * @param {string} message
 */
function Success (message) {
  const modal = Modal.success({
    title: 'Success',
    content: message,
  })

  setTimeout(() => modal.destroy(), 2000)
}


/**
 * 弹框：警告
 * 如果只有一个参数，就是内容；如果是两个参数，第一个就是标题，第二个是内容
 * @param {string} title
 * @param {string} message
 */
function Warning (title, message) {
  if (title && message) {
    Modal.warning({
      title,
      content: message,
    })
  } else {
    Modal.warning({
      title: 'Notice',
      content: title,
    })
  }
}


/**
 * 弹框：信息提示
 * @param {string} title
 * @param {string} message
 */
function Info (title, message) {
  const modal = Modal.info({
    title,
    content: message,
  })

  setTimeout(() => modal.destroy(), 2000)
}


module.exports = {
  Error,
  Success,
  Warning,
  Info,
}
