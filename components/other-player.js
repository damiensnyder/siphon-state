import React from 'react';
import styles from './player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.playerInfo = this.playerInfo.bind(this);
    this.replaceButton = this.replaceButton.bind(this);
    this.payButton = this.payButton.bind(this);
  }

  readyIndicator(self) {
    return (
      <h4>
        Ready: {self.ready ? '✓' : '╳'}
      </h4>
    );
  }

  replaceButton() {
    return (
      <button onClick={e => this.props.callback('replace', this.props.index)}>
        Replace
      </button>
    );
  }

  payButton() {
    if (this.props.gs.pov == this.props.gs.turn
        && this.props.gs.parties[this.props.gs.pov].funds >= 1) {
      return (
        <button onClick={e =>
          this.props.callback('pay', { p2: this.props.index, amount: 1 })}>
          Pay $1
        </button>
      );
    }

    return null;
  }

  playerInfo(self) {
    return (
      <div>
        <h4>
          ${self.funds}
        </h4>
        {this.props.gs.pov >= 0 ? this.payButton() : null}
        {this.props.gs.pov < 0 && !self.connected ?
         this.replaceButton() : null}
      </div>
    );
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
        {this.props.gs.started ?
         this.playerInfo(self) : this.readyIndicator(self)}
      </div>
    );
  }
}

export default OtherPlayer;
