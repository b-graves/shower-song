import React, { Component } from 'react';
import { Button, Input, Form, FormGroup, Label } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";

class Song extends Component {

    state = {
        playing: false
    }


    msToMins = (ms) => {
        return ms / 60000;
    }

    autoPlay = () => {
        setTimeout(() => {
            let url = new URL('https://api.spotify.com/v1/me/player/queue');

            url.search = new URLSearchParams({
                uri: this.props.song.uri
            });

            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken
                },
                method: 'POST'
            }).then(data => {
                let url = new URL('https://api.spotify.com/v1/me/player/next');
                fetch(url.toString(), {
                    headers: {
                        "Authorization": "Bearer " + this.props.accessToken
                    },
                    method: 'POST'
                })
            });
        }, 2000);

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
                        this.autoPlay();
                    }} >Listen on Spotify</Button>

                    <Button onClick={() => {
                        var win = window.open("https://www.youtube.com/results?search_query=" + this.props.song.external_ids.isrc, '_blank');
                        win.focus();
                    }}>Listen on YouTube</Button>
                    {false ? <iframe title={"track"} src={"https://open.spotify.com/embed/track/" + this.props.song.id} width={"100%"} height={"500px"} frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe> : null}
                    {false ? <iframe title={"yt"} id="ytplayer" type="text/html" width={"100%"} height="360"
                        src={"https://www.youtube.com/embed?listType=search&list=" + this.props.song.external_ids.isrc}
                        frameborder="0"></iframe> : null}
                    <div>
                        {this.props.song.name} - {this.props.song.artists[0].name}
                        Enjoy your {Math.round(this.msToMins(this.props.song.duration_ms) * 2) / 2} Minute Shower!
                        </div>
                </div>
            </div>
        );
    }
}

export default Song;
