import React from 'react';

import styles from './pol-category.module.css';
import Pol from './pol';

class PolCategory extends React.Component {
  constructor(props) {
    super(props);

    this.polsToJsx = this.polsToJsx.bind(this);
  }

  polsToJsx() {
    const polsJsx = [];
    for (let i = 0; i < this.props.pols.length; i++) {
      if (this.props.pols[i] < 0) {
        polsJsx.push(<div>uh</div>);
      } else {
        polsJsx.push(
          <Pol gs={this.props.gs}
               callback={this.props.callback}
               index={this.props.pols[i]}
               inProvince={this.props.inProvince}
               key={i} />
        );
      }
    }

    return polsJsx;
  }

  render() {
    return (
      <div className={styles.outerWrapper}>
        <h3 className={styles.categoryName}>
          {this.props.type}
        </h3>
        {this.polsToJsx()}
      </div>
    );
  }
}

export default PolCategory;
