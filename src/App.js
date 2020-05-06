import React, { Component } from 'react';
import './App.css';
import queryString from "query-string";

import { Container, Row, Col } from 'reactstrap';

import ConnectSpotify from "./components/ConnectSpotify/ConnectSpotify";
import FindSongWithAccount from "./components/FindSong/FindSongWithAccount";

class App extends Component {

  state = {
    accessToken: null,
    serverData: {
      user: null
    },
    connectedToSpotifyAccount: false
  }


  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token;
    console.log(parsed)
    console.log(parsed.grant_type)
    if (parsed.grant_type === "authorization_code") {
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          "Authorization": "Bearer " + accessToken
        }
      }).then((response) => response.json()
        .then(data => {
          if (!data.error) {
            this.setState({ connectedToSpotifyAccount: true, accessToken, serverData: { ...this.state.serverData, user: data } })
          }
        }))
    } else {
      this.setState({ accessToken })
    }
  }

  render() {

    return (
      <div className="App">
        <Container>
          <Row>
            <Col sm="12" md={{ size: 6, offset: 3 }}>
              <h1>Shower Song</h1>
              {this.state.accessToken ? 
                this.state.connectedToSpotifyAccount ? 
                <div><FindSongWithAccount accessToken={this.state.accessToken} /></div>
                : null
                : <ConnectSpotify setConnected={connected => this.setConnected(connected)} />}
            </Col>
          </Row>
        </Container>
      </div >
    );
  }
}


export default App;
