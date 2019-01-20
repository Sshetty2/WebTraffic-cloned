/*global chrome*/
import React, { Component } from 'react';
import './App.css';

import {getCurrentTab} from "./common/Utils";
import Calendar from 'react-calendar';

import  Form  from "./form";
import $ from 'jquery';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grpNameArray: [],
            date: new Date()
        };
    }

    onChange = date => this.setState({ date })

    componentDidMount() {
        getCurrentTab((tab) => {
            chrome.runtime.sendMessage({type: 'popupInit', tabId: tab.id}, (response) => {
                if (response) {
                    console.log(`this response from componentDidMount() was ${response}`)
                    this.setState({
                        grpNameArray: response
                    });
                }
            });
        });

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
    
              console.log(request.greeting);
            });

        // can't use jquery from popup app like this
        // $(('[itemprop="name"]'), '.text--labelSecondary').each(function(){
        // var text = $(this).text();
        // console.log(text);
        // });
    

    }

    render() {
        console.log(this.state.suggestions)


        return (
          <div className="App">
            <div style={{margin: '20px'}}>
            <React.Fragment>
                <div>
                    <h1 className='rock-salt'>Meetup Batch Event Set Tool</h1>
                    <Form date = {this.state.date} />
                </div>
            </React.Fragment>
            </div>
            {/* <p className="App-intro">
                <TrafficContainer traffic={this.state.traffic}/>
            </p> */}
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