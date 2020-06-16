import React from 'react';
import own from './own-player.module.css';
import styles from './player.module.css';

class OwnPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.playerInfo = this.playerInfo.bind(this);
    this.buyButton = this.buyButton.bind(this);
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
          ${self.funds}{this.numVotes(self)}
        </h4>
        {this.buyButton(self)}
        {this.passButton()}
      </div>
    );
  }

  numVotes(self) {
    if (this.gs.stage == 2) {
      return (
        <div>
          , {self.votes} votes
        </div>
      );
    }
    return null;
  }

  buyButton(self) {
    if (self.funds < 5 && this.props.gs.pov == this.props.gs.turn) {
      return (
        <button onClick={e => this.props.callback('buy', {})}>
          Buy symp ($5)
        </button>
      );
    }
    return null;
  }

  passButton() {
    if (this.props.gs.pov == this.props.gs.turn) {
      return (
        <button onClick={e => this.props.callback('pass', {})}>
          Pass
        </button>
      );
    }
    return null;
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
        {this.props.gs.started ?
         this.playerInfo(self) : this.readyIndicator(self)}
      </div>
    );
  }
}

export default OwnPlayer;
