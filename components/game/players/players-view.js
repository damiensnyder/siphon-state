import React from 'react';

import Party from './party';
import styles from './players-view.module.css';

function partiesToJsx(gs, callback) {
  const partiesJsx = [];
  for (let i = 0; i < gs.parties.length; i++) {
    partiesJsx.push(
      <Player key={i}
          gs={gs}
          callback={callback} />
    );
  }
  return partiesJsx;
}

function PlayersView(props) {
  return (
    <div id={styles.playersWrapper}>
      {partiesToJsx(props.gs, props.callback)}
    </div>
  );
}

export default PlayersView;
