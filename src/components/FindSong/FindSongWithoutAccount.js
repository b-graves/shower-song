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

class FindSongWithoutAccount extends Component {
    state = {
        candidates: [],
        welcome: true,
        welcomeScroll: true,
        song: null,
        genreSeeds: null,
        awaiting: {},
        submitted: false,
        timeSubmitted: false,
        recap: false,
        youtubeResults: true,
        genreMessage: false,
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
                    seeds: ["ambient"],
                    selected: false
                },
                {
                    title: "Classical",
                    seeds: ["classical"],
                    selected: false
                },
                {
                    title: "Dance",
                    seeds: ["dance"],
                    selected: false
                },
                {
                    title: "Electronic",
                    seeds: ["electronic"],
                    selected: false
                },
                {
                    title: "Folk",
                    seeds: ["folk"],
                    selected: false
                },
                {
                    title: "Hip Hop",
                    seeds: ["hip-hop"],
                    selected: false
                },
                {
                    title: "House",
                    seeds: ["house", "deep-house", "progressive-house", "chicago-house"],
                    selected: false
                },
                {
                    title: "Indie",
                    seeds: ["indie", "indie-pop"],
                    selected: false
                },
                {
                    title: "Jazz",
                    seeds: ["jazz"],
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
                    seeds: ["pop","indie-pop", "synth-pop"],
                    selected: false
                },
                {
                    title: "Reggae",
                    seeds: ["reggae"],
                    selected: false
                },
                {
                    title: "Rock",
                    seeds: ["rock", "hard-rock", "alt-rock", "rock-n-roll"],
                    selected: false
                },
                {
                    title: "Soul",
                    seeds: ["soul"],
                    selected: false
                },
                {
                    title: "Techno",
                    seeds: ["techno", "minimal-techno", "detroit-techno", "minimal-techno"],
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

    goHome = () => {
        document.location.href="/";
    }

    getReccommendations = (type, values) => {

        let url = new URL('https://api.spotify.com/v1/recommendations');
        values = this.shuffle(values.filter(value => value !== undefined))
        for (let i = 0; i < values.length; i += 5) {
            url.search = new URLSearchParams({
                limit: 10,
                ["seed_" + type]: values.slice(i, i + 5).map(value => type === "genres" ? value : value.id).join(","),
                target_duration_ms: this.minsToMs(this.state.preferences.duration),
                min_duration_ms: this.minsToMs(this.state.preferences.duration - 0.25),
                max_duration_ms: this.minsToMs(this.state.preferences.duration + 0.25),
                target_accouticness: this.state.preferences.acousticness / 100,
                // target_danceability: this.state.preferences.energy / 100,
                target_energy: this.state.preferences.energy / 100,
                target_instrumentalness: this.state.preferences.instrumentalness / 100,
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
        }
    }

    onClick = () => {
        let seeds = []
        let timeSubmitted = new Date();
        this.setState({
            candidates: [],
            timeSubmitted,
            song: null,
            awaiting: {},
            submitted: true,
            youtubeResults: true,
            awaitingFeatures: false
        }, () => this.scrollTo("searching"))
        setTimeout(() => {
            if (this.state.timeSubmitted === timeSubmitted && !this.state.song) {
                this.setState({ criticalError: true, errorMessage: "timeout" })
            }
        }, 30000)
        setTimeout(() => {
            this.state.preferences.genres.forEach(genre => {
                if (genre.selected) {
                    seeds = seeds.concat(genre.seeds)
                }
            })
            this.getReccommendations("genres", seeds.filter(seed => this.state.genreSeeds.includes(seed)))
        }, 2000)
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

    getFeatures = () => {
        if (this.state.candidates.length === 0) {
                this.setState({ criticalError: true, errorMessage: "no songs" })
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
                                    this.setState({ recap: true, song: candidate }, () => this.scrollToThen("result", () => this.setState({ submitted: false })))
                                }
                            })
                        } else {
                            this.checkYt(this.state.candidates[0])
                            this.setState({ recap: true, song: this.state.candidates[0] }, () => this.scrollToThen("result", () => this.setState({ submitted: false })))
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

    mse = (a, b) => {
        let error = 0
        for (let i = 0; i < a.length; i++) {
            error += Math.pow((b[i] - a[i]), 2)
        }
        return error / a.length
    }

    componentDidUpdate() {
        console.log(this.state.awaiting)
        if (!this.state.song && Object.values(this.state.awaiting).length > 0 && Object.values(this.state.awaiting).every(awaiting => !awaiting)  && !this.state.awaitingFeatures) {
            // this.checkVideo(this.state.candidates[0])
            // this.checkYt(this.state.candidates[0])
            // this.setState({ recap: true, song: this.state.candidates[0] }, () => this.scrollToThen("result", () => this.setState({ submitted: false })))
            this.getFeatures()
        }
    }

    minsToMs = (mins) => {
        return mins * 60000;
    }

    msToMins = (ms) => {
        return ms / 60000;
    }

    randomItem = (items) => {
        return items[Math.floor(Math.random() * items.length)]
    }

    checkYt = (song) => {
        if (song.external_ids && song.external_ids.isrc) {
            const Http = new XMLHttpRequest();
            const url = "https://cors-anywhere.herokuapp.com/https://www.youtube.com/results?search_query=" + song.external_ids.isrc;
            Http.open("GET", url);
            Http.send();

            Http.onreadystatechange = (e) => {
                this.setState({ youtubeResults: !Http.responseText.includes("No results found") })
            }
        } else {
            this.setState({ youtubeResults: false })
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

    isTrue = (element, index, array) => {
        return element;
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
                                                Welcome!
                                    </div>
                                            <div className="welcome-page__explain">
                                                We have some questions to help us find a song that fits your music taste and the length of shower you want to take...
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
                                                    What are your favourite genres?
                                        </div>
                                                <Preferences
                                                    preferences={this.state.preferences}
                                                    setPreferences={preferences => this.setState({ preferences })}
                                                    showTime={false}
                                                    showFamiliarity={false}
                                                    showGenres={true}
                                                    showOptions={true}
                                                    showQuestion={true}
                                                />
                                            </Col>
                                        </Row>
                                    </Container>
                                    {this.state.preferences.genres.map(genre => genre.selected).some(this.isTrue) ? < button className="preferences__find-button"
                                        onClick={() => {
                                            this.onClick();
                                        }}
                                    >Find your perfect song</button> : null}
                                </FullHeight>
                            </Element>
                            :
                            <FullHeight className="preferences preferences--options" canExceed>
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
                                                What are your favourite genres?
                                        </div>
                                            <Preferences
                                                preferences={this.state.preferences}
                                                setPreferences={preferences => this.setState({ preferences })}
                                                showTime={false}
                                                showFamiliarity={false}
                                                showGenres={true}
                                                showOptions={true}
                                                showQuestion={true}
                                            />
                                        </Col>
                                    </Row>
                                    {this.state.preferences.genres.map(genre => genre.selected).some(this.isTrue) ? <button className="preferences__continue-button--inline"
                                        onClick={() => {
                                            this.onClick();
                                        }}
                                    >Find your perfect song</button> : null}
                                </Container>
                            </FullHeight>
                        : null
                    }
                    {
                        this.state.submitted ?
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
                            : null
                    }
                    {
                        this.state.song ?
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
                                </FullHeight>
                            </Element>
                            : null
                    }
                </div >
        );
    }
}

export default FindSongWithoutAccount;
