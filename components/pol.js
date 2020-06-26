import React from 'react';
import styles from './pol.module.css';

class Pol extends React.Component {
  constructor(props) {
    super(props);

    this.actionButton = this.actionButton.bind(this);
  }

  // Return the appropriate action button for the pol (e.g., "Flip"), or none
  // if no action is applicable or it is not the player's turn.
  actionButton() {
    const gs = this.props.gs;
    const self = gs.pols[this.props.index];
    const stage = gs.provs[gs.activeProv].stage;
    const callback = this.props.callback;

    if (gs.turn !== gs.pov) {
      return null;
    }
    if (gs.parties[gs.pov].symps.includes(this.props.index)
        && !this.props.inProv) {
      return (
        <button onClick={e => callback('flip', this.props.index)}>
          Flip
        </button>
      );
    }
    if (stage == 0
        && self.party === gs.pov
        && self.runnable) {
      return (
        <button onClick={e => callback('run', this.props.index)}>
          Run
        </button>
      );
    }
    if (gs.provs[gs.activeProv].candidates.includes(this.props.index)
        && stage == 1
        && self.party === gs.pov
        && !self.funded) {
      return (
        <button onClick={e => callback('fund', this.props.index)}>
          Fund
        </button>
      );
    }
    if (gs.provs[gs.activeProv].officials.includes(this.props.index)
        && gs.parties[gs.pov].votes > 0
        && stage == 2) {
      return (
        <button onClick={e => callback('vote', this.props.index)}>
          Vote
        </button>
      );
    }
    return null;
  }

  render() {
    const self = this.props.gs.pols[this.props.index];
    return (
      <div className={styles.sameLine}>
        <div>{self.name} ({this.props.gs.parties[self.party].abbr})</div>
        {this.actionButton()}
      </div>
    );
  }
}

export default Pol;
