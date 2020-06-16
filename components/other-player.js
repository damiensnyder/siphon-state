import React from 'react';
import styles from './player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.playerInfo = this.playerInfo.bind(this);
    this.takeoverButton = this.takeoverButton.bind(this);
    this.payButton = this.payButton.bind(this);
    this.handleTakeover = this.handleTakeover.bind(this);
    this.handlePay = this.handlePay.bind(this);
  }

  readyIndicator(self) {
    return (
      <h4>
        Ready: {self.ready ? '✓' : '╳'}
      </h4>
    );
  }

  takeoverButton() {
    return (
      <button onClick={this.handleTakeover}>
        Take over
      </button>
    );
  }

  payButton() {
    if (this.props.gs.parties[this.props.gs.pov].funds < 1) {
      return null;
    }
    return (
      <button onClick={this.handlePay}>
        Pay $1
      </button>
    );
  }

  handleTakeover() {
    this.props.callback('takeover', this.props.index);
  }

  handlePay() {
    this.props.callback('pay', {
      p2: this.props.index,
      amount: 1
    });
  }

  playerInfo(self) {
    return (
      <div>
        <h4>
          ${self.funds}
        </h4>
        {this.props.gs.pov >= 0 ? this.payButton() : null}
        {this.props.gs.pov < 0 && !self.connected ?
         this.takeoverButton() : null}
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
