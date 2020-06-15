import React from 'react';
import JoinPanel from './join-panel';
import ReadyPanel from './ready-panel';
import GameControls from './game-controls';

function ControlPanel(props) {
  if (props.gs.pov < 0) {
    return (
      <JoinPanel joinHandler={props.joinHandler}
                 gameCode={props.gameCode} />
    );
  } else if (props.gs.pov >= 0 && !props.gs.started) {
    return <ReadyPanel readyHandler={props.readyHandler} />;
  } else if (props.gs.pov >= 0 && props.gs.started) {
    return <GameControls gs={props.gs} />;
  } else {
    return <div>hope you like watchin em</div>;
  }
}

export default ControlPanel;
