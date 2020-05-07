import React, { Component } from 'react';
import { Button, CustomInput, Form, FormGroup, Label } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";

import Song from  "./Song"
import Preferences from "./Preferences"

class FindSongWithAccount extends Component {
    state = {
        candidates: [],
        song: null,
        topArtists: null,
        topTracks: null,
        secondaryArtists: null,
        secondaryTracks: null,
        recentTracks: null,
        discoverWeekly: null,
        genreSeeds: null,
        generating: false,
        gettingReccomendations: false,
        candidatesFiltered: false,
        awaiting: {},
        awaitingFeatures: false,
        nothingKnown: false,
        submitted: false,
        preferences: {
            familiar: false,
            energy: 50,
            danceability: 50,
            instrumentalness: 50,
            popularity: 50,
            valence: 50,
            acousticness: 50,
            duration: 4
        }
    }

    onClick = () => {
        this.setState({ submitted: true })
        let url = new URL('https://api.spotify.com/v1/me/top/artists');
        url.search = new URLSearchParams({ limit: 50 });
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken,

            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    this.setState({ topArtists: data })
                }
            }))

        url = new URL('https://api.spotify.com/v1/me/top/tracks');
        url.search = new URLSearchParams({ limit: 50 });
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken
            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    this.setState({ topTracks: data })
                }
            }))

        url = new URL('https://api.spotify.com/v1/me/albums');
        url.search = new URLSearchParams({ limit: 50 });
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken,

            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    this.setState({ secondaryArtists: data.items.map(album => album.album.artists[0]) })
                }
            }))

        url = new URL('https://api.spotify.com/v1/me/tracks');
        url.search = new URLSearchParams({ limit: 50 });
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken
            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    this.setState({ secondaryTracks: data.items.map(track => track.track) })
                }
            }))

        url = new URL('https://api.spotify.com/v1/me/playlists');
        url.search = new URLSearchParams({ limit: 50 });
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken
            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    data.items.forEach(playlist => {
                        if (playlist.name === "Discover Weekly") {

                            url = new URL('https://api.spotify.com/v1/playlists/' + playlist.id + '/tracks');
                            url.search = new URLSearchParams({ limit: 50 });
                            fetch(url.toString(), {
                                headers: {
                                    "Authorization": "Bearer " + this.props.accessToken
                                }
                            }).then((response) => response.json()
                                .then(data => {
                                    if (!data.error) {
                                        this.setState({ discoverWeekly: data.items.map(track => track.track) })
                                    }
                                }))
                        }
                    })
                }
            }))

        url = new URL('https://api.spotify.com/v1/me/player/recently-played');
        url.search = new URLSearchParams({ limit: 50 });
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken
            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    this.setState({ recentTracks: data.items.map(track => track.track) })
                }
            }))

        url = new URL('https://api.spotify.com/v1/recommendations/available-genre-seeds');
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

    minsToMs = (mins) => {
        return mins * 60000;
    }

    msToMins = (ms) => {
        return ms / 60000;
    }

    shuffle = (a) => {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    randomItem = (items) => {
        return items[Math.floor(Math.random() * items.length)]
    }

    getReccommendations = (type, values) => {
        if (type === "tracks") {
            console.log(values)
        }
        let url = new URL('https://api.spotify.com/v1/recommendations');
        values = this.shuffle(values.filter(value => value !== undefined))
        for (let i = 0; i < values.length; i += 5) {
            url.search = new URLSearchParams({
                limit: 20,
                ["seed_" + type]: values.slice(i, i + 5).map(value => type === "genres" ? value : value.id).join(","),
                min_duration_ms: this.minsToMs(this.state.preferences.duration - 0.25),
                max_duration_ms: this.minsToMs(this.state.preferences.duration + 0.25),

                target_acousticness: this.state.preferences.acousticness / 100,
                target_danceability: this.state.preferences.energy / 100,
                target_energy: this.state.preferences.energy / 100,
                target_instrumentalness: this.state.preferences.instrumentalness / 100,
                // target_popularity: this.state.preferences.popularity,
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

    getCandidates = () => {
        if (!this.state.preferences.familiar || this.state.nothingKnown) {
            let genres = [];
            let topGenres = {};
            this.state.topArtists.items.forEach(artist => { if (genres in artist) { genres = genres.concat(artist.genres) } });

            genres = genres.filter(genre => this.state.genreSeeds.includes(genre))

            genres.forEach(genre => {
                if (genre in topGenres) {
                    topGenres[genre] += 1;
                } else {
                    topGenres[genre] = 1;
                }
            })

            const genresSorted = Object.keys(topGenres).sort(function (a, b) { return topGenres[b] - topGenres[a] })

            this.setState({ gettingReccomendations: true, generating: true, candidates: this.state.discoverWeekly }, () => {
                console.log(this.state.discoverWeekly)
                this.getReccommendations("tracks", this.state.topTracks.items.concat(this.state.secondaryTracks).concat(this.state.recentTracks).concat(this.state.discoverWeekly))
                this.getReccommendations("artists", this.state.topArtists.items.concat(this.state.secondaryArtists))
                if (genresSorted.length > 0) {
                    this.getReccommendations("genres", genresSorted)
                }
                this.setState({ gettingReccomendations: false })
            });
        } else {
            this.setState({ generating: true, candidates: this.state.topTracks.items.concat(this.state.secondaryTracks).concat(this.state.recentTracks) })
        }
    }

    filterCandidates = () => {
        if (!this.state.preferences.familiar || this.state.nothingKnown) {
            const topArtistIds = this.state.topArtists.items.map(artist => artist.id);
            let candidates = this.state.candidates.filter(candidate => !topArtistIds.includes(candidate.artists[0].id));

            let topTracks = {};

            candidates.forEach(track => {
                if (track.id in topTracks) {
                    topTracks[track.id] = {
                        ...topTracks[track.id],
                        count: topTracks[track.id].count + 1
                    }
                } else {
                    topTracks[track.id] = {
                        track,
                        count: 1
                    }
                }
            })

            topTracks = Object.values(topTracks).sort(function (a, b) { return b.count - a.count })
            // let maxCount = Math.max(...topTracks.map(track => track.count))

            // topTracks = topTracks.filter(track => track.count >= maxCount - 2)

            this.setState({ candidates: topTracks.map(track => track.track), candidatesFiltered: true })
        } else {
            console.log(this.state.candidates)
            this.setState({ candidatesFiltered: true, candidates: this.state.candidates.filter(candidate => candidate.duration_ms >= this.minsToMs(this.state.preferences.duration - 0.25) && candidate.duration_ms <= this.minsToMs(this.state.preferences.duration + 0.25)) })
        }
    }

    mse = (a, b) => {
        let error = 0
        for (let i = 0; i < a.length; i++) {
            error += Math.pow((b[i] - a[i]), 2)
        }
        return error / a.length
    }

    getFeatures = () => {
        this.setState({ awaitingFeatures: true }, () => {
            let url = new URL('https://api.spotify.com/v1/audio-features');

            url.search = new URLSearchParams({
                ids: this.state.candidates.slice(0, 100).map(candidate => candidate.id)
            });

            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        if (data.audio_features[0] === null) {
                            this.setState({
                                candidates: [],
                                song: null,
                                generating: false,
                                gettingReccomendations: false,
                                candidatesFiltered: false,
                                awaiting: {},
                                awaitingFeatures: false,
                                nothingKnown: true
                            })
                        } else {
                            let audioFeatures = data.audio_features.map(features => {
                                return {
                                    ...features, mse: this.mse(
                                        [features.energy, features.danceability, features.valence, features.instrumentalness, features.instrumentalness, features.instrumentalness, features.acousticness],
                                        [this.state.preferences.energy / 100, this.state.preferences.energy / 100, this.state.preferences.energy / 100, this.state.preferences.instrumentalness / 100, this.state.preferences.instrumentalness / 100, this.state.preferences.instrumentalness / 100, this.state.preferences.acousticness / 100]
                                    )
                                }
                            }
                            );
                            audioFeatures.sort(function (a, b) { return a.mse - b.mse })
                            let bestMatch = audioFeatures[0]
                            console.log(bestMatch)
                            this.state.candidates.forEach(candidate => {
                                if (candidate.id === bestMatch.id) {
                                    console.log(candidate)
                                    this.setState({ song: candidate })
                                }
                            })
                        }
                    }
                }))

        })
    }

    componentDidUpdate() {
        if (!this.state.song && this.state.discoverWeekly && this.state.topArtists && this.state.topTracks && this.state.secondaryArtists && this.state.secondaryTracks && this.state.genreSeeds && !this.state.song && !this.state.generating) {
            this.getCandidates()
        } else if (!this.state.candidatesFiltered && Object.values(this.state.awaiting).every(awaiting => !awaiting) && this.state.generating && !this.state.gettingReccomendations) {
            this.filterCandidates()
        } else if (this.state.candidatesFiltered && !this.state.awaitingFeatures) {
            this.getFeatures()
        }
    }

    render() {
        return (
            this.state.song ?
                <div>
                    <Song 
                        song={this.state.song}
                        preferences={this.state.preferences}
                        nothingKnown={this.state.nothingKnown}
                        showSpotify={true}
                        showYouTube={false}
                    />
                    <Button
                        className="spotify-connect__button"
                        onClick={() => this.setState({
                            candidates: [],
                            song: null,
                            topArtists: null,
                            topTracks: null,
                            secondaryArtists: null,
                            secondaryTracks: null,
                            recentTracks: null,
                            discoverWeekly: null,
                            genreSeeds: null,
                            generating: false,
                            gettingReccomendations: false,
                            candidatesFiltered: false,
                            awaiting: {},
                            awaitingFeatures: false,
                            nothingKnown: false,
                            submitted: false,
                        })} >Start Again</Button>
                </div>
                :
                !this.state.submitted ?
                    <div>
                        <Preferences 
                            preferences={this.state.preferences}
                            setPreferences={preferences => this.setState({preferences})} 
                            showFamiliarity={true}
                            showGenres={false}
                        />
                        <Button onClick={() => this.onClick()} className="spotify-connect__button" color="primary">Find Your Song</Button>
                    </div>
                    :
                    <div>
                        Finding you the perfect song...
                </div>
        );
    }
}

export default FindSongWithAccount;
