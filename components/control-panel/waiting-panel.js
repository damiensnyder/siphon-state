import React from 'react';

import ControlsHeader from './controls-header';

import general from './general.module.css';
import styles from './waiting-panel.module.css';

class WaitingPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false
    };

    this.toggleReady = this.toggleReady.bind(this);
  }

  toggleReady() {
    const ready = !this.state.ready;
    this.setState({
      ready: ready
    });
    this.props.callback('ready', ready);
  }

  render() {
    return (
      <div className={general.outerWrapper}>
        <ControlsHeader offMsg={"Click ready when you're ready to start."}
                        onMsg={"Click cancel if you're not ready anymore."}
                        callback={this.props.callback} />
        <div className={styles.bigText}>
          <span className={styles.bigText}
                checked={this.state.ready}>ready?</span>
          <input type={"checkbox"}
                 onChange={this.toggleReady}
                 id={styles.readyCheckbox} />
        </div>
      </div>
    );
  }
}

export default WaitingPanel;
