import React from 'react';

import CreateMenu from './create-menu';
import JoinMenu from './join-menu';
import general from '../general.module.css';
import styles from './main.module.css';

function HomeView() {
  return (
    <div id={styles.containerLevel1}>
      <div className={general.sameLine}>
        <CreateMenu />
        <JoinMenu />
      </div>
    </div>
  );
}

export default HomeView;
