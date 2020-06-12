import React from 'react';
import styles from './control-panel.module.css';
import InviteLink from './invite-link';

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      partyName: '',
      abbr: '',
      abbrPlaceholder: ''
    }

    this.partyAbbr = React.createRef();
    this.updateAbbr = this.updateAbbr.bind(this);
    this.updatePartyName = this.updatePartyName.bind(this);
    this.joinGame = this.joinGame.bind(this);
  }

  updatePartyName(e) {
    const partyName = e.target.value;
    this.setState({
      partyName: partyName,
      abbrPlaceholder: partyName.trim().substring(0, 4).toUpperCase()
    });
  }

  updateAbbr(e) {
    this.setState({
      abbr: e.target.value
    });
  }

  joinGame() {
    const abbr = this.state.abbr === '' ?
        this.state.abbrPlaceholder :
        this.state.abbr;

    this.props.joinHandler({
      name: this.state.partyName,
      abbr: abbr
    });
  }

  render() {
    return (
      <div className={styles.outerWrapper}>
        <div className={styles.containerLevel5}>
          <div className={styles.sameLine}>
            <div className={styles.joinLabel}>Party:</div>
            <input className={styles.joinInput}
                   onChange={this.updatePartyName}
                   value={this.state.partyName}
                   maxLength={40} />
          </div>
          <div className={styles.sameLine}>
            <div className={styles.joinLabel}>Abbreviation:</div>
            <input className={styles.joinInput}
                   placeholder={this.state.abbrPlaceholder}
                   onChange={this.updateAbbr}
                   value={this.state.abbr}
                   maxLength={4} />
          </div>
          <div className={styles.sameLine}>
            <button className={styles.actionBtn}
                    onClick={this.joinGame}>
              Join Game
            </button>
          </div>
        </div>
        <div id={styles.orDiv}>or</div>
        <div className={styles.containerLevel5}>
          <InviteLink gameCode={this.props.gameCode} />
          <span id={styles.inviteFriend}>invite a friend</span>
        </div>
      </div>
    );
  }
}

export default ControlPanel;
