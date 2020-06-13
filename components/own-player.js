import React from 'react';
import own from './own-player.module.css';
import styles from './player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.self = this.props.gs.players[props.index];
  }

  render() {
    return (
      <div className={styles.otherPlayer}>
        <h2 className={styles.name + " " + own.ownColor}>
          {this.self.name}
        </h2>
        <h4 className={styles.abbr + " " + own.ownColor}>
          {this.self.abbr}
        </h4>
      </div>
    );
  }
}

export default OtherPlayer;
