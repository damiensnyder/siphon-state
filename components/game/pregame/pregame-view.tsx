import React from "react";

import JoinPanel from "./join-panel";
import InviteLink from "./invite-link";
import general from "../../general.module.css";
import styles from "./pregame.module.css";

interface PregameViewProps {
  joined: boolean,
  gameCode: string,
  callback: any
}

function joinPanelJsx(props: PregameViewProps) {
  if (!props.joined) {
    return (
      <JoinPanel callback={props.callback}
          gameCode={props.gameCode} />
    );
  }
  return <InviteLink gameCode={props.gameCode} />;
}

function PregameView(props: PregameViewProps) {
  return (
    <div className={general.outerWrapper + ' ' +
        general.horizWrapper + ' ' +
        styles.panelContainer}>
      {joinPanelJsx(props)}
    </div>
  );
}

export default PregameView;
