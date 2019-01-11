/*global chrome*/
import React, { Component } from 'react';
import './App.css';
import TrafficContainer from "./components/TrafficContainer";
import {getCurrentTab} from "./common/Utils";
import Calendar from 'react-calendar';
import InputForm from './formmama'

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
            <div style={{margin: '20px'}}>
            <InputForm date = {this.state.date} />
            </div>
            <p className="App-intro">
                <TrafficContainer traffic={this.state.traffic}/>
            </p>
            <div style={{margin: '20px', paddingBottom: '10px'}}>
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

// main page
// $(('[itemprop="name"]'), '.text--labelSecondary').each(function(){
//     var text = $(this).text();
//     console.log(text);
// });

// group page
// $(('.groupHomeHeader-groupName'), '.groupHomeHeader-groupNameLink').textContent



// event page
// $('.event-info-group--groupName').textContent