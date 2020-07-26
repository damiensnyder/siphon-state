import React from 'react';

import general from '../../general.module.css';
import styles from './pol.module.css';

function bigNumberJsx(props) {
  if (props.gs.activeProv.candidates.includes(props.self)
      && props.gs.activeProv.stage == 1) {
    return (
      <div className={styles.bigNumber}>
        {Math.round(props.self.support)}
      </div>
    );
  } else if (props.gs.activeProv.officials.includes(props.self)
      && props.gs.activeProv.stage == 2) {
    return <div className={styles.bigNumber}>{props.self.votes}</div>;
  } else if (props.gs.activeProv.governor == props.self) {
    return <div className={styles.bigNumber}>★</div>;
  }
  return null;
}

function buttonsJsx(props) {
  if (props.gs.pov < 0) {
    return null;
  }
  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 0
      && props.gs.ownParty.candidates.includes(props.self)
      && !props.gs.activeProv.candidates.includes(props.self)
      && props.gs.activeProv.candidates.length < 3) {
    return (
      <div className={styles.btnRow}>
        <button className={general.actionBtn}
            onClick={() => props.callback('run', props.self)}>
          Nominate
        </button>
      </div>
    );
  }
  if (props.self.party == props.gs.pov
      && props.gs.activeProv.stage == 0
      && props.gs.activeProv.candidates.includes(props.self)) {
    return (
      <div className={styles.btnRow}>
        <button className={general.actionBtn}
            onClick={() => props.callback('unrun', props.self)}>
          Undo
        </button>
      </div>
    );
  }
}

function Pol(props) {
  const imageUrl = "url('/politicians/" + (props.self.id % 2) + ".png')";
  return (
    <div className={styles.polWrapper}>
      <div className={styles.cardOuter}
          style={{backgroundImage: imageUrl}}>
        <div className={styles.darkenOnHover} />
        <div className={styles.spacer} />
        <span className={styles.name + ' ' +
            (props.self.party == props.gs.pov ? styles.ownPol : null)}>
          {props.self.name}
        </span>
        {bigNumberJsx(props)}
      </div>
      {buttonsJsx(props)}
    </div>
  );
}

export default Pol;
