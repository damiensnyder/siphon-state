import React from 'react';
import io from 'socket.io-client';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "unchanged"
    };
  }

  componentDidMount() {
    this.socket = io();
    this.socket.on('connected', (data) => {
      this.setState({
        text: data.msg
      });
    });
  }

  render() {
    return <div>{this.state.text}</div>;
  }
}

export default Home;
