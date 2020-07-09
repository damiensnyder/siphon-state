import React from 'react';

import CreateMenu from './create-menu';
import styles from './main.module.css';

function HomeView() {
  return (
    <div id={styles.containerLevel1}>
      <CreateMenu />
    </div>
  );
}

export default HomeView;
