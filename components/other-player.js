import React from 'react';
import styles from './player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.playerInfo = this.playerInfo.bind(this);
    this.handlePay = this.handlePay.bind(this);
  }

  readyIndicator(self) {
    return (
      <h4>
        Ready: {self.ready ? '✓' : '╳'}
      </h4>
    );
  }

  payButton() {
    return (
      <button onClick={this.handlePay}>
        Pay $1
      </button>
    );
  }

  playerInfo(self) {
    return (
      <div>
        <h4>
          ${self.money}
        </h4>
        {this.props.gs.pov >= 0 ? this.payButton() : null}
      </div>
    );
  }

  handlePay() {
    this.props.payHandler(this.props.index, 1);
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
        {this.props.gs.started ? this.playerInfo(self) : this.readyIndicator(self)}
      </div>
    );
  }
}

export default OtherPlayer;
