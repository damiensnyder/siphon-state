import React from 'react';
import styles from './control-panel.module.css';

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);

    this.inviteLink = 'https://filter-state.herokuapp.com/game/' +
                      this.props.gameCode;

    this.linkArea = React.createRef();

    this.copyInviteLink = this.copyInviteLink.bind(this);
  }

  copyInviteLink() {
    this.linkArea.select();
    document.execCommand('copy');
  }

  render() {
    return (
      <div className={styles.outerWrapper}>
        <div className={styles.containerLevel5}>
          <div className={styles.joinInputDiv}>
            <div className={styles.joinLabel}>Party:</div>
            <input className={styles.joinInput} />
          </div>
          <div className={styles.joinInputDiv}>
            <div className={styles.joinLabel}>Abbreviation:</div>
            <input className={styles.joinInput} />
          </div>
          <div className={styles.joinInputDiv}>
            <button className={styles.actionBtn}
                    onClick={this.props.joinHandler}>Join Game</button>
          </div>
        </div>
        <div id={styles.orDiv}>or</div>
        <div className={styles.containerLevel5}>
          <div>
            <textarea rows={1}
                      ref={this.linkArea}
                      className={styles.gameLink}
                      value={this.inviteLink}>
            </textarea>
            <button className={styles.actionBtn}
                    onClick={this.copyInviteLink}>Copy</button>
          </div>
          <div>invite a friend</div>
        </div>
      </div>
    );
  }
}

export default ControlPanel;
