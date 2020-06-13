import React from 'react';
// import styles from './control-panel.module.css';
import JoinPanel from './join-panel';

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <JoinPanel joinHandler={this.props.joinHandler}
                 gameCode={this.props.gameCode} />
    );
  }
}

export default ControlPanel;
