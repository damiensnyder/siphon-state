import React from 'react';
import JoinPanel from './join-panel';
import ReadyPanel from './ready-panel';

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.gs.pov < 0) {
      return (
        <JoinPanel joinHandler={this.props.joinHandler}
                   gameCode={this.props.gameCode} />
      );
    } else if (!this.props.gs.started) {
      return <ReadyPanel readyHandler={this.props.readyHandler} />;
    }

    return <div>the game isn't allowed to start, this shouldn't happen</div>;
  }
}

export default ControlPanel;
