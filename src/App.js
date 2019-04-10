/*global chrome*/
import React, { Component } from 'react';
import './App.css';
import DialogComponent from "./Dialog"
import Calendar from 'react-calendar';
import SuccessDialogComponent from "./SuccessDialog"

import  Form  from "./form";


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grpNameArray: [],
            date: new Date(),
            open: false,
            meetupEventData: [],
            textField: "",
            urlGroupName: "",
            successBox: false,
            disabled: false
        };
    }


    
    componentDidMount() {
        chrome.runtime.sendMessage({type: 'popupInit'}, (response) => {
            if (response) {
                this.setState({
                    grpNameArray: response.groupNameArray,
                    textField: response.groupName,
                    urlGroupName: response.groupName
                });
            }
        });
        chrome.storage.local.get(['urlGroupName'], (result) => {
            if(result.urlGroupName){
                this.setState({
                    textField: result.urlGroupName,
                    urlGroupName: result.urlGroupName
                });
          } else{
                this.setState({
                    textField: "",
                    urlGroupName: ""
                });
          }
        });

        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    }

    onChange = date => this.setState({ date })



    getAutosuggestInput(value){
        if (!this.state.urlGroupName){  
        this.setState({textField: value})
        }
    }

    onFormSubmit=() => {
        this.setState({disabled: true})
        if(this.state.textField.length ===  0){
            return alert("please enter a valid group name")
        } 
        let dateRangeStart = this.state.date.length === 2 ? this.state.date[0].getTime() : this.state.date.getTime()
        let dateRangeEnd = this.state.date.length === 2 ? this.state.date[1].getTime() : this.state.date.getTime() + 86400000;
        chrome.storage.local.set({grpNameInput: this.state.textField, dateRangeStart: dateRangeStart, dateRangeEnd: dateRangeEnd, urlPathName: this.state.urlGroupName}, function() {
            console.log('the local storage object has been set after the button was clicked with the user input'
            );
        })
        chrome.runtime.sendMessage({ 
            action: 'meetupRequest'
        }, response => console.log(response))
    }
    

    // dialogOpen is in the onMessage listener

    dialogClose = () => {
        this.setState({ 
            open: false, 
            date: new Date(), 
            disabled: false,
            meetupEventData: [] });
      };
 
    successDialogClose = () => {
        this.setState({ successBox: false });
    };

    
    handleConfirmation = () =>{
        let parsedDataObj = this.state.meetupEventData
        chrome.runtime.sendMessage({ type: 'googleAuthFlow', parsedDataObj: parsedDataObj}, response => console.log(response))        
        this.setState({ 
            open: false,
            meetupEventData: [],
            disabled: true
        });
    }
    

    handleMessage(request, sender, sendResponse) {
        // Handle received messages

        if (request.type === 'resetTextField' || request.type === 'urlGroupName') {
            console.log('text field was reset')
            this.setState({
                textField: "",
                urlGroupName:""
            });

            if (request.type === 'urlGroupName') {
                console.log(`the urlGroupName was pulled and set to ${request.urlGroupName}`)
                this.setState({
                    urlGroupName: request.urlGroupName,
                    textField: request.urlGroupName
                });
                console.log(`the current value of this.state.textField is ${this.state.textField} `)
            } 

        } if (request.type === 'meetupEventData') {
            console.log(request.meetupEventData)
            sendResponse('we received the meetupEventData request, thanks')
            this.setState({
                meetupEventData: request.meetupEventData,
                open: true,
                disabled: false
            });
        } else if (request.type === 'success'){
            sendResponse('we received the success message, thanks')
            this.setState({
                successBox: true,
                disabled: false
            })
        } else if (request.type === 'error'){
            sendResponse('we received the error message, thanks');
            typeof(request.error) === 'object' ? alert(`Something went wrong. Please contact the developer, restart the browser, or try again later. Error Code (Object): ${JSON.stringify(request.error, null, 4)}`) : alert(`Something went wrong. Please contact the developer, restart the browser, or try again later. Error Code: ${request.error}`) 
        };    
    }
    

    render() {
        console.log(`the current state of ${this.state.urlGroupName}`)
        const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        const dateRendered = this.state.date.length === 2 ? `${this.state.date[0].toLocaleDateString("en-US", options)}  -  ${this.state.date[1].toLocaleDateString("en-US", options)}` : this.state.date.toLocaleDateString("en-US", options);

        return (
          <div className="App">
            <DialogComponent open = {this.state.open} handleConfirmation = {this.handleConfirmation.bind(this)} dialogClose = {this.dialogClose.bind(this)} meetupEventData = {this.state.meetupEventData} />
            <SuccessDialogComponent open = {this.state.successBox} dialogClose = {this.successDialogClose.bind(this)} />
            <div style={{margin: '20px'}}>
                <div>
                    <h1 className='rock-salt App-title'>Meetup Batch Event Set Tool</h1>
                    <Form date = {dateRendered} getInputData={this.getAutosuggestInput.bind(this)} onFormSubmit = {this.onFormSubmit.bind(this)} textFieldValue = {this.state.textField} disabled = {this.state.disabled} />
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


