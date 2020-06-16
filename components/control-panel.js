import React from 'react';
import JoinPanel from './join-panel';
import ReadyPanel from './ready-panel';
import GameControls from './game-controls';

function ControlPanel(props) {
  if (props.gs.pov < 0) {
    return (
      <JoinPanel callback={props.callback}
                 gameCode={props.gameCode} />
    );
  } else if (props.gs.pov >= 0 && !props.gs.started) {
    return <ReadyPanel callback={props.callback} />;
  } else if (props.gs.pov >= 0 && props.gs.started) {
    return <GameControls gs={props.gs}
                         callback={props.callback} />;
  } else {
    return <div>hope you like watchin em</div>;
  }
}

export default ControlPanel;
