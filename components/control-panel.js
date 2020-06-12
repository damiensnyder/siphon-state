import React from 'react';
import styles from './control-panel.module.css';

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        Party name: <input className={styles.joinInputBox} />
        Abbreviation: <input className={styles.joinInputBox} />
        <button className={styles.actionBtn}
                onClick={this.props.joinHandler}>Join Game</button>
      </div>
    );
  }
}

export default ControlPanel;
