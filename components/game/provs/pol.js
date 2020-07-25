import React from 'react';

import general from '../../general.module.css';
import styles from './pol.module.css';

function bigNumberJsx(props) {
  const activeProv = props.gs.provs[props.gs.activeProvId]
  if (activeProv.candidates.includes(props.self) && activeProv.stage == 1) {
    return <div className={styles.bigNumber}>{Math.round(self.support)}</div>;
  } else if (activeProv.officials.includes(props.self)
      && activeProv.stage == 2) {
    return <div className={styles.bigNumber}>{self.votes}</div>;
  }
  return null;
}

function Pol(props) {
  const imageUrl = "url('/politicians/" + (props.self.id % 2) + ".png')";
  return (
    <div className={styles.outer}
        style={{backgroundImage: imageUrl}}>
      <div className={styles.darkenOnHover} />
      <div className={styles.spacer} />
      <span className={styles.name + ' ' +
          (props.self.party == props.gs.pov ? styles.ownPol : null)}>
        {props.self.name}
      </span>
      {bigNumberJsx(props)}
    </div>
  );
}

export default Pol;
