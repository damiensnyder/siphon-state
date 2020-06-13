import React from 'react';
import styles from './other-player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.self = this.props.gs.players[props.index];
  }

  render () {
    return (
      <div className={styles.otherPlayer}>
        <h2 className={styles.playerName}>{this.self.name}</h2>
      </div>
    );
  }
}

export default OtherPlayer;
