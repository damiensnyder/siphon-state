import React from 'react';
import styles from './pol.module.css';

class Pol extends React.Component {
  constructor(props) {
    super(props);

    this.actionButton = this.actionButton.bind(this);
  }

  // Return the appropriate action button for the pol (e.g., "Flip").
  actionButton() {
    const gs = this.props.gs;
    const self = gs.pols[this.props.index];
    const stage = gs.provinces[gs.activeProvince].stage;

    if (gs.turn !== gs.pov) {
      return null;
    }
    if (gs.parties[gs.pov].symps.includes(this.props.index)) {
      return (
        <button onClick={e => this.props.callback('flip', this.props.index)}>
          Flip
        </button>
      );
    }
    if (stage === 0 && self.party === gs.pov && self.available) {
      return (
        <button onClick={e => this.props.callback('run', this.props.index)}>
          Run
        </button>
      );
    }
    if (stage === 1 && self.party === gs.pov && !self.actionTaken) {
      return (
        <button onClick={e => this.props.callback('fund', this.props.index)}>
          Fund
        </button>
      );
    }
    if (stage === 2 && !self.actionTaken) {
      return (
        <button onClick={e => this.props.callback('vote', this.props.index)}>
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
