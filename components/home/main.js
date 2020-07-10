import React from 'react';

import CreateMenu from './create-menu';
import JoinMenu from './join-menu';
import styles from './main.module.css';

function HomeView() {
  return (
    <div id={styles.containerLevel1}>
      <CreateMenu />
      <JoinMenu />
    </div>
  );
}

export default HomeView;
