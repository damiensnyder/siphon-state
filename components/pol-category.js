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
    for (let i = 0; i < this.props.pols; i++) {
      polsJsx.append(
        <Pol gs={this.props.gs}
             index={i}
             key={i} />
      )
    }

    return (<div>{polsJsx}</div>);
  }

  render() {
    return (
      <div>
        <h3>{this.props.type}</h3>
        {this.polsToJsx()}
      </div>
    );
  }
}

export default PolCategory;
