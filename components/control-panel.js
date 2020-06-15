import React from 'react';
import JoinPanel from './join-panel';
import ReadyPanel from './ready-panel';
import GameControls from './game-controls';

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
    } else if (this.props.gs.pov >= 0 && !this.props.gs.started) {
      return <ReadyPanel readyHandler={this.props.readyHandler} />;
    } else if (this.props.gs.pov >= 0 && this.props.gs.started) {
      return <GameControls gs={this.props.gs} />;
    } else {
      return <div>hope you like watchin em</div>;
    }
  }
}

export default ControlPanel;
