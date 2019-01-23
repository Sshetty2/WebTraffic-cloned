/*global chrome*/
import React, { Component } from 'react';
import './App.css';

import {getCurrentTab} from "./common/Utils";
import Calendar from 'react-calendar';

import  Form  from "./form";


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grpNameArray: [],
            date: new Date()
        };
    }

    onChange = date => {console.log(this.state.date); return this.setState({ date })}

    getAutosuggestInput(value){
        console.log(`the autosuggestion input from the app component is ${value}`);
        this.setState({textField: value})
    }

    onFormSubmit=() => {
        console.log(this.state.date)
        let dateRangeStart = this.state.date[0].getTime();
        let dateRangeEnd = this.state.date.length === 2 ? this.state.date[1].getTime() : this.state.date[0].getTime() + 86400000;
        chrome.storage.local.set({grpNameInput: this.state.textField, dateRangeStart: dateRangeStart, dateRangeEnd: dateRangeEnd}, function() {
            console.log('the local storage object has been set after the button was clicked with the user input'
            );
          })


        chrome.runtime.sendMessage({ // .2 
            action: 'meetupRequest'
          }, response => console.log(response))
      }

    componentDidMount() {
        getCurrentTab((tab) => {
            chrome.runtime.sendMessage({type: 'popupInit', tabId: tab.id}, (response) => {
                if (response) {
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

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.type === 'redirectUrl') {
                sendResponse('The test Redirect URL Was recieved by the client')
                console.log(request.redirectUrl)
            };
            return true;
        });

    }

    render() {
        console.log(this.state.suggestions)
        const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }
        const dateRendered = this.state.date.length == 2 ? `${this.state.date[0].toLocaleDateString("en-US", options)}  -  ${this.state.date[1].toLocaleDateString("en-US", options)}` : this.state.date.toLocaleDateString("en-US", options)

        return (
          <div className="App">
            <div style={{margin: '20px'}}>
            <React.Fragment>
                <div>
                    <h1 className='rock-salt'>Meetup Batch Event Set Tool</h1>
                    <Form date = {dateRendered} getInputData={this.getAutosuggestInput.bind(this)} onFormSubmit = {this.onFormSubmit.bind(this)} />
                </div>
            </React.Fragment>
            </div>
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