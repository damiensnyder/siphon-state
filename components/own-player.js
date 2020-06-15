import React from 'react';
import own from './own-player.module.css';
import styles from './player.module.css';

class OwnPlayer extends React.Component {
  constructor(props) {
    super(props);
  }

  readyIndicator(self) {
    return (
      <h4>
        Ready: {self.ready ? '✓' : '╳'}
      </h4>
    );
  }

  playerInfo(self) {
    return (
      <div>
        <h4>
          ${self.funds}
        </h4>
      </div>
    );
  }

  render() {
    const self = this.props.gs.parties[this.props.index];
    return (
      <div className={styles.otherPlayer}>
        <h2 className={styles.name + " " + own.ownColor}>
          {self.name}
        </h2>
        <h4 className={styles.abbr + " " + own.ownColor}>
          {self.abbr}
        </h4>
        {this.props.gs.started ? this.playerInfo(self) : this.readyIndicator(self)}
      </div>
    );
  }
}

export default OwnPlayer;
