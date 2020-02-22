import React from 'react'
import { Sortable } from 'react-sortable'
import styles from './SortableList.less'

class Item extends React.Component {
  render () {
    return (
      <div {...this.props} className={styles.grid_item} style={{ background: this.props.children }}>
        {this.props.children}
      </div>
    )
  }
}

export default Sortable(Item)
