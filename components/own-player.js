import React from 'react';
import own from './own-player.module.css';
import styles from './player.module.css';

class OwnPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.playerInfo = this.playerInfo.bind(this);
    this.buyButton = this.buyButton.bind(this);
    this.handleBuy = this.handleBuy.bind(this);
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
      </div>
    );
  }

  buyButton(self) {
    if (self.funds < 5) {
      return null;
    }
    return (
      <button onClick={this.handleBuy}>
        Buy symp ($5)
      </button>
    );
  }

  handleBuy() {
    this.props.callback('buy', {});
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
