import React from 'react';

import general from '../../general.module.css';
import styles from './prov.module.css';

function PregamePlaceholder(props) {
  return (
    <div className={general.outerWrapper + ' ' +
        styles.provBg}>
      Waiting for the game to start.
    </div>
  )
}

export default PregamePlaceholder;
