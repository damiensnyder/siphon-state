import React from 'react';
import Link from 'next/link';
import Router from 'next/router'

class Error404 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secondsUntilRedirect: 5
    };
  }

  componentDidMount() {
    this.redirectTimer = setInterval(
      () => this.tickRedirect(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.redirectTimer);
  }

  tickRedirect() {
    this.setState({
      secondsUntilRedirect: this.state.secondsUntilRedirect - 1
    });
    if (this.state.secondsUntilRedirect === 0) {
      clearInterval(this.redirectTimer);
      Router.push('/');
    }
  }

  render() {
    return (
      <p>
        Page not found. Redirecting to <Link href="/"><a>home page</a></Link>
        in {this.state.secondsUntilRedirect} seconds.
      </p>
    );
  }
}

export default Error404;
