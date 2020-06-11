import React from 'react';
import styles from './other-player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className={styles.otherPlayer}>
        <h2 className={styles.playerName}>{this.props.index}</h2>
      </div>
    );
  }
}

export default OtherPlayer;
