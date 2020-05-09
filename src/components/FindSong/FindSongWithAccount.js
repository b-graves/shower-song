import React, { Component } from 'react';
import { Button, Container, Row, Col, CustomInput, Form, FormGroup } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";

import Song from "./Song"
import Preferences from "./Preferences"

import FullHeight from "react-full-height";

import ScrollLock, { TouchScrollable } from 'react-scrolllock';

import Animation from "../../assets/animation.gif"

import { Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

import { IoIosArrowUp } from 'react-icons/io';

import Logo from "../../assets/logo.svg"

class FindSongWithAccount extends Component {
    state = {
        candidates: [],
        welcome: true,
        welcomeScroll: true,
        song: null,
        topArtists: null,
        topTracks: {
            items: []
        },
        secondaryArtists: [],
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
        timeSubmitted: false,
        recap: false,
        youtubeResults: true,
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

    submitPreferences = () => {
        let timeSubmitted = new Date();
        this.setState({
            submitted: true,
            timeSubmitted,
            recap: true,
            candidates: [],
            song: null,
            topArtists: null,
            topTracks: {
                items: []
            },
            secondaryArtists: [],
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
            youtubeResults: true
        }, () => this.scrollTo("searching"))
        setTimeout(() => {
            if (this.state.timeSubmitted === timeSubmitted && !this.state.song) {
                this.setState({ criticalError: true, errorMessage: "timeout" })
            }
        }, 30000)
        setTimeout(() => {
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
                        this.shuffle(data.items).slice(0, 100).forEach(artist => {
                            console.log(artist.name)
                            let url = new URL('https://api.spotify.com/v1/artists/' + artist.id + '/top-tracks');
                            url.search = new URLSearchParams({ country: "from_token" });
                            fetch(url.toString(), {
                                headers: {
                                    "Authorization": "Bearer " + this.props.accessToken,

                                }
                            }).then((response) => response.json()
                                .then(data => {
                                    if (!data.error) {
                                        this.setState({ topTracks: { ...this.state.topTracks, items: this.state.topTracks.items.concat(data.tracks.slice(0,5)) } });
                                    }
                                })
                            )
                        })
                    } else {
                        this.setState({ topArtists: { items: [] } })
                    }
                })
                .catch((error) => {
                    this.setState({ criticalError: true, errorMessage: "Could not load top artists" })
                })
            )

            url = new URL('https://api.spotify.com/v1/me/top/artists');
            url.search = new URLSearchParams({ limit: 50, time_range: "short_term" });
            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken,
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        this.setState({ secondaryArtists: this.state.secondaryArtists.concat(data.items) })
                    } 
                })
                .catch((error) => {
                    console.log(error)
                    this.setState({ criticalError: true, errorMessage: "Could not load top artists" })
                })
            )

            url = new URL('https://api.spotify.com/v1/me/top/artists');
            url.search = new URLSearchParams({ limit: 50, time_range: "long_term" });
            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken,
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        this.setState({ secondaryArtists: this.state.secondaryArtists.concat(data.items) })
                    } 
                })
                .catch((error) => {
                    console.log(error)
                    this.setState({ criticalError: true, errorMessage: "Could not load top artists" })
                })
            )

            url = new URL('https://api.spotify.com/v1/me/top/tracks');
            url.search = new URLSearchParams({ limit: 50 });
            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        this.setState({ topTracks: { ...this.state.topTracks, items: this.state.topTracks.items.concat(data.items) } })
                    } else {
                        this.setState({ topTracks: { items: [] } })
                    }
                })
                .catch((error) => {
                    this.setState({ criticalError: true, errorMessage: "Could not load top tracks" })
                })
            )

            url = new URL('https://api.spotify.com/v1/me/top/tracks');
            url.search = new URLSearchParams({ limit: 50, time_range: "long_term" });
            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        this.setState({ topTracks: { ...this.state.topTracks, items: this.state.topTracks.items.concat(data.items) } })
                    } else {
                        this.setState({ topTracks: { items: [] } })
                    }
                })
                .catch((error) => {
                    this.setState({ criticalError: true, errorMessage: "Could not load top tracks" })
                })
            )

            url = new URL('https://api.spotify.com/v1/me/top/tracks');
            url.search = new URLSearchParams({ limit: 50, time_range: "short_term" });
            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        this.setState({ topTracks: { ...this.state.topTracks, items: this.state.topTracks.items.concat(data.items) } })
                    } else {
                        this.setState({ topTracks: { items: [] } })
                    }
                })
                .catch((error) => {
                    this.setState({ criticalError: true, errorMessage: "Could not load top tracks" })
                })
            )

            // url = new URL('https://api.spotify.com/v1/me/albums');
            // url.search = new URLSearchParams({ limit: 50 });
            // fetch(url.toString(), {
            //     headers: {
            //         "Authorization": "Bearer " + this.props.accessToken,

            //     }
            // }).then((response) => response.json()
            //     .then(data => {
            //         if (!data.error) {
            //             this.setState({ secondaryArtists: data.items.map(album => album.album.artists[0]) })
            //         } else {
            //             this.setState({ secondaryArtists: [] })
            //         }
            //     })
            //     .catch((error) => {
            //         this.setState({ criticalError: true, errorMessage: "Could not load top albums" })
            //     })
            // )

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
                    } else {
                        this.setState({ secondaryTracks: [] })
                    }
                })
                .catch((error) => {
                    this.setState({ criticalError: true, errorMessage: "Could not load users tracks" })
                })
            )

            let found = false
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
                                found = true;
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
                                        } else {
                                            this.setState({ discoverWeekly: [] })
                                        }
                                    }))
                            }
                        })
                    }
                })
                .catch((error) => {
                    this.setState({ criticalError: true, errorMessage: "Could not load discover weekly" })
                })
            )
            if (!found) {
                this.setState({ discoverWeekly: [] })
            }

            url = new URL('https://api.spotify.com/v1/me/player/recently-played');
            url.search = new URLSearchParams({ limit: 50 });
            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        this.setState({ recentTracks: data.items.map(track => track.track).slice(0,20) })
                    } else {
                        this.setState({ recentTracks: [] })
                    }
                })
                .catch((error) => {
                    this.setState({ criticalError: true, errorMessage: "Could not load recently played" })
                })
            )

            url = new URL('https://api.spotify.com/v1/recommendations/available-genre-seeds');
            fetch(url.toString(), {
                headers: {
                    "Authorization": "Bearer " + this.props.accessToken
                }
            }).then((response) => response.json()
                .then(data => {
                    if (!data.error) {
                        this.setState({ genreSeeds: data.genres });
                    } else {
                        this.setState({ genreSeeds: [] });
                    }
                })
                .catch((error) => {
                    this.setState({ criticalError: true, errorMessage: "Could not load genres" })
                })
            )
        }, 1000)
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
        let url = new URL('https://api.spotify.com/v1/recommendations');
        values = this.shuffle(values.filter(value => value !== undefined && value !== null))
        for (let i = 0; i < values.length; i += 5) {
            url.search = new URLSearchParams({
                limit: 10,
                ["seed_" + type]: values.slice(i, i + 5).map(value => type === "genres" ? value : value.id).join(","),
                target_duration_ms: this.minsToMs(this.state.preferences.duration),
                min_duration_ms: this.minsToMs(this.state.preferences.duration - 0.25),
                max_duration_ms: this.minsToMs(this.state.preferences.duration + 0.25),
                target_accouticness: this.state.preferences.acousticness / 100,
                min_acousticness: (this.state.preferences.acousticness / 100) - 0.4,
                max_acousticness: (this.state.preferences.acousticness / 100) + 0.4,
                // target_danceability: this.state.preferences.energy / 100,
                target_energy: this.state.preferences.energy / 100,
                min_energy: (this.state.preferences.energy / 100) - 0.4,
                max_energy: (this.state.preferences.energy / 100) + 0.4,
                target_instrumentalness: this.state.preferences.instrumentalness / 100,
                min_instrumentalness: (this.state.preferences.instrumentalness / 100) - 0.4,
                max_instrumentalness: (this.state.preferences.instrumentalness / 100) + 0.4,
                // target_popularity: this.state.preferences.popularity,
                // target_valence: this.state.preferences.energy / 100,
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
                .catch((error) => {
                    console.log(error)
                })
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

            let tracks = this.state.topTracks.items.concat(this.state.secondaryTracks).concat(this.state.recentTracks).concat(this.state.discoverWeekly).filter(value => value !== undefined && value !== null)
            let artists = this.state.topArtists.items.concat(this.state.secondaryArtists).filter(value => value !== undefined && value !== null)
            console.log(tracks)
            console.log(artists)
            if (tracks.length === 0) {
                this.setState({ criticalError: true, errorMessage: "no top tracks" })
            } else if (artists.length === 0) {
                this.setState({ criticalError: true, errorMessage: "no top artists" })
            } else {

                this.setState({ gettingReccomendations: true, generating: true, candidates: this.state.discoverWeekly }, () => {
                    setTimeout(() => {
                        this.getReccommendations("tracks", tracks)
                        this.getReccommendations("artists", artists)
                        if (genresSorted.length > 0) {
                            this.getReccommendations("genres", genresSorted)
                        }
                        this.setState({ gettingReccomendations: false })
                    }, 1500)
                });
            }
        } else {
            let tracks = this.state.topTracks.items.filter(value => value !== undefined && value !== null)
            let artists = this.state.topArtists.items.concat(this.state.secondaryArtists).filter(value => value !== undefined && value !== null)

            if (tracks.length === 0) {
                this.setState({ criticalError: true, errorMessage: "no top tracks" })
            } else if (artists.length === 0) {
                this.setState({ criticalError: true, errorMessage: "no top artists" })
            } else {
                this.setState({ generating: true, candidates: tracks })
            }
        }
    }

    filterCandidates = () => {
        let candidates = this.state.candidates.filter(value => value !== undefined && value !== null)
        if (!this.state.preferences.familiar || this.state.nothingKnown) {
            // const topArtistIds = this.state.topArtists.items.map(artist => artist.id);
            // candidates = candidates.filter(candidate => !topArtistIds.includes(candidate.artists[0].id));

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
            this.setState({ candidatesFiltered: true, candidates: candidates.filter(candidate => candidate.duration_ms >= this.minsToMs(this.state.preferences.duration - 0.5) && candidate.duration_ms <= this.minsToMs(this.state.preferences.duration + 0.5)) })
        }
    }

    mse = (a, b) => {
        let error = 0
        for (let i = 0; i < a.length; i++) {
            error += Math.pow((b[i] - a[i]), 2)
        }
        return error / a.length
    }


    checkYt = (song) => {
        const Http = new XMLHttpRequest();
        const url = "https://cors-anywhere.herokuapp.com/https://www.youtube.com/results?search_query=" + song.external_ids.isrc;
        Http.open("GET", url);
        Http.send();

        Http.onreadystatechange = (e) => {
            this.setState({ youtubeResults: !Http.responseText.includes("No results found") })
        }
    }

    getFeatures = () => {
        if (this.state.candidates.length === 0) {
            if (this.state.preferences.familiar) {
                console.log("nothing known")
                this.setState({
                    submitted: true,
                    recap: true,
                    candidates: [],
                    song: null,
                    generating: false,
                    gettingReccomendations: false,
                    candidatesFiltered: false,
                    awaiting: {},
                    awaitingFeatures: false,
                    nothingKnown: true,
                    youtubeResults: true
                })
            } else {
                this.setState({ criticalError: true, errorMessage: "no songs" })
            }
        } else {
            this.setState({ awaitingFeatures: true }, () => {
                let url = new URL('https://api.spotify.com/v1/audio-features');

                url.search = new URLSearchParams({
                    ids: this.shuffle(this.state.candidates).slice(0, 100).map(candidate => candidate.id)
                });

                fetch(url.toString(), {
                    headers: {
                        "Authorization": "Bearer " + this.props.accessToken
                    }
                }).then((response) => response.json()
                    .then(data => {
                        if (!data.error && data.audio_features[0] !== null) {
                            let audioFeatures = data.audio_features.map(features => {
                                return {
                                    ...features, mse: this.mse(
                                        [features.energy, features.instrumentalness, features.acousticness],
                                        [this.state.preferences.energy / 100,  this.state.preferences.instrumentalness / 100,  this.state.preferences.acousticness / 100]
                                    )
                                }
                            }
                            );
                            audioFeatures.sort(function (a, b) { return a.mse - b.mse })
                            let bestMatch = audioFeatures[0]
                            console.log(audioFeatures.map(f => f.mse))
                            console.log(audioFeatures.map(f => {return {energy: f.energy, instrumentalness: f.instrumentalness, acousticness: f.acousticness, mse: f.mse}}))
                            audioFeatures = audioFeatures.filter(a => a.mse <= bestMatch.mse + 0.05)
                            console.log(audioFeatures.map(f => f.mse))
                            console.log(audioFeatures.map(f => {return {energy: f.energy, instrumentalness: f.instrumentalness, acousticness: f.acousticness, mse: f.mse}}))
                            bestMatch = this.randomItem(audioFeatures);
                            console.log(bestMatch)
                            this.state.candidates.forEach(candidate => {
                                
                                if (candidate.id === bestMatch.id) {
                                    this.checkYt(candidate)
                                    this.setState({ song: candidate }, () => this.scrollToThen("result", () => this.setState({ submitted: false })))
                                }
                            })
                        } else {
                            this.checkYt(this.state.candidates[0])
                            this.setState({ song: this.state.candidates[0] }, () => this.scrollToThen("result", () => this.setState({ submitted: false })))
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        this.setState({ criticalError: true, errorMessage: "could not get audio features" })
                    })
                )

            })
        }
    }

    componentDidUpdate() {
        if (!this.state.criticalError) {
            if (!this.state.song && this.state.discoverWeekly && this.state.topArtists && this.state.topTracks.items && this.state.secondaryArtists && this.state.secondaryTracks && this.state.genreSeeds && !this.state.song && !this.state.generating) {
                console.log("get")
                this.getCandidates()
            } else if (!this.state.candidatesFiltered && Object.values(this.state.awaiting).every(awaiting => !awaiting) && this.state.generating && !this.state.gettingReccomendations) {
                console.log("filter")
                this.filterCandidates()
            } else if (this.state.candidatesFiltered && !this.state.awaitingFeatures) {
                console.log("decide")
                this.getFeatures()
            }
        }
    }

    scrollTo(section) {
        // scroll.scrollToBottom();
        scroller.scrollTo(section, {
            duration: 750,
            delay: 0,
            smooth: true,
            offset: 0
        })
    }

    scrollToThen(section, callback) {
        // scroll.scrollToBottom();
        scroller.scrollTo(section, {
            duration: 750,
            delay: 0,
            smooth: true,
            offset: 0
        })
        setTimeout(() => callback(), 750)
    }

    goHome = () => {
        document.location.href = "/";
    }

    render() {
        return (
            this.state.criticalError ?
                <FullHeight className="preferences">
                    <Container className="central-content time-container">
                        <Row>
                            <Col sm="12" md={{ size: 6, offset: 3 }}>
                                <div>Something went wrong...</div>
                                <button className="error-button" onClick={() => this.props.reconnect()}>Try Again</button>
                                <div className="error-message">Error: {this.state.errorMessage}</div>
                            </Col>
                        </Row>
                    </Container>
                </FullHeight>
                :
                <div>
                    {this.state.welcome || this.state.welcomeScroll ?
                        <Element name="welcome">
                            <FullHeight className="preferences preferences--time">
                                <Container className="central-content time-container">
                                    <Row>
                                        <Col sm="12" md={{ size: 6, offset: 3 }}>
                                            <img onClick={() => this.goHome()} className="welcome-page__logo" src={Logo} alt="Shower Song Logo" />
                                            <div onClick={() => this.goHome()} className="start-page__title">Shower Song</div>
                                            <div className="welcome-page__message">
                                                Welcome {this.props.data.user.display_name.split(" ")[0]}!
                                    </div>
                                            <div className="welcome-page__explain">
                                                Your Spotify listening data will be used to find a song that fits your music taste and the length of shower you want to take...
                                    </div>
                                            <div className="welcome-page__alt-option">
                                                If you would prefer to not share your listening data and select your favourite genres manually <span onClick={() => this.props.disconnect()} className="link">click here</span>
                                            </div>

                                        </Col>
                                    </Row>
                                </Container>
                                {this.state.timeSubmitted ? null : <button className="preferences__continue-button" onClick={() => { this.setState({ welcome: false }, () => this.scrollToThen("time", () => this.setState({ welcomeScroll: false }))) }}>Get Started</button>}
                            </FullHeight>
                        </Element>
                        : null}
                    {this.state.welcome || this.state.song || this.state.recap ? null : <Element name="time">

                        <FullHeight className="preferences preferences--time">
                            <Container className="central-content time-container">
                                <Row>
                                    <Col sm="12" md={{ size: 6, offset: 3 }}>
                                        <div className="preferences__question preferences__question--time">
                                            How many minutes would you like to spend in the shower?
                                        </div>
                                        <Preferences
                                            preferences={this.state.preferences}
                                            setPreferences={preferences => { console.log(preferences); this.setState({ preferences }) }}
                                            showTime={true}
                                            showFamiliarity={false}
                                            showGenres={false}
                                            showOptions={false}
                                        />
                                    </Col>
                                </Row>
                            </Container>
                            {this.state.timeSubmitted ? null : <button className="preferences__continue-button" onClick={() => this.setState({ timeSubmitted: true }, () => this.scrollTo("options"))}>Continue</button>}
                        </FullHeight>

                    </Element>}
                    {this.state.timeSubmitted ?
                        !this.state.song && !this.state.recap ?
                            <Element name="options">
                                <FullHeight className="preferences preferences--options">
                                    <Container className="central-content">
                                        <Row>
                                            <Col sm="12" md={{ size: 6, offset: 3 }}>
                                                <div className="preferences__question preferences__question--options">
                                                    What type of song are you in the mood for?
                                        </div>
                                                <Preferences
                                                    preferences={this.state.preferences}
                                                    setPreferences={preferences => this.setState({ preferences })}
                                                    showTime={false}
                                                    showFamiliarity={true}
                                                    showGenres={false}
                                                    showOptions={true}
                                                />
                                            </Col>
                                        </Row>
                                    </Container>
                                    <button className="preferences__continue-button"
                                        onClick={() => {
                                            this.submitPreferences();
                                        }}
                                    >Find your perfect song</button>
                                </FullHeight>
                            </Element>
                            :
                            <FullHeight className="preferences preferences--options">
                                <Container>
                                    <Row>
                                        <Col sm="12" md={{ size: 6, offset: 3 }}>
                                            <img onClick={() => this.goHome()} className="recap-page__logo" src={Logo} alt="Shower Song Logo" />
                                            <div onClick={() => this.goHome()} className="recap-page__title">Shower Song</div>
                                            <div className="recap__time">
                                                <div className="preferences__question preferences__question--time">
                                                    How many minutes would you like to spend in the shower?
                                        </div>
                                                <Preferences
                                                    preferences={this.state.preferences}
                                                    setPreferences={preferences => this.setState({ preferences })}
                                                    showTime={true}
                                                    showFamiliarity={false}
                                                    showGenres={false}
                                                    showOptions={false}
                                                />
                                            </div>
                                            <div className="preferences__question preferences__question--options">
                                                What type of song are you in the mood for?
                                        </div>
                                            <Preferences
                                                preferences={this.state.preferences}
                                                setPreferences={preferences => this.setState({ preferences })}
                                                showTime={false}
                                                showFamiliarity={true}
                                                showGenres={false}
                                                showOptions={true}
                                            />
                                        </Col>
                                    </Row>
                                    <button className="preferences__continue-button--inline"
                                        onClick={() => {
                                            this.submitPreferences();
                                        }}
                                    >Find your perfect song</button>
                                </Container>
                            </FullHeight>
                        : null}
                    {this.state.submitted ?
                        <Element name="searching">
                            <FullHeight className="searching">
                                <Container className="central-content">
                                    <Row>
                                        <Col sm="12" md={{ size: 6, offset: 3 }}>
                                            <div>
                                                <img src={Animation} width={"50%"} alt="loading animation " />
                                                <div>
                                                    Finding your shower song...
                                            </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Container>
                            </FullHeight>
                        </Element>
                        : null}
                    {this.state.song ?
                        <Element name="result">
                            <FullHeight className="song-result result-page__background" >
                                <Container className="central-content">
                                    <Row>
                                        <Col sm="12" md={{ size: 6, offset: 3 }}>
                                            <Song
                                                song={this.state.song}
                                                preferences={this.state.preferences}
                                                nothingKnown={this.state.nothingKnown}
                                                showSpotify={true}
                                                showYouTube={false}
                                                accessToken={this.props.accessToken}
                                                youtubeResults={this.state.youtubeResults}
                                            />
                                        </Col>
                                    </Row>
                                </Container>
                                <div className={"song__enjoy"}>
                                    Enjoy your {Math.round(this.msToMins(this.state.song.duration_ms) * 2) / 2} Minute Shower!
                    </div>
                            </FullHeight>
                        </Element>
                        : null}
                </div>


        )
    }

    // render() {
    //     return (

    //         this.state.song ?
    //             <div>
    //                 <Song 
    //                     song={this.state.song}
    //                     preferences={this.state.preferences}
    //                     nothingKnown={this.state.nothingKnown}
    //                     showSpotify={true}
    //                     showYouTube={false}
    //                     accessToken={this.props.accessToken}
    //                 />
    //                 <Button
    //                     className="spotify-connect__button"
    //                     onClick={() => this.setState({
    //                         candidates: [],
    //                         song: null,
    //                         topArtists: null,
    //                         topTracks: null,
    //                         secondaryArtists: null,
    //                         secondaryTracks: null,
    //                         recentTracks: null,
    //                         discoverWeekly: null,
    //                         genreSeeds: null,
    //                         generating: false,
    //                         gettingReccomendations: false,
    //                         candidatesFiltered: false,
    //                         awaiting: {},
    //                         awaitingFeatures: false,
    //                         nothingKnown: false,
    //                         submitted: false,
    //                     })} >Start Again</Button>
    //             </div>
    //             :
    //             !this.state.submitted ?
    //                 <div>
    //                     <Preferences 
    //                         preferences={this.state.preferences}
    //                         setPreferences={preferences => this.setState({preferences})} 
    //                         showFamiliarity={true}
    //                         showGenres={false}
    //                     />
    //                     <Button onClick={() => this.onClick()} className="spotify-connect__button" color="primary">Find Your Song</Button>
    //                 </div>
    //                 :
    //                 <div>
    //                     Finding you the perfect song...
    //             </div>
    //     );
    // }
}

export default FindSongWithAccount;
