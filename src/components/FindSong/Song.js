import React, { Component } from 'react';
import { Button, Input, Form, FormGroup, Label } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";

import { FaSpotify, FaYoutube } from "react-icons/fa"

class Song extends Component {

    state = {
        playing: false,
        deviceFound: false,
        device: null,
        deviceAttempts: 0,
        playAttempts: 0
    }


    msToMins = (ms) => {
        return ms / 60000;
    }

    isMobile = () => {
        console.log(navigator.userAgent)
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    // findDevice = () => {
    //     if (!this.state.deviceFound && this.state.deviceAttempts < 10) {
    //         setTimeout(() => {
    //             let url = new URL('https://api.spotify.com/v1/me/player/devices');
    //             fetch(url.toString(), {
    //                 headers: {
    //                     "Authorization": "Bearer " + this.props.accessToken
    //                 }
    //             }).then((response) => response.json()
    //                 .then(data => {
    //                     if (!data.error) {
    //                         if (this.isMobile()) {
    //                             if (data.devices.length > 0) {
    //                                 if (this.state.deviceAttempts < 8) {
    //                                     let chosenDevice = null;
    //                                     data.devices.forEach(device => {
    //                                         if (device.type === "Smartphone") {
    //                                             chosenDevice = device
    //                                         }
    //                                     });
    //                                     if (chosenDevice) {
    //                                         this.setState({ device: chosenDevice, deviceFound: true }, () => this.autoPlay())
    //                                     } else {
    //                                         this.setState({ deviceFound: false, deviceAttempts: this.state.deviceAttempts + 1 })
    //                                     }
    //                                 } else {
    //                                     let chosenDevice = data.devices[data.devices.length - 1];
    //                                     data.devices.forEach(device => {
    //                                         if (device.is_active) {
    //                                             chosenDevice = device
    //                                         }
    //                                     });
    //                                     data.devices.forEach(device => {
    //                                         if (device.type === "Smartphone") {
    //                                             chosenDevice = device
    //                                         }
    //                                     });
    //                                     this.setState({ device: chosenDevice, deviceFound: true }, () => this.autoPlay())
    //                                 }
    //                             } else {
    //                                 this.setState({ deviceFound: false, deviceAttempts: this.state.deviceAttempts + 1 })
    //                                 this.findDevice();
    //                             }
    //                         } else {
    //                             if (data.devices.length > 0) {
    //                                 console.log(data.devices)
    //                                 let chosenDevice = data.devices[data.devices.length - 1];
    //                                 data.devices.forEach(device => {
    //                                     if (device.is_active) {
    //                                         chosenDevice = device
    //                                     }
    //                                 });
    //                                 this.setState({ device: chosenDevice, deviceFound: true }, () => this.autoPlay())
    //                             } else {
    //                                 this.setState({ deviceFound: false, deviceAttempts: this.state.deviceAttempts + 1 })
    //                                 this.findDevice();
    //                             }
    //                         }
    //                     } else {
    //                         this.setState({ device: false, deviceAttempts: this.state.deviceAttempts + 1 })
    //                         this.findDevice();
    //                     }
    //                 })
    //                 .catch((error) => {
    //                     this.setState({ criticalError: true, errorMessage: "Could not load recently played" })
    //                 })
    //             )
    //         }, 1000);
    //     }
    // }

    // autoPlay = () => {
    //     console.log(this.state.device)
    //     if (!this.state.playing && this.state.playAttempts < 30) {
    //         setTimeout(() => {
    //             let url = new URL('https://api.spotify.com/v1/me/player/play');
    //             url.search = new URLSearchParams({ device_id: this.state.device.id });
    //             fetch(url.toString(), {
    //                 headers: {
    //                     "Authorization": "Bearer " + this.props.accessToken
    //                 },
    //                 method: 'PUT',
    //                 uris: [this.props.song.uri]
    //             }).then((response) => response.json()
    //                 .then(data => {
    //                     if (data.okay) {
    //                         console.log("playing")
    //                         this.setState({ playing: true });
    //                     } else {
    //                         console.log("not playing")
    //                         this.setState({ playing: false, playAttempts: this.state.playAttempts + 1 })
    //                         this.autoPlay();
    //                     }
    //                 }
    //                 )
    //                 .catch(error => this.setState({ playing: true }))
    //             )
    //         }, 1000);
    //     }
    // }

    autoPlay = () => {
        for (let timeout = 1000; timeout < 10000; timeout += 1000) {
            setTimeout(() => {
                if (!this.state.playing) {
                    let url = new URL('https://api.spotify.com/v1/me/player/devices');
                    fetch(url.toString(), {
                        headers: {
                            "Authorization": "Bearer " + this.props.accessToken
                        }
                    }).then((response) => response.json()
                        .then(data => {
                            let chosenDevice = null;
                            data.devices.forEach(device => {
                                if (device.type === "Smartphone") {
                                    chosenDevice = device
                                }
                            });

                            let bodyData = { uris: [this.props.song.uri] }

                            url = new URL('https://api.spotify.com/v1/me/player/play');
                            if (chosenDevice) {
                                url.search = new URLSearchParams({ device_id: chosenDevice.id });
                            }

                            fetch(url.toString(), {
                                headers: {
                                    "Authorization": "Bearer " + this.props.accessToken
                                },
                                method: 'PUT',
                                body: JSON.stringify(bodyData)
                            }).then((response) => {
                                if (response.status === 204 || response.status === 200) {
                                    console.log("playing")
                                    this.setState({playing: true})
                                }
                            })
                            // .then(data => {
                            //     console.log(data)
                            //     if (!data.error) {
                            //         console.log("playing")
                            //         this.setState({playing: true})
                            //     }
                            // }).catch(error => console.log(error))
                        // )
                        })
                    )
                }
            }, timeout);
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
                                if (!this.isMobile) {
                                    var win = window.open("https://open.spotify.com/go?uri=" + this.props.song.uri + "?play=true")
                                    win.focus();
                                } else {
                                    var win = window.open(this.props.song.uri + "?highlight=" + this.props.song.uri, '_blank');
                                    win.focus();
                                    this.autoPlay();
                                }
                                // this.setState({deviceFound: false, playing: false}, () => this.findDevice())
                            }} ><FaSpotify className="button-icon" /> Listen on Spotify...</button>
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
