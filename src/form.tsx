import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import AutosuggestField from "./Autosuggest";

import "./css/index.css";

interface FormComponentProps {
	date: Date;
	getInputData: Function;
	onFormSubmit: Function;
	textFieldValue: string;
	disabled: boolean;
}

interface FormComponentState {}
export default class Form extends React.Component<FormComponentProps, FormComponentState> {
	render() {
		var gnamestyle = {
			paddingTop: "10x",
			paddingBottom: "10px"
		};
		var drangestyle = {
			paddingTop: "10px"
		};
		return (
			<React.Fragment>
				<div style={gnamestyle}>
					<AutosuggestField
						getInputData={this.props.getInputData}
						textFieldValue={this.props.textFieldValue}
					/>
				</div>
				<div style={drangestyle}>
					<TextField
						id='date-range'
						name='date-range'
						label='Date Range'
						fullWidth
						value={this.props.date}
						required={false}
					/>
				</div>
				<div style={{paddingTop: "20px"}}>
					<Button
						type='submit'
						fullWidth
						variant='raised'
						color='primary'
						disabled={this.props.disabled}
						onClick={this.props.onFormSubmit}
						id='mbest-form-button'>
						Schedule
					</Button>
				</div>
			</React.Fragment>
		);
	}
}
