import React from 'react';
import styles from './province.module.css';

class Province extends React.Component {
  constructor(props) {
    super(props);
    // this.provinceInfo = this.props.gameState.provinces[this.props.index];
  }

  render () {
    return (
      <div className={styles.province}>
        <h2 className={styles.provinceName}>{this.props.index}</h2>
      </div>
    );
  }
}

export default Province;
