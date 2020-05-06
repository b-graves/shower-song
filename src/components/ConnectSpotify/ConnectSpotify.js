import React, { Component } from 'react';
import { Button } from 'reactstrap';

import "./ConnectSpotify.css";

class ConnectSpotify extends Component {
    state = {

    }

    onClickConnect = () => {
        if (window.location.origin === "http://localhost:3000") {
            console.log("here")
            window.location = "http://localhost:8888/login"
        } else {
            window.location = "http://shower-song-backend.herokuapp.com/login"
        }
    }

    onClickContinue = () => {
        if (window.location.origin === "http://localhost:3000") {
            console.log("here")
            window.location = "http://localhost:8888/appauth"
        } else {
            window.location = "http://shower-song-backend.herokuapp.com/appauth"
        }
    }

    render() {
        return (
            <div>
                <Button onClick={() => this.onClickConnect()} className="spotify-connect__button" color="success">Connect to your Spotify account</Button>
                <Button onClick={() => this.onClickContinue()} className="spotify-connect__button" color="secondary">Continue without a Spotify account</Button>
            </div>
        );
    }
}

export default ConnectSpotify;
