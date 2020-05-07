import React, { Component } from 'react';
import { Button, Input, Form, FormGroup, Label } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";
import Preferences from './Preferences';
import Song from './Song';

class FindSongWithoutAccount extends Component {
    state = {
        genreSeeds: [],
        candidates: [],
        awaiting: {},
        song: null,
        preferences: {
            familiar: false,
            energy: 50,
            danceability: 50,
            instrumentalness: 50,
            popularity: 50,
            valence: 50,
            acousticness: 50,
            duration: 4,
            genres: [
                {
                    title: "Ambient",
                    seeds: ["ambient", "sleep", "chill"],
                    selected: false
                },
                {
                    title: "Classical",
                    seeds: ["classical"],
                    selected: false
                },
                {
                    title: "Dance",
                    seeds: ["dance", "disco", "party", "idm"],
                    selected: false
                },
                {
                    title: "Electronic",
                    seeds: ["electronic", "electro", "breakbeat", "drum-and-bass", "dub", "dubstep", "garage", "idm", "trance"],
                    selected: false
                },
                {
                    title: "Folk",
                    seeds: ["folk", "country", "acoustic"],
                    selected: false
                },
                {
                    title: "Hip Hop",
                    seeds: ["hip-hop"],
                    selected: false
                },
                {
                    title: "House",
                    seeds: ["house", "progressive-house", "chicago-house", "deep-house", "breakbeat", "garage"],
                    selected: false
                },
                {
                    title: "Indie Rock",
                    seeds: ["indie", "indie-pop", "alt-rock", "alternative"],
                    selected: false
                },
                {
                    title: "Jazz",
                    seeds: ["jazz", "blues", "funk"],
                    selected: false
                },
                {
                    title: "Latin",
                    seeds: ["latin", "latino", "salsa", "reggaeton", "brazil", "bossanova", "forro", "spanish", "tango"],
                    selected: false
                },
                {
                    title: "Metal",
                    seeds: ["metal", "heavy-metal", "black-metal", "death-metal", "metal-misc", "grunge"],
                    selected: false
                },
                {
                    title: "Pop",
                    seeds: ["pop", "indie-pop", "synth-pop", "k-pop", "j-pop", "afrobeat"],
                    selected: false
                },
                {
                    title: "Reggae",
                    seeds: ["reggae"],
                    selected: false
                },
                {
                    title: "Rock",
                    seeds: ["rock", "hard-rock", "alt-rock", "rock-n-roll", "grunge", "psych-rock", "guitar", "j-rock"],
                    selected: false
                },
                {
                    title: "Soul",
                    seeds: ["soul"],
                    selected: false
                },
                {
                    title: "Techno",
                    seeds: ["techno", "detroit-techno", "minimal-techno", "industrial"],
                    selected: false
                },
            ]
        }
    }

    shuffle = (a) => {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    getReccommendations = (type, values) => {

        let url = new URL('https://api.spotify.com/v1/recommendations');
        values = this.shuffle(values.filter(value => value !== undefined))
        for (let i = 0; i < values.length; i += 5) {
            url.search = new URLSearchParams({
                limit: 100,
                ["seed_" + type]: values.slice(i, i + 5).map(value => type === "genres" ? value : value.id).join(","),
                min_duration_ms: this.minsToMs(this.state.preferences.duration - 0.25),
                max_duration_ms: this.minsToMs(this.state.preferences.duration + 0.25),

                target_acousticness: this.state.preferences.acousticness / 100,
                target_danceability: this.state.preferences.energy / 100,
                target_energy: this.state.preferences.energy / 100,
                target_instrumentalness: this.state.preferences.instrumentalness / 100,
                target_valence: this.state.preferences.energy / 100,
            });
            this.setState({ awaiting: { ...this.state.awaiting, [type + i]: true } })
            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        this.setState({
                            candidates: this.state.candidates.concat(data.tracks),
                            awaiting: { ...this.state.awaiting, [type + i]: false }
                        })
                    } else {
                        this.setState({ awaiting: { [type + i]: false } })
                    }
                }))
        }
    }

    onClick = () => {
        let seeds = []
        this.state.preferences.genres.forEach(genre => {
            if (genre.selected) {
                seeds = seeds.concat(genre.seeds)
            }
        })
        this.getReccommendations("genres", seeds.filter(seed => this.state.genreSeeds.includes(seed)))
    }

    componentDidMount() {
        const url = new URL('https://api.spotify.com/v1/recommendations/available-genre-seeds');
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken
            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    this.setState({ genreSeeds: data.genres });
                }
            }))
    }

    componentDidUpdate() {
        console.log(this.state.awaiting)
        if (!this.state.song && Object.values(this.state.awaiting).length > 0 && Object.values(this.state.awaiting).every(awaiting => !awaiting)) {
            // this.checkVideo(this.state.candidates[0])
            this.setState({ song: this.state.candidates[0] })
        }
    }

    minsToMs = (mins) => {
        return mins * 60000;
    }

    msToMins = (ms) => {
        return ms / 60000;
    }

    render() {
        return (
            this.state.song ?
                <Song
                    song={this.state.song}
                    preferences={this.state.preferences}
                    nothingKnown={this.state.nothingKnown}
                    showSpotify={false}
                    showYouTube={true}
                />
                :
                <div>
                    <Preferences
                        preferences={this.state.preferences}
                        setPreferences={preferences => this.setState({ preferences })}
                        showFamiliarity={false}
                        showGenres={true}
                    />
                    <Button onClick={() => this.onClick()} className="spotify-connect__button" color="primary">Find Your Song</Button>
                </div >
        );
    }
}

export default FindSongWithoutAccount;
