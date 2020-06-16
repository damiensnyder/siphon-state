import React from 'react';
import styles from './player.module.css';

class OtherPlayer extends React.Component {
  constructor(props) {
    super(props);
  }

  activityStyle(self) {
    if (this.props.gs.turn == this.props.index) {
      return styles.player + " " + styles.activePlayer;
    } else {
      return styles.player + " " + styles.inactivePlayer;
    }
  }

  gsInfo(self) {
    if (!this.props.gs.started) {
      return this.readyIndicator(self);
    }
    return (
      <div>
        <h4>
          ${self.funds}{this.numVotes(self)}
        </h4>
        {this.props.gs.pov >= 0 ? this.payButton() : null}
        {this.props.gs.pov < 0 && !self.connected ?
         this.replaceButton() : null}
      </div>
    );
  }

  readyIndicator(self) {
    return (
      <h4>
        Ready: {self.ready ? '✓' : '╳'}
      </h4>
    );
  }

  numVotes(self) {
    if (this.props.gs.provinces[this.props.gs.activeProvince].stage == 2) {
      return `, ${self.votes} votes`;
    }
    return null;
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

  render() {
    const self = this.props.gs.parties[this.props.index];
    return (
      <div className={this.activityStyle()}>
        <h2 className={styles.name + " " + styles.otherName}>
          {self.name}
        </h2>
        <h4 className={styles.abbr + " " + styles.otherName}>
          {self.abbr}
        </h4>
        {this.gsInfo(self)}
      </div>
    );
  }
}

export default OtherPlayer;
