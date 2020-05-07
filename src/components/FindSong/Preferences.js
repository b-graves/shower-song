import React, { Component } from 'react';
import { Button,Input, CustomInput, Form, FormGroup, Label } from 'reactstrap';

import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

import "./FindSong.css";

class Preferences extends Component {


    msToMins = (ms) => {
        return ms / 60000;
    }

    render() {
        return (
            <div>
                <h4 style={{ textAlign: "left", paddingTop: "20px" }}>How many minutes do you want to spend in the shower?</h4>
                <Slider
                    min={2}
                    max={8}
                    defaultValue={this.props.preferences.duration}
                    marks={{ 2: 2, 2.5: "", 3: 3, 3.5: "", 4: <div><div>4</div><div>Reccommended</div></div>, 4.5: "", 5: 5, 5.5: "", 6: 6, 6.5: "", 7: 7, 7.5: "", 8: 8 }} step={null}
                    onChange={(duration) => this.props.setPreferences({ ...this.props.preferences, duration })}
                />
                <h4 style={{ textAlign: "left", paddingTop: "50px" }}>I want to listen to...</h4>
                <Form>
                    {this.props.showFamiliarity ?
                        <FormGroup check inline>
                            <CustomInput checked={!this.props.preferences.familiar} onChange={e => this.props.setPreferences({ ...this.props.preferences, familiar: !e.target.checked })} type="radio" id="familiarity1" name="familiarity" label="Something new" />
                            <CustomInput checked={this.props.preferences.familiar} onChange={e => this.props.setPreferences({ ...this.props.preferences, familiar: e.target.checked })} type="radio" id="familiarity" name="familiarity" label="Something I know" />
                        </FormGroup>
                        : null}
                    {this.props.showGenres ?
                        this.props.preferences.genres.map((genre, index) => <FormGroup check>
                            <Label check>
                                <Input type="checkbox" checked={genre.selected}
                                    onChange={(e) => {
                                        let preferences = this.props.preferences;
                                        preferences.genres[index].selected = e.target.checked
                                        this.props.setPreferences(preferences)
                                    }} /> {genre.title}
                            </Label>
                        </FormGroup>)
                    : null}
                    <FormGroup>
                        <Label style={{ float: "left" }} for="energy">Something relaxing</Label>
                        <Label style={{ float: "right" }} for="energy">Something energising</Label>
                        <CustomInput type="range" value={this.props.preferences.energy} onChange={e => this.props.setPreferences({ ...this.props.preferences, energy: e.target.value })} id="energy" name="energy" />
                    </FormGroup>
                    {/*
                        <FormGroup>
                            <Label style={{ float: "left" }} for="danceability">I don't feel like dancing</Label>
                            <Label style={{ float: "right" }} for="danceability">Something I can dance to</Label>
                            <CustomInput type="range" value={this.props.preferences.danceability} onChange={e => this.props.setPreferences({ ...this.props.preferences, danceability: e.target.value })} id="danceability" name="danceability" />
                        </FormGroup>
                        */}
                    <FormGroup>
                        <Label style={{ float: "left" }} for="singability">Something instrumental</Label>
                        <Label style={{ float: "right" }} for="singability">Something to sing along to</Label>
                        <CustomInput type="range" value={100 - this.props.preferences.instrumentalness} onChange={e => this.props.setPreferences({ ...this.props.preferences, instrumentalness: 100 - e.target.value })} id="singability" name="singability" />
                    </FormGroup>
                    {/*
                        <FormGroup>
                            <Label style={{ float: "left" }} for="popularity">Something unpopular</Label>
                            <Label style={{ float: "right" }} for="popularity">Something popular</Label>
                            <CustomInput type="range" value={this.props.preferences.popularity} onChange={e => this.props.setPreferences({ ...this.props.preferences, popularity: e.target.value })} id="popularity" name="popularity" />
                        </FormGroup>
                        */}
                    {/*
                        <FormGroup>
                            <Label style={{ float: "left" }} for="valence">Something sad</Label>
                            <Label style={{ float: "right" }} for="valence">Something uplifting</Label>
                            <CustomInput type="range" value={this.props.preferences.valence} onChange={e => this.props.setPreferences({ ...this.props.preferences, valence: e.target.value })} id="valence" name="valence" />
                        </FormGroup>
                        */}
                    <FormGroup>
                        <Label style={{ float: "left" }} for="acousticness">Something electronic</Label>
                        <Label style={{ float: "right" }} for="acousticness">Something accoustic</Label>
                        <CustomInput type="range" value={this.props.preferences.acousticness} onChange={e => this.props.setPreferences({ ...this.props.preferences, acousticness: e.target.value })} id="acousticness" name="valence" />
                    </FormGroup>
                </Form>
            </div>
        );
    }
}

export default Preferences;
