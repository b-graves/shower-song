import React, { Component } from 'react';
import './App.css';
import queryString from "query-string";

import { Container, Row, Col } from 'reactstrap';

import ConnectSpotify from "./components/ConnectSpotify/ConnectSpotify";
import FindSongWithAccount from "./components/FindSong/FindSongWithAccount";
import FindSongWithoutAccount from "./components/FindSong/FindSongWithoutAccount"

import FullHeight from "react-full-height";

import Logo from "./assets/logo.svg"
import Animation from "./assets/animation.gif"

import { FaSpotify } from "react-icons/fa"

class App extends Component {

  state = {
    accessToken: null,
    serverData: {
      user: null
    },
    connectedToSpotifyAccount: false,
    stateKnown: false,
    connecting: false
  }

  onClickConnect = () => {
    if (window.location.origin === "http://localhost:3000") {
      console.log("here")
      window.location = "http://localhost:8888/login"
    } else {
      window.location = "http://shower-song-backend.herokuapp.com/login"
    }
    this.setState({connecting: true})
  }

  onClickContinue = () => {
    if (window.location.origin === "http://localhost:3000") {
      console.log("here")
      window.location = "http://localhost:8888/appauth"
    } else {
      window.location = "http://shower-song-backend.herokuapp.com/appauth"
    }
    this.setState({stateKnown: false})
  }


  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token;
    if (parsed.grant_type === "authorization_code") {
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          "Authorization": "Bearer " + accessToken
        }
      }).then((response) => response.json()
        .then(data => {
          if (!data.error) {
            this.setState({ stateKnown: true, connectedToSpotifyAccount: true, accessToken, serverData: { ...this.state.serverData, user: data } })
          }
        }))
    } else {
      this.setState({ accessToken, stateKnown: true })
    }
  }

  render() {

    return (
      <div className="App">

        {this.state.stateKnown ?
          !this.state.connecting ?
            this.state.accessToken ?
              this.state.connectedToSpotifyAccount ?
                <FindSongWithAccount data={this.state.serverData} accessToken={this.state.accessToken} />
                : <FindSongWithoutAccount accessToken={this.state.accessToken} />
              :
              <FullHeight className="start-page__background">
                <Container className="bottom-content">
                  <Row>
                    <Col sm="12" md={{ size: 6, offset: 3 }}>
                      <img className="start-page__logo" src={Logo} alt="Shower Song Logo" />
                      <div className="start-page__title">Shower Song</div>
                      <div className="start-page__quote">
                        “On average an eight minute shower uses around 65 litres of water, which is over three times the amount many people in the developing world rely on for a whole day”
                </div>
                      <div className="start-page__reference">
                        -Tim Wainwright, WaterAid
                </div>
                      <div className="start-page__tagline">
                        Find your perfect song for a shorter shower
                </div>
                      <button onClick={() => this.onClickConnect()} className="start-page__connect-button">
                        <FaSpotify className="button-icon" /> Connect to Spotify
                </button>
                      <div className="start-page__or">
                        or
                </div>
                      <button onClick={() => this.onClickContinue()} className="start-page__continue-without-button">
                        Continue without Spotify
                </button>
                    </Col>
                  </Row>
                </Container>
              </FullHeight>
            :
            <FullHeight className="start-page__background">
              <Container className="central-content">
                <Row>
                  <Col sm="12" md={{ size: 6, offset: 3 }}>
                    <img src={Animation} width={"50%"} alt="loading animation " />
                    <div>
                      Connecting to Spotify...
                  </div>
                  </Col>
                </Row>
              </Container>
            </FullHeight>
            :
        <FullHeight>
          <Container className="central-content">
            <Row>
              <Col sm="12" md={{ size: 6, offset: 3 }}>
                <img src={Animation} width={"50%"} alt="loading animation " />
                <div>
                  Loading...
                </div>
              </Col>
            </Row>
          </Container>
        </FullHeight>
        }
      </div >
    );
  }
}


export default App;
