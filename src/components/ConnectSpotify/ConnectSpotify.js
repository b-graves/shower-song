import React, { Component } from 'react';
import { Button } from 'reactstrap';

import "./ConnectSpotify.css";

class ConnectSpotify extends Component {
    state = {

    }

    render() {
        return (
            <Button className="spotify-connect__button" color="success">Connect to your Spotify account</Button>
        );
    }
}

export default ConnectSpotify;
