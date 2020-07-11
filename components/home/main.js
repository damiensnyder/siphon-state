import React from 'react';

import CreateMenu from './create-menu';
import JoinMenu from './join-menu';
import general from '../general.module.css';
import styles from './main.module.css';

function HomeView() {
  return (
    <div className={general.horizWrapper}
         id={styles.mainBody}>
      <CreateMenu />
      <JoinMenu />
    </div>
  );
}

export default HomeView;
