/*global chrome*/
import React, { Component } from "react";
import { Formik } from "formik";
import withStyles from "@material-ui/core/styles/withStyles";
import { Form } from "./form";
import Paper from "@material-ui/core/Paper";
import * as Yup from "yup"
import './App.css';

const styles = theme => ({
 paper: {
   marginTop: theme.spacing.unit * 8,
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   padding: `${theme.spacing.unit * 5}px ${theme.spacing.unit * 5}px ${theme
     .spacing.unit * 5}px`

 },
 container: {
   maxWidth: "200px"
 }


});

const validationSchema = Yup.object({
    name: Yup.string("Enter a name")
    .required("Name is required"),
    email: Yup.string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required"),
    password: Yup.string("")
    .min(8, "Password must contain at least 8 characters")
    .required("Enter your password"),
    confirmPassword: Yup.string("Enter your password")
    .required("Confirm your password")
    .oneOf([Yup.ref("password")], "Password does not match")
})

class InputForm extends Component {
 constructor(props) {
   super(props);
   this.state = {};
 }

 render() {
   const classes = this.props;
   return (
     <React.Fragment>
          <div className={classes.container}>
            <h1 className='rock-salt'>Meetup Batch Event Set Tool</h1>
            <Formik
                render={props => <Form {...props} />}
            />
       </div>
     </React.Fragment>
   );
 }
}

export default withStyles(styles)(InputForm);