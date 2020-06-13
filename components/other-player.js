import React from 'react';
import styles from './player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.self = this.props.gs.parties[props.index];
  }

  render() {
    return (
      <div className={styles.otherPlayer}>
        <h2 className={styles.name}>
          {this.self.name}
        </h2>
        <h4 className={styles.abbr}>
          {this.self.abbr}
        </h4>
      </div>
    );
  }
}

export default OtherPlayer;
