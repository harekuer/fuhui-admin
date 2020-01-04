import React from 'react';
import { Tabs } from 'antd';
import styles from './index.less';

const { TabPane } = Tabs;

function callback(key) {
  console.log(key);
}

export default () => (
  <div className={styles.container}>
    <div id="components-tabs-demo-card">
      <Tabs onChange={callback} type="card">
        <TabPane tab="顶部导航" key="1">
          Content of Tab Pane 1
        </TabPane>
        <TabPane tab="侧边导航" key="2">
          Content of Tab Pane 2
        </TabPane>
      </Tabs>
    </div>
  </div>
);
