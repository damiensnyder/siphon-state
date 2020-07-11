import React from 'react';

import JoinPanel from './join-panel';
import WaitingPanel from './waiting-panel';
import GameControls from './game-controls';
import InviteLink from './invite-link';
import general from '../../general.module.css';

function ControlPanel(props) {
  if (props.gs.pov < 0 && !props.gs.started) {
    return (
      <JoinPanel callback={props.callback}
        gameCode={props.gameCode} />
    );
  } else if (props.gs.pov >= 0 && !props.gs.started) {
    return (
      <WaitingPanel gs={props.gs}
          gameCode={props.gameCode}
          callback={props.callback} />
    );
  } else if (props.gs.pov >= 0 && props.gs.started) {
    return (
      <GameControls gs={props.gs}
          callback={props.callback} />
    );
  } else {
    return (
      <div className={general.outerWrapper + ' ' + general.horizWrapper}>
        <InviteLink gameCode={props.gameCode} />
      </div>
    );
  }
}

export default ControlPanel;
