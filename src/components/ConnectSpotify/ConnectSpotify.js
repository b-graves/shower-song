import React, { Component } from 'react';
import { Button } from 'reactstrap';

import "./ConnectSpotify.css";

class ConnectSpotify extends Component {
    state = {

    }

    onClick = () => {
        console.log(window.location)
        if (window.location.origin === "http://localhost:3000") {
            console.log("here")
            window.location="http://localhost:8888/login"
        } else {
            window.location="http://shower-song-backend.herokuapp.com/login"
        }
        
    }

    render() {
        return (
            <Button onClick={() => this.onClick()} className="spotify-connect__button" color="success">Connect to your Spotify account</Button>
        );
    }
}

export default ConnectSpotify;
