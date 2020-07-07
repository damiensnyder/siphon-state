import React from 'react';

import JoinPanel from './join-panel';
import WaitingPanel from './waiting-panel';
import GameControls from './game-controls';

function ControlPanel(props) {
  if (props.gs.pov < 0 && !props.gs.started) {
    return (
      <JoinPanel callback={props.callback}
                 gameCode={props.gameCode} />
    );
  } else if (props.gs.pov >= 0 && props.gs.ended) {
    return (
      <div>
        {props.gs.parties[props.gs.winner].name} wins
        <button onClick={e => props.callback('ready', {})}>
          Rematch
        </button>
      </div>
    );
  } else if (props.gs.pov >= 0 && !props.gs.started) {
    return <WaitingPanel gs={props.gs}
                         callback={props.callback} />;
  } else if (props.gs.pov >= 0 && props.gs.started) {
    return <GameControls gs={props.gs}
                         callback={props.callback} />;
  } else {
    return <div>enjoy the show</div>;
  }
}

export default ControlPanel;
