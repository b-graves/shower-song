import React, { Component } from 'react';
import { Button, Input, Form, FormGroup, Label } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";

import { FaSpotify, FaYoutube } from "react-icons/fa"

class Song extends Component {

    state = {
        playing: false,
        playAttempts: 0
    }


    msToMins = (ms) => {
        return ms / 60000;
    }

    autoPlay = () => {
        if (!this.state.playing && this.state.playAttempts < 30) {
            setTimeout(() => {
                console.log("trying to play")
                let url = new URL('https://api.spotify.com/v1/me/player/play');
                fetch(url.toString(), {
                    headers: {
                        "Authorization": "Bearer " + this.props.accessToken
                    },
                    method: 'PUT',
                    uris: [this.props.song.uri]
                }).then((response) => response.json()
                .then(data => {
                    if (data.okay) {
                        console.log("playing")
                        this.setState({playing: true});
                    } else {
                        console.log("not playing")
                        this.setState({playing: false, playAttempts: this.state.playAttempts + 1})
                        this.autoPlay();
                    }
                }
                )
                .catch(error => this.setState({playing: true}))
                )
            }, 1000);
        }

    }

    render() {
        return (
            <div>
                <div className="song__message">
                    {this.props.nothingKnown ? "We couldn't find anything you know around " + this.props.preferences.duration + " minutes long, but we thought you might like this..." : "We reccommend..."}
                </div>
                <img className="song__image" alt={this.props.song.name + " - " + this.props.song.artists[0].name + " album artwork"} src={this.props.song.album.images[0].url} />
                <div className="song__name">
                    {this.props.song.name}
                </div>
                <div className="song__artist">
                    {this.props.song.artists.map(artist => artist.name).join(", ")}
                </div>
                <div>
                    <div>
                        <button
                            className={"song__listen-button song__listen-button--spotify"}
                            onClick={() => {
                                var win = window.open(this.props.song.external_urls.spotify, '_blank');
                                win.focus();
                                this.autoPlay();
                            }} ><FaSpotify className="button-icon" /> Listen on Spotify</button>
                    </div>
                    <div>
                        <button
                            className={"song__listen-button song__listen-button--youtube"}
                            onClick={() => {
                                if (this.props.youtubeResults) {
                                    var win = window.open("https://www.youtube.com/results?search_query=" + this.props.song.external_ids.isrc, '_blank');
                                    win.focus();
                                } else {
                                    var win = window.open("https://www.youtube.com/results?search_query=" + this.props.song.artists[0].name + " - " + this.props.song.name, '_blank');
                                    win.focus();
                                }
                            }}><FaYoutube className="button-icon" /> Listen on YouTube</button>
                    </div>
                    {false ? <iframe title={"track"} src={"https://open.spotify.com/embed/track/" + this.props.song.id} width={"100%"} height={"500px"} frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe> : null}
                    {false ? <iframe title={"yt"} id="ytplayer" type="text/html" width={"100%"} height="360"
                        src={"https://www.youtube.com/embed?listType=search&list=" + this.props.song.external_ids.isrc}
                        frameborder="0"></iframe> : null}
                    <div className={"song__enjoy"}>
                        Enjoy your {Math.round(this.msToMins(this.props.song.duration_ms) * 2) / 2} Minute Shower!
                    </div>
                </div>
            </div>
        );
    }
}

export default Song;
