import React from 'react';

import general from './general.module.css';
import styles from './controls-header.module.css';

class ControlsHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false
    }

    this.toggleReady = this.toggleReady.bind(this);
  }

  toggleReady() {
    const newReady = !this.state.ready;
    this.setState({
      ready: newReady
    });
    if (newReady) {
      this.props.callback('ready');
    } else {
      this.props.callback('unready');
    }
  }

  render() {
    return (
      <div id={styles.outerHeader}>
        <div id={styles.messageBar}
             className={styles.headerItem}>
          {this.state.ready ? this.props.onMsg : this.props.offMsg}
        </div>
        <button id={styles.readyBtn}
                className={general.actionBtn + ' ' + styles.headerItem}
                onClick={this.toggleReady}>
          {this.state.ready ? "Cancel" : "Ready"}
        </button>
      </div>
    );
  }
}

export default ControlsHeader;
