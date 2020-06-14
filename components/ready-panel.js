import React from 'react';
import join from './join-panel.module.css';
import styles from './ready-panel.module.css';

class ReadyPanel extends React.Component {
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
    this.props.readyHandler(ready);
  }

  render() {
    return (
      <div className={join.outerWrapper}>
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

export default ReadyPanel;
