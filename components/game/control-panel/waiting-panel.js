import React from 'react';

import ControlsHeader from './controls-header';
import InviteLink from './invite-link';
import general from '../../general.module.css';
import styles from './control-panel.module.css';

function WaitingPanel(props) {
  return (
    <div className={general.outerWrapper + ' ' + general.vertWrapper}>
      <ControlsHeader gs={props.gs}
          callback={props.callback} />
      <div className={general.outerWrapper + ' ' +
          general.horizWrapper + ' ' +
          styles.notInGame}>
        <InviteLink gameCode={props.gameCode} />
      </div>
    </div>
  );
}

export default WaitingPanel;
