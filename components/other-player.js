import React from 'react';
import styles from './player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const self = this.props.gs.parties[this.props.index];
    return (
      <div className={styles.otherPlayer}>
        <h2 className={styles.name}>
          {self.name}
        </h2>
        <h4 className={styles.abbr}>
          {self.abbr}
        </h4>
        <h4 className={styles.abbr}>
          Ready: {self.ready ? '✓' : '╳'}
        </h4>
      </div>
    );
  }
}

export default OtherPlayer;
