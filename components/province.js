import React from 'react';
import styles from './province.module.css';

class Province extends React.Component {
  constructor(props) {
    super(props);
    this.self = props.gs.provinces[props.index];
  }

  activityStyle() {
    return this.self.isActive ? styles.activeProvince : styles.inactiveProvince;
  }

  render() {
    return (
      <div className={styles.province + " " + this.activityStyle()}>
        <h2 className={styles.provinceName}>{this.self.name}</h2>
      </div>
    );
  }
}

export default Province;
