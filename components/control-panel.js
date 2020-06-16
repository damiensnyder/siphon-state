import React from 'react';
import JoinPanel from './join-panel';
import ReadyPanel from './ready-panel';
import GameControls from './game-controls';

function ControlPanel(props) {
  if (props.gs.pov < 0 && !props.gs.started) {
    return (
      <JoinPanel callback={props.callback}
                 gameCode={props.gameCode} />
    );
  } else if (props.gs.ended) {
    return (
      <div>
        {props.gs.parties[props.gs.winner].name} wins
        <button onClick={e => props.callback('rematch', {})}>
          Rematch
        </button>
      </div>
    );
  } else if (props.gs.pov >= 0 && !props.gs.started) {
    return <ReadyPanel callback={props.callback} />;
  } else if (props.gs.pov >= 0 && props.gs.started) {
    return <GameControls gs={props.gs}
                         callback={props.callback} />;
  } else {
    return <div>enjoy the show</div>;
  }
}

export default ControlPanel;
