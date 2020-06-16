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
          ${self.funds}
        </h4>
        {this.buyButton(self)}
        {this.passButton()}
      </div>
    );
  }

  buyButton(self) {
    if (self.funds < 5) {
      return null;
    }
    return (
      <button onClick={e => this.props.callback('buy', {})}>
        Buy symp ($5)
      </button>
    );
  }

  passButton() {
    return (
      <button onClick={e => this.props.callback('pass', {})}>
        Pass
      </button>
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
        {this.props.gs.started ?
         this.playerInfo(self) : this.readyIndicator(self)}
      </div>
    );
  }
}

export default OwnPlayer;
