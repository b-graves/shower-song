import React, { Component } from 'react';
import { Button, Input, Form, FormGroup, Label } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";

class Song extends Component {


    msToMins = (ms) => {
        return ms / 60000;
    }

    render() {
        console.log(this.props.song)
        return (
            <div>
                {this.props.nothingKnown ? "We couldn't find anything you know around " + this.props.preferences.duration + " minutes long, but we thought you might like this..." : null}
                <div>
                    <Button onClick={() => {
                        var win = window.open(this.props.song.external_urls.spotify, '_blank');
                        win.focus();
                    }} >Listen on Spotify Online</Button>

                    <Button onClick={() => {
                        var win = window.open(this.props.song.uri, '_blank');
                        win.focus();
                    }} >Listen on Spotify App</Button>
                    <Button onClick={() => {
                        var win = window.open("https://www.youtube.com/results?search_query="+this.props.song.external_ids.isrc, '_blank');
                        win.focus();
                    }}>Listen on YouTube</Button>
                    {this.props.showSpotify ? <iframe title={"track"} src={"https://open.spotify.com/embed/track/" + this.props.song.id} width={"100%"} height={"500px"} frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe> : null}
                    {false ? <iframe title={"yt"} id="ytplayer" type="text/html" width={"100%"} height="360"
                        src={"https://www.youtube.com/embed?listType=search&list=" + this.props.song.external_ids.isrc}
                        frameborder="0"></iframe> : null}
                    <div>
                        Enjoy your {Math.round(this.msToMins(this.props.song.duration_ms) * 2) / 2} Minute Shower!
                        </div>
                </div>
            </div>
        );
    }
}

export default Song;
