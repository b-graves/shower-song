import React, { Component } from 'react';
import { Button, CustomInput, Form, FormGroup, Label } from 'reactstrap';

import "./FindSong.css";

class FindSong extends Component {
    state = {
        candidates: [],
        song: null,
        topArtists: null,
        topTracks: null,
        secondaryArtists: null,
        secondaryTracks: null,
        genreSeeds: null,
        generating: false,
        gettingReccomendations: false,
        candidatesFiltered: false,
        awaiting: {},
        awaitingFeatures: false,
        preferences: {
            familiar: false,
            energy: 50,
            danceability: 50,
            instrumentalness: 50,
            popularity: 50,
            valence: 50,
            acousticness: 50
        }
    }

    onClick = () => {
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

        url = new URL('https://api.spotify.com/v1/me/top/artists');
        url.search = new URLSearchParams({ limit: 50, offset: 50 });
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken,

            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    console.log(data)
                    this.setState({ secondaryArtists: data })
                }
            }))

        url = new URL('https://api.spotify.com/v1/me/top/tracks');
        url.search = new URLSearchParams({ limit: 50, offset: 50 });
        fetch(url.toString(), {
            headers: {
                "Authorization": "Bearer " + this.props.accessToken
            }
        }).then((response) => response.json()
            .then(data => {
                if (!data.error) {
                    console.log(data)
                    this.setState({ secondaryTracks: data })
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

    getReccommendations = (type, values) => {
        let url = new URL('https://api.spotify.com/v1/recommendations');
        for (let i = 0; i < values.length; i += 5) {
            url.search = new URLSearchParams({
                limit: 10,
                ["seed_" + type]: values.slice(i, i + 5).map(value => type === "genres" ? value : value.id).join(","),
                min_duration_ms: this.minsToMs(3),
                max_duration_ms: this.minsToMs(5),

                target_acousticness: this.state.preferences.acousticness / 100,
                // target_danceability: this.state.preferences.energy / 100,
                target_energy: this.state.preferences.energy / 100,
                target_instrumentalness: this.state.preferences.instrumentalness / 100,
                // target_popularity: this.state.preferences.popularity,
                target_valence: this.state.preferences.energy / 100,
            });
            this.setState({ awaiting: { ...this.state.awaiting, ["artists" + i]: true } })
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
        if (!this.state.preferences.familiar) {
            let genres = [];
            let topGenres = {};
            this.state.topArtists.items.forEach(artist => { genres = genres.concat(artist.genres) });

            genres = genres.filter(genre => this.state.genreSeeds.includes(genre))

            genres.forEach(genre => {
                if (genre in topGenres) {
                    topGenres[genre] += 1;
                } else {
                    topGenres[genre] = 1;
                }
            })

            const genresSorted = Object.keys(topGenres).sort(function (a, b) { return topGenres[b] - topGenres[a] })

            this.setState({ gettingReccomendations: true, generating: true }, () => {
                this.getReccommendations("tracks", this.state.topTracks.items.concat(this.state.secondaryTracks.items))
                this.getReccommendations("artists", this.state.topArtists.items.concat(this.state.secondaryArtists.items))
                if (genresSorted.length > 0) {
                    this.getReccommendations("genres", genresSorted)
                }
                this.setState({ gettingReccomendations: false })
            });
        } else {
            this.setState({ generating: true, candidates: this.state.topTracks.items.concat(this.state.secondaryTracks.items) })
        }
    }

    filterCandidates = () => {
        if (!this.state.preferences.familiar) {
            const topArtistIds = this.state.topArtists.items.map(artist => artist.id);
            let candidates = this.state.candidates.filter(candidate =>  !topArtistIds.includes(candidate.artists[0].id ));

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
            this.setState({ candidatesFiltered: true })
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
                        let audioFeatures = data.audio_features.map(features => {
                            return {
                                ...features, mse: this.mse(
                                    [features.energy, features.instrumentalness, features.instrumentalness, features.instrumentalness, features.acousticness],
                                    [this.state.preferences.energy / 100, this.state.preferences.instrumentalness / 100, this.state.preferences.instrumentalness / 100, this.state.preferences.instrumentalness / 100, this.state.preferences.acousticness / 100]
                                )
                            }
                        }
                        );
                        audioFeatures.sort(function (a, b) { return a.mse - b.mse })
                        let bestMatch = audioFeatures[0]
                        this.state.candidates.forEach(candidate => {
                            if (candidate.id === bestMatch.id) {
                                this.setState({ song: candidate })
                            }
                        })
                    }
                }))

        })
    }

    componentDidUpdate() {
        if (!this.state.song && this.state.topArtists && this.state.topTracks && this.state.secondaryArtists && this.state.secondaryTracks && this.state.genreSeeds && !this.state.song && !this.state.generating) {
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
                    <div onClick={() => {
                        var win = window.open(this.state.song.external_urls.spotify, '_blank');
                        win.focus();
                    }}>
                        <img width={"100%"} height={"100%"} alt={this.state.song.name + " - " + this.state.song.artists[0].name + " Artwork"} src={this.state.song.album.images[0].url} />
                        <div>
                            {this.state.song.name + " - " + this.state.song.artists[0].name}
                        </div>
                    </div>
                    <Button
                        className="spotify-connect__button"
                        onClick={() => this.setState({
                            candidates: [],
                            song: null,
                            topArtists: null,
                            topTracks: null,
                            secondaryArtists: null,
                            secondaryTracks: null,
                            genreSeeds: null,
                            generating: false,
                            gettingReccomendations: false,
                            candidatesFiltered: false,
                            awaiting: {},
                            awaitingFeatures: false,
                        })} >Start Again</Button>
                </div>
                :
                <div>
                    <h4 style={{ textAlign: "left", paddingTop: "20px" }}>I want to listen to...</h4>
                    <Form>
                        <FormGroup check inline>
                            <CustomInput checked={!this.state.preferences.familiar} onChange={e => this.setState({ preferences: { ...this.state.preferences, familiar: !e.target.checked } })} type="radio" id="familiarity1" name="familiarity" label="Something new" />
                            <CustomInput checked={this.state.preferences.familiar} onChange={e => this.setState({ preferences: { ...this.state.preferences, familiar: e.target.checked } })} type="radio" id="familiarity" name="familiarity" label="Something I know" />
                        </FormGroup>
                        <FormGroup>
                            <Label style={{ float: "left" }} for="energy">Something relaxing</Label>
                            <Label style={{ float: "right" }} for="energy">Something energising</Label>
                            <CustomInput type="range" value={this.state.preferences.energy} onChange={e => this.setState({ preferences: { ...this.state.preferences, energy: e.target.value } })} id="energy" name="energy" />
                        </FormGroup>
                        {/*
                        <FormGroup>
                            <Label style={{ float: "left" }} for="danceability">I don't feel like dancing</Label>
                            <Label style={{ float: "right" }} for="danceability">Something I can dance to</Label>
                            <CustomInput type="range" value={this.state.preferences.danceability} onChange={e => this.setState({ preferences: { ...this.state.preferences, danceability: e.target.value } })} id="danceability" name="danceability" />
                        </FormGroup>
                        */}
                        <FormGroup>
                            <Label style={{ float: "left" }} for="singability">Something instrumental</Label>
                            <Label style={{ float: "right" }} for="singability">Something to sing along to</Label>
                            <CustomInput type="range" value={100 - this.state.preferences.instrumentalness} onChange={e => this.setState({ preferences: { ...this.state.preferences, instrumentalness: 100 - e.target.value } })} id="singability" name="singability" />
                        </FormGroup>
                        {/*
                        <FormGroup>
                            <Label style={{ float: "left" }} for="popularity">Something unpopular</Label>
                            <Label style={{ float: "right" }} for="popularity">Something popular</Label>
                            <CustomInput type="range" value={this.state.preferences.popularity} onChange={e => this.setState({ preferences: { ...this.state.preferences, popularity: e.target.value } })} id="popularity" name="popularity" />
                        </FormGroup>
                        */}
                        {/*
                        <FormGroup>
                            <Label style={{ float: "left" }} for="valence">Something sad</Label>
                            <Label style={{ float: "right" }} for="valence">Something uplifting</Label>
                            <CustomInput type="range" value={this.state.preferences.valence} onChange={e => this.setState({ preferences: { ...this.state.preferences, valence: e.target.value } })} id="valence" name="valence" />
                        </FormGroup>
                        */}
                        <FormGroup>
                            <Label style={{ float: "left" }} for="acousticness">Something electronic</Label>
                            <Label style={{ float: "right" }} for="acousticness">Something accoustic</Label>
                            <CustomInput type="range" value={this.state.preferences.acousticness} onChange={e => this.setState({ preferences: { ...this.state.preferences, acousticness: e.target.value } })} id="acousticness" name="valence" />
                        </FormGroup>
                    </Form>
                    <Button onClick={() => this.onClick()} className="spotify-connect__button" color="primary">Find Your Song</Button>
                </div>
        );
    }
}

export default FindSong;
