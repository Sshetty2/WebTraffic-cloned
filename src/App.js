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
            date: new Date(),
            open: false,
            meetupEventData: [],
            textField: ""
        };
    }


    
    componentDidMount() {
        chrome.runtime.sendMessage({type: 'popupInit'}, (response) => {
            if (response) {
                this.setState({
                    grpNameArray: response
                });
            }
        });
        
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    }

    onChange = date => this.setState({ date })



    getAutosuggestInput(value){
        this.setState({textField: value})
    }

    onFormSubmit=() => {
        if(this.state.textField.length ===  0){
            return alert("please enter a valid group name")
        }
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

    
    handleConfirmation = () =>{
        let parsedDataObj = this.state.meetupEventData
        chrome.runtime.sendMessage({ type: 'googleAuthFlow', parsedDataObj: parsedDataObj}, response => console.log(response))        
        this.setState({ open: false });
    }
    

    handleMessage(request) {
        // Handle received messages
        if (request.type === 'meetupEventData') {
            console.log(request.meetupEventData)
            this.setState({
                meetupEventData: request.meetupEventData,
                open: true
            });
        }
    }

    render() {

        const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        const dateRendered = this.state.date.length == 2 ? `${this.state.date[0].toLocaleDateString("en-US", options)}  -  ${this.state.date[1].toLocaleDateString("en-US", options)}` : this.state.date.toLocaleDateString("en-US", options);

        return (
          <div className="App">
            <DialogComponent open = {this.state.open} handleConfirmation = {this.handleConfirmation.bind(this)} dialogClose = {this.dialogClose.bind(this)} meetupEventData = {this.state.meetupEventData} />
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