/*global chrome*/
import React, { Component } from 'react';
import './App.css';
import TrafficContainer from "./components/TrafficContainer";
import {getCurrentTab} from "./common/Utils";
import Calendar from 'react-calendar';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            traffic: {},
            date: new Date()
        };
    }
    onChange = date => this.setState({ date })

    componentDidMount() {
        getCurrentTab((tab) => {
            chrome.runtime.sendMessage({type: 'popupInit', tabId: tab.id}, (response) => {
                if (response) {
                    this.setState({
                        traffic: Object.assign(this.state.traffic, response)
                    });
                }
            });
        });
    }

    render() {
        console.log(this.state.date)
        return (
          <div className="App">
            <header className="App-header">
              <h1 className="App-title">Welcome to WebTraffic</h1>
            </header>
            <form onSubmit={this.handleSubmit}>
                <label>Date: 
                <textarea value={this.state.date}/>
                </label>
                <input type="submit" value="Submit" />
            </form>
            <p className="App-intro">
                <TrafficContainer traffic={this.state.traffic}/>
            </p>
            <div>
                <Calendar
                onChange={this.onChange}
                value={this.state.date}
                selectRange={true}
                />
            </div>
          </div>
        );
    }
}

export default App;
