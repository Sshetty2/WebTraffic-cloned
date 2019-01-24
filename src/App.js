/*global chrome*/
import React, { Component } from 'react';
import './App.css';
import DialogComponent from "./Dialog"
import {getCurrentTab} from "./common/Utils";
import Calendar from 'react-calendar';

import  Form  from "./form";


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grpNameArray: [],
            date: new Date()
        };
    }

    onChange = date => this.setState({ date })



    getAutosuggestInput(value){
        this.setState({textField: value})
    }

    onFormSubmit=() => {
        let dateRangeStart = this.state.date.length === 2 ? this.state.date[0].getTime() : this.state.date.getTime()
        let dateRangeEnd = this.state.date.length === 2 ? this.state.date[1].getTime() : this.state.date.getTime() + 86400000;
        chrome.storage.local.set({grpNameInput: this.state.textField, dateRangeStart: dateRangeStart, dateRangeEnd: dateRangeEnd}, function() {
            console.log('the local storage object has been set after the button was clicked with the user input'
            );
          })


        chrome.runtime.sendMessage({ // .2 
            action: 'meetupRequest'
          }, response => console.log(response))
      }
    

    // dialogOpen is in the onMessage listener

    dialogClose = () => {
        this.setState({ open: false });
      };

    
    handleConfirmation = (parsedDataObj) =>{
        // send message with parsed data object back to background script
        chrome.runtime.sendMessage({ // .2 
            action: 'googleAuthFlow'
          }, response => console.log(response))
        
        this.setState({ open: false });
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

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.type === 'redirectUrl') {
                sendResponse('The test Redirect URL Was recieved by the client')
                console.log(request.redirectUrl)
            };
            return true;
        });

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.type === 'confirmation'){
                this.setState({ open: true });
                //TODO accept message from background script that will JSON object with the data then send 




            };
            return true;
        });
    }

    render() {

        const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        const dateRendered = this.state.date.length == 2 ? `${this.state.date[0].toLocaleDateString("en-US", options)}  -  ${this.state.date[1].toLocaleDateString("en-US", options)}` : this.state.date.toLocaleDateString("en-US", options);

        return (
          <div className="App">
            <DialogComponent open = {this.state.open} handleConfirmation = {this.handleConfirmation.bind(this)} dialogClose = {this.dialogClose.bind(this)} />
            <div style={{margin: '20px'}}>
                <div>
                    <h1 className='rock-salt App-title'>Meetup Batch Event Set Tool</h1>
                    <Form date = {dateRendered} getInputData={this.getAutosuggestInput.bind(this)} onFormSubmit = {this.onFormSubmit.bind(this)} />
                </div>
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



// main page
// $(('[itemprop="name"]'), '.text--labelSecondary').each(function(){
//     var text = $(this).text();
//     console.log(text);
// });

// group page
// $(('.groupHomeHeader-groupName'), '.groupHomeHeader-groupNameLink').textContent



// event page
// $('.event-info-group--groupName').textContent