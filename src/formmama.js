/*global chrome*/
import React, { Component } from "react";

import  Form  from "./form";

import './App.css';


// const validationSchema = Yup.object({
//     name: Yup.string("Enter a name")
//     .required("Name is required"),
//     email: Yup.string("Enter your email")
//     .email("Enter a valid email")
//     .required("Email is required"),
//     password: Yup.string("")
//     .min(8, "Password must contain at least 8 characters")
//     .required("Enter your password"),
//     confirmPassword: Yup.string("Enter your password")
//     .required("Confirm your password")
//     .oneOf([Yup.ref("password")], "Password does not match")
// })

class FormMamma extends Component {
 constructor(props) {
   super(props);
 }

 render() {
   return (
     <React.Fragment>
          <div>
            <h1 className='rock-salt'>Meetup Batch Event Set Tool</h1>
              <Form date = {this.props.date} />
           </div>
     </React.Fragment>
   );
 }
}

export default FormMamma;