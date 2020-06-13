import React from 'react';
import styles from './province.module.css';

class Province extends React.Component {
  constructor(props) {
    super(props);
  }

  activityStyle(self) {
    return self.isActive ?
           styles.activeProvince : styles.inactiveProvince;
  }

  render() {
    const self = this.props.gs.provinces[this.props.index];
    return (
      <div className={styles.province + " " + this.activityStyle(self)}>
        <h2 className={styles.provinceName}>{self.name}</h2>
      </div>
    );
  }
}

export default Province;
