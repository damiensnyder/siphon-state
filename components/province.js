import React from 'react';
import styles from './province.module.css';

class Province extends React.Component {
  constructor(props) {
    super(props);
    this.isActive = props.index === props.gameState.activeProvince;
  }

  activityStyle() {
    return this.isActive ? styles.activeProvince : styles.inactiveProvince;
  }

  render() {
    return (
      <div className={styles.province + " " + this.activityStyle()}>
        <h2 className={styles.provinceName}>{this.props.index}</h2>
      </div>
    );
  }
}

export default Province;
