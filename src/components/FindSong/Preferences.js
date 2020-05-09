import React, { Component } from 'react';
import { Button, Input, CustomInput, Form, FormGroup, Label, ButtonGroup } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";

class Preferences extends Component {


    msToMins = (ms) => {
        return ms / 60000;
    }


    chunk = (items, chunkSize) => {
        var chunks = [];
        for (var i = 0; i < items.length; i += chunkSize)
            chunks.push(items.slice(i, i + chunkSize));
        return chunks;
    }

    toggleGenre = (genreToChange) => {
        let genres = this.props.preferences.genres;
        genres.forEach(genre => {
            if (genre.title === genreToChange.title) {
                genre.selected = !genre.selected
            }
        });
        this.props.setPreferences({ ...this.props.preferences, genres })
    }

    render() {
        return (
            <div>
                {this.props.showTime ?
                    <div className="time-slider">
                        <Slider
                            id="time-slider"
                            min={2}
                            max={8}
                            defaultValue={this.props.preferences.duration}
                            marks={{ 2: 2, 2.5: "", 3: 3, 3.5: "", 4: <div><div>4</div><div>Reccommended</div></div>, 4.5: "", 5: 5, 5.5: "", 6: 6, 6.5: "", 7: 7, 7.5: "", 8: 8 }} step={null}
                            onChange={(duration) => this.props.setPreferences({ ...this.props.preferences, duration })}
                        />
                    </div>
                    : null}
                <Form>
                    {this.props.showFamiliarity ?
                        <ButtonGroup className="radio-options">
                            <Button className={this.props.preferences.familiar ? "radio-option" : "radio-option radio-option--active"} onClick={() => this.props.setPreferences({ ...this.props.preferences, familiar: false })}>Something New</Button>
                            <Button className={this.props.preferences.familiar ? "radio-option radio-option--active" : "radio-option"} onClick={() => this.props.setPreferences({ ...this.props.preferences, familiar: true })}>Something I know</Button>
                        </ButtonGroup>
                        : null}
                    {this.props.showGenres ?
                        <ButtonGroup vertical className="genre-grid">
                            {this.chunk(this.props.preferences.genres, 4).map(row => <ButtonGroup>
                                {row.map(genre =>
                                    <Button onClick={() => this.toggleGenre(genre)} className={genre.selected ? "genre-button genre-button--active" : "genre-button"}>{genre.title}</Button>
                                )}
                            </ButtonGroup>)}
                        </ButtonGroup>
                        : null}
                    {this.props.showQuestion ?
                        <div className="preferences__question preferences__question--options">
                            What type of song are you in the mood for?
                </div>
                        : null}
                    {this.props.showOptions ?
                        <div>
                            <div className="preferences__slider">
                                <div className="preferences__slider-label preferences__slider-label--left" for="energy">Something relaxing</div>
                                <div className="preferences__slider-label preferences__slider-label--right" for="energy">Something energising</div>
                                <Slider value={this.props.preferences.energy} onChange={value => this.props.setPreferences({ ...this.props.preferences, energy: value })} id="energy" name="energy" />
                            </div>
                            <div className="preferences__slider">
                                <div className="preferences__slider-label preferences__slider-label--left" for="singability">Something instrumental</div>
                                <div className="preferences__slider-label preferences__slider-label--right" for="singability">Something to sing along to</div>
                                <Slider value={100 - this.props.preferences.instrumentalness} onChange={value => this.props.setPreferences({ ...this.props.preferences, instrumentalness: 100 - value })} id="singability" name="singability" />
                            </div>
                            <div className="preferences__slider">
                                <div className="preferences__slider-label preferences__slider-label--left" for="acousticness">Something electronic</div>
                                <div className="preferences__slider-label preferences__slider-label--right" for="acousticness">Something accoustic</div>
                                <Slider value={this.props.preferences.acousticness} onChange={value => this.props.setPreferences({ ...this.props.preferences, acousticness: value })} id="acousticness" name="valence" />
                            </div>
                        </div>
                        : null
                    }
                </Form>
            </div>
        );
    }
}

export default Preferences;
