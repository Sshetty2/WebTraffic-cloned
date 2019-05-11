import React, {Component} from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";

import "./css/index.css";

function Transition(props: DialogComponentProps) {
	return <Slide direction='down' {...props} />;
}
interface DialogComponentProps {
	open: boolean;
	handleConfirmation: Function;
	dialogClose: Function;
	meetupEventData: Array<any>;
	onCheck: Function;
	handleClose: Function;
}

interface DialogComponentState {}

export default class DialogComponent extends Component<DialogComponentProps, DialogComponentState> {
	toReadableDateFormat(utcMilliseconds: number) {
		var d = new Date(0);
		d.setUTCMilliseconds(utcMilliseconds);
		let options = {
			weekday: "short",
			year: "numeric",
			month: "long",
			day: "numeric"
		};
		return d.toLocaleDateString("en-US", options);
	}

	render() {
		let {open, handleClose, dialogClose, handleConfirmation} = this.props;
		let {meetupEventData, onCheck} = this.props;
		let greeting =
			meetupEventData.length > 0
				? `Here's what I found for ${meetupEventData[0]["group"]["name"]}!`
				: "I couldn't find anything! Please try searching a different group name or select a different date range";
		let followUp =
			meetupEventData.length > 0 ? "Are you sure you'd like to schedule the following events?" : null;
		return (
			<Dialog
				open={open}
				TransitionComponent={Transition}
				keepMounted
				onClose={() => handleClose()}
				aria-labelledby='alert-dialog-slide-title'
				aria-describedby='alert-dialog-slide-description'>
				<DialogTitle style={{padding: "20px 24px 6px"}} id='alert-dialog-slide-title'>
					<h1 className='habibi Dialog-header'>
						{greeting}
						<br />
						{followUp}
					</h1>
				</DialogTitle>
				<DialogContent style={{padding: "0px 0px 0px 22px"}}>
					<DialogContentText id='alert-dialog-slide-description'>
						{meetupEventData.map((x, i) => {
							return (
								<div>
									<ul key={i} style={{padding: "0px 0px 18px 0px", margin: "0px"}}>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between"
											}}>
											<li style={{color: "rgba(0, 0, 0, 0.85)"}}>
												{typeof x["venue"] !== "undefined" ? x["venue"]["name"] : x["group"]["name"]}
											</li>
											<input
												style={{marginRight: "15px"}}
												type='checkbox'
												checked={x["checked"]}
												onChange={(e) => onCheck(e)}
												id={x["id"]}
											/>
										</div>
										<li
											style={{
												textDecoration: "underline",
												color: "rgba(0, 0, 0, 0.85)"
											}}>
											<a href={x["link"]} target='_blank'>
												{x["name"]}
											</a>
										</li>
										<li style={{color: "rgba(0, 0, 0, 0.85)"}}>{this.toReadableDateFormat(x["time"])}</li>
									</ul>
								</div>
							);
						})}
					</DialogContentText>
				</DialogContent>
				<div style={{padding: "0px 20px 0px 20px"}}>
					<h3 style={{fontSize: "13px", textShadow: "#ff8a00bd 1px 0 7px"}}>
						{
							"Warning: You must be signed into chrome or allow syncing on request for the authentication flow to work properly"
						}
					</h3>
				</div>
				<DialogActions>
					<Button onClick={() => dialogClose()} color='primary'>
						No
					</Button>
					<Button onClick={() => handleConfirmation()} color='primary'>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}
