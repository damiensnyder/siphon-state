import React from 'react';

import JoinPanel from './join-panel';
import InviteLink from './invite-link';
import general from '../../general.module.css';
import styles from './pregame.module.css';

function joinPanelJsx(props) {
  if (!props.joined) {
    return (
      <JoinPanel callback={props.callback}
          gameCode={props.gameCode} />
    );
  }
  return <InviteLink gameCode={props.gameCode} />;
}

function PregameView(props) {
  return (
    <div className={general.outerWrapper + ' ' +
        general.horizWrapper + ' ' +
        styles.panelContainer}>
      {joinPanelJsx(props)}
    </div>
  );
}

export default PregameView;
