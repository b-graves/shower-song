import React, { Component } from 'react';
import { Button } from 'reactstrap';

import "./ConnectSpotify.css";

class ConnectSpotify extends Component {
    state = {

    }

    onClick = () => {
        window.location="http://localhost:8888/login"
    }

    render() {
        return (
            <Button onClick={() => this.onClick()} className="spotify-connect__button" color="success">Connect to your Spotify account</Button>
        );
    }
}

export default ConnectSpotify;
