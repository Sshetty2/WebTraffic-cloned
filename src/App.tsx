/*global chrome*/

import React, {Component} from "react";
import "./css/styles.css";
import DialogComponent from "./Dialog";
import Calendar from "react-calendar";
import SuccessDialogComponent from "./SuccessDialog";
import LoadingDialogComponent from "./LoadingDialog";
import Form from "./form";

interface AppComponentState {
	meetupEventData: Array<any>;
	grpNameArray: Array<string>;
	date: any;
	open: boolean;
	textField: string;
	urlGroupName: string;
	successBox: boolean;
	disabled: boolean;
	isLoading: boolean;
}

interface AppComponentProps {}

interface IncomingMessage {
	type: string;
	urlGroupName: string;
	meetupEventData: Array<any>;
	error: object;
}

interface Event {
	target: {
		[key: string]: {id: number};
	};
}

export default class App extends Component<AppComponentProps, AppComponentState> {
	constructor(props: object) {
		super(props);
		this.state = {
			grpNameArray: [],
			date: new Date(),
			open: false,
			meetupEventData: [],
			textField: "",
			urlGroupName: "",
			successBox: false,
			disabled: false,
			isLoading: false
		};
	}

	componentDidMount() {
		chrome.storage.local.get(
			["urlGroupName"],
			// callback with results
			(result: {urlGroupName?: string}): void => {
				if (result.urlGroupName) {
					this.setState({
						textField: result.urlGroupName,
						urlGroupName: result.urlGroupName
					});
				} else {
					this.setState({
						textField: "",
						urlGroupName: ""
					});
				}
			}
		);
		chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
	}

	onChange = (date: any) => {
		this.setState({date});
	};

	// sort the data after the two meetupdata obj has been pieced back together so that the order of the data won't change

	sortByTime(dataObj: Array<Date>) {
		return dataObj.sort((a: any, b: any) => {
			let newDate1 = new Date(0);
			let newDate2 = new Date(0);
			a = newDate1.setUTCMilliseconds(a.time);
			b = newDate2.setUTCMilliseconds(b.time);
			return a - b;
		});
	}

	onCheck = (e: Event) => {
		let {meetupEventData} = this.state;
		const otherEvents = meetupEventData.filter(event => event.id !== e.target.id);
		let meetupEvent = meetupEventData.filter(event => event.id === e.target.id);
		meetupEvent = meetupEvent[0];
		let updatedEvent = {
			...meetupEvent,
			checked: !meetupEvent.checked
		};
		meetupEventData = [updatedEvent, ...otherEvents];
		meetupEventData = this.sortByTime(meetupEventData);
		this.setState({
			meetupEventData: meetupEventData
		});
	};

	getAutosuggestInput(value: string) {
		// the input value of the autosuggest component which essentially controls the text field will be set to the value of the text field onchange if there is no urlGrpName in state
		if (!this.state.urlGroupName) {
			this.setState({textField: value});
		}
	}

	onFormSubmit = () => {
		this.setState({
			disabled: true,
			isLoading: true
		});
		let urlPathName;
		if (this.state.textField.length === 0) {
			this.setState({
				disabled: false,
				isLoading: false
			});
			return alert("please enter a valid group name");
		}
		try {
			// try setting the state of the urlGroupName to the url group name that was part of the url Group Name array if the value of the textfield exists in the group Name array pulled from the content script after its been set in local storage
			chrome.storage.local.get(["grpNameArray"], result => {
				if (result.grpNameArray) {
					urlPathName = result.grpNameArray.filter(
						(x: string) => x[1].toLowerCase() === this.state.textField.toLowerCase()
					)[0][0];
					chrome.storage.local.set({
						urlPathName: urlPathName
					});
					console.log(`the urlPathName was set to ${urlPathName}`);
				}
			});
		} catch (err) {
			console.log("there was an error and the urlPathName was not set");
		}
		console.log("proceeding");
		// sets date range start and end in UTC milliseconds since the epoch
		let dateRangeStart =
			this.state.date.length === 2 ? this.state.date[0].getTime() : this.state.date.getTime();
		let dateRangeEnd =
			this.state.date.length === 2
				? this.state.date[1].getTime()
				: this.state.date.getTime() + 86400000;
		chrome.storage.local.set({
			grpNameInput: this.state.textField,
			dateRangeStart: dateRangeStart,
			dateRangeEnd: dateRangeEnd,
			urlPathName: this.state.urlGroupName
		});
		chrome.runtime.sendMessage(
			{
				action: "meetupRequest"
			},
			response => console.log(response)
		);
	};

	// dialogOpen is in the onMessage listener

	dialogClose = () => {
		this.setState({
			open: false,
			date: new Date(),
			disabled: false,
			meetupEventData: []
		});
	};

	successDialogClose = () => {
		this.setState({successBox: false});
	};

	handleConfirmation = () => {
		// only takes events with the checked attribute set to true
		let parsedDataObj = this.state.meetupEventData.filter(x => x.checked === true);
		chrome.runtime.sendMessage(
			{
				type: "googleAuthFlow",
				parsedDataObj: parsedDataObj
			},
			response => console.log(response)
		);
		this.setState({
			open: false,
			meetupEventData: [],
			disabled: true
		});
	};

	handleMessage(request: IncomingMessage, sender: any, sendResponse: Function) {
		// Handle received messages

		if (request.type === "resetTextField" || request.type === "urlGroupName") {
			this.setState({
				textField: "",
				urlGroupName: ""
			});

			if (request.type === "urlGroupName") {
				this.setState({
					urlGroupName: request.urlGroupName,
					textField: request.urlGroupName
				});
			}
		}
		if (request.type === "meetupEventData") {
			let meetupEventData = request.meetupEventData.map((event: object) => ({
				...event,
				checked: true
			}));
			sendResponse("we received the meetupEventData request, thanks");
			this.setState({
				meetupEventData: meetupEventData,
				open: true,
				disabled: false,
				isLoading: false
			});
		} else if (request.type === "success") {
			sendResponse("we received the success message, thanks");
			this.setState({
				successBox: true,
				disabled: false,
				isLoading: false
			});
		} else if (request.type === "error") {
			sendResponse("we received the error message, thanks");
			typeof request.error === "object"
				? alert(
						`Something went wrong. Try tweaking the date range, contacting the developer, restarting the browser, or, try again later... Error Code (Object): ${JSON.stringify(
							request.error
						)}`
				  )
				: alert(
						`Something went wrong. Please contact the developer, restart the browser, or try again later. Error Code: ${
							request.error
						}`
				  );
			this.setState({
				disabled: false,
				isLoading: false
			});
		} else if (request.type === "loadingScreenInit") {
			sendResponse("we received the loadingScreenInit message, thanks");
			this.setState({
				isLoading: true,
				disabled: true
			});
		} else if (request.type === "loadingScreenOff") {
			sendResponse("we received the loadingScreenInit message, thanks");
			this.setState({
				isLoading: false,
				disabled: false
			});
		}
	}

	render() {
		const options = {
			weekday: "short",
			year: "numeric",
			month: "long",
			day: "numeric"
		};
		const dateRendered =
			this.state.date.length === 2
				? `${this.state.date[0].toLocaleDateString(
						"en-US",
						options
				  )}  -  ${this.state.date[1].toLocaleDateString("en-US", options)}`
				: this.state.date.toLocaleDateString("en-US", options);

		return (
			<div className='App'>
				<DialogComponent
					open={this.state.open}
					handleConfirmation={this.handleConfirmation.bind(this)}
					dialogClose={this.dialogClose.bind(this)}
					meetupEventData={this.state.meetupEventData}
					onCheck={this.onCheck.bind(this)}
				/>
				<SuccessDialogComponent
					open={this.state.successBox}
					dialogClose={this.successDialogClose.bind(this)}
				/>
				<LoadingDialogComponent open={this.state.isLoading} />
				<div style={{margin: "20px"}}>
					<div>
						<h1 className='rock-salt App-title'>Meetup Batch Event Set Tool</h1>
						<Form
							date={dateRendered}
							getInputData={this.getAutosuggestInput.bind(this)}
							onFormSubmit={this.onFormSubmit.bind(this)}
							textFieldValue={this.state.textField}
							disabled={this.state.disabled}
						/>
					</div>
				</div>
				<div
					style={{
						margin: "20px",
						paddingBottom: "10px"
					}}>
					<Calendar onChange={this.onChange} value={this.state.date} selectRange={true} />
				</div>
			</div>
		);
	}
}
