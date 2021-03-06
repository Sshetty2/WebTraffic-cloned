import React from "react";
import Dialog from "@material-ui/core/Dialog";
import "./css/index.css";
import Loader from "react-loader-spinner";

const LoadingDialogComponent = props => {
	return (
		<React.Fragment>
			<Dialog
				open={props.open}
				keepMounted
				onClose={props.handleClose}
				aria-labelledby='alert-dialog-slide-title'
				aria-describedby='alert-dialog-slide-description'
				PaperProps={{
					style: {
						backgroundColor: "transparent",
						boxShadow: "none",
						overflow: "hidden"
					}
				}}>
				<Loader type='Ball-Triangle' color='#fff' height={80} width={80} />
			</Dialog>
		</React.Fragment>
	);
};

export default LoadingDialogComponent;
