import React, { Component } from 'react';
import './App.css';
import queryString from "query-string";

import { Container, Row, Col } from 'reactstrap';

import ConnectSpotify from "./components/ConnectSpotify/ConnectSpotify";
import FindSong from "./components/FindSong/FindSong";

class App extends Component {

  state = {
    accessToken: null,
    serverData: {
      user: null
    }
  }

  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token;

    fetch('https://api.spotify.com/v1/me', {
      headers: {
        "Authorization": "Bearer " + accessToken
      }
    }).then((response) => response.json()
      .then(data => {
        if (!data.error) {
          this.setState({ accessToken, serverData: { ...this.state.serverData, user: data } })
        }
      }))
  }

  render() {

    return (
      <div className="App">
        <Container>
          <Row>
            <Col sm="12" md={{ size: 6, offset: 3 }}>
              <h1>Shower Song</h1>
              {this.state.serverData.user ? <div><FindSong accessToken={this.state.accessToken} /></div> : <ConnectSpotify />}
            </Col>
          </Row>
        </Container>
      </div >
    );
  }
}


export default App;
