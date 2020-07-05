import React from 'react';

import styles from './player.module.css';

class OwnPlayer extends React.Component {
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
    return (
      <div>
        {this.readyIndicator(self)}
        <h4>
          ${self.funds}{this.numVotes(self)}
        </h4>
        {this.buyButton(self)}
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
    if (this.props.gs.provs[this.props.gs.activeProvId].stage == 2) {
      return `, ${self.votes} votes`;
    }
    return null;
  }

  buyButton(self) {
    if (self.funds >= 5
        && this.props.gs.pov == this.props.gs.turn
        && !this.props.gs.ended) {
      return (
        <button onClick={e => this.props.callback('buy', {})}>
          Buy symp ($5)
        </button>
      );
    }
    return null;
  }

  render() {
    const self = this.props.gs.parties[this.props.index];
    return (
      <div className={this.activityStyle()}>
        <h2 className={styles.name + " " + styles.ownName}>
          {self.name}
        </h2>
        <h4 className={styles.abbr + " " + styles.ownName}>
          {self.abbr}
        </h4>
        {this.gsInfo(self)}
      </div>
    );
  }
}

export default OwnPlayer;
