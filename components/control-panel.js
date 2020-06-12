import React from 'react';
import styles from './control-panel.module.css';

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      abbrPlaceholder: ''
    }

    this.inviteLink = 'https://filter-state.herokuapp.com/game/' +
                      this.props.gameCode;

    this.linkArea = React.createRef();

    this.copyInviteLink = this.copyInviteLink.bind(this);
    this.updateAbbr = this.updateAbbr.bind(this);
  }

  updateAbbr(e) {
    const partyName = e.target.value;
    this.setState({
      abbrPlaceholder: partyName.trim().substring(0, 4).toUpperCase()
    });
  }

  copyInviteLink() {
    this.linkArea.current.select();
    document.execCommand('copy');
  }

  render() {
    return (
      <div className={styles.outerWrapper}>
        <div className={styles.containerLevel5}>
          <div className={styles.sameLine}>
            <div className={styles.joinLabel}>Party:</div>
            <input className={styles.joinInput}
                   onChange={this.updateAbbr} />
          </div>
          <div className={styles.sameLine}>
            <div className={styles.joinLabel}>Abbreviation:</div>
            <input className={styles.joinInput}
                   placeholder={this.state.abbrPlaceholder}
                   maxLength={4} />
          </div>
          <div className={styles.sameLine}>
            <button className={styles.actionBtn}
                    onClick={this.props.joinHandler}>Join Game</button>
          </div>
        </div>
        <div id={styles.orDiv}>or</div>
        <div className={styles.containerLevel5}>
          <div className={styles.sameLine}>
            <textarea rows={1}
                      ref={this.linkArea}
                      className={styles.gameLink}
                      value={this.inviteLink}>
            </textarea>
            <button className={styles.actionBtn}
                    id={styles.copyBtn}
                    onClick={this.copyInviteLink}>Copy</button>
          </div>
          <span id={styles.inviteFriend}>invite a friend</span>
        </div>
      </div>
    );
  }
}

export default ControlPanel;
