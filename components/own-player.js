import React from 'react';
import own from './own-player.module.css';
import styles from './player.module.css';

class OwnPlayer extends React.Component {
  constructor(props) {
    super(props);
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
        <h4 className={styles.abbr}>
          Ready: {self.ready ? '✓' : '╳'}
        </h4>
      </div>
    );
  }
}

export default OwnPlayer;
