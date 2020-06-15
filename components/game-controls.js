import React from 'react';
import styles from './game-controls.module.css';
import PolCategory from './pol-category';

class GameControls extends React.Component {
  constructor(props) {
    super(props);
  }

  // TODO: actually write this shit, cmon
  render() {
    const gs = this.props.gs;
    const self = gs.parties[gs.pov];
    const available = [];
    const unavailable = [];
    const symps = [];

    for (let i = 0; i < self.politicians.length; i++) {
      let pol = self.politicians[i];
      if (gs.politicians[pol].available) {
        available.push(pol);
      } else {
        unavailable.push(pol);
      }
    }

    for (let i = 0; i < self.symps.length; i++) {
      symps.push(self.symps[i]);
    }

    return (
      <div className={styles.outerWrapper}>
        <div className={styles.innerWrapper}>
          <div>
            <PolCategory gs={gs}
                         type={"Available"}
                         pols={available} />
          </div>
          <div>
            <PolCategory gs={gs}
                         type={"Unavailable"}
                         pols={unavailable} />
          </div>
          <div>
            <PolCategory gs={gs}
                         type={"Sympathizers"}
                         pols={symps} />
          </div>
        </div>
      </div>
    );
  }
}

export default GameControls;
