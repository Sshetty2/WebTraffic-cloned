/*global chrome*/
import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import  Example  from "./Autosuggest";

import $ from 'jquery';

require("./styles.css");


export const Form = props => {
    const {
      values: { name, email, password, confirmPassword },
      errors,
      touched,
      handleChange,
      isValid,
      setFieldTouched
    } = props;

    var gnamestyle = {
      paddingTop: '0px',
      paddingBottom:'20px'
    };

    var drangestyle = {
      paddingTop: '10px'
    }

   
    const change = (name, e) => {
      e.persist();
      handleChange(e);
      setFieldTouched(name, true, false);
    };


    return (

        <form
          onSubmit={() => {
            alert(props.date);
          }}
        >
        <div style={gnamestyle}>
        <Example {...props} errors={errors}/>
        </div>
        <div style={drangestyle}>  
        <TextField
          id="date-range"
          name="date-range"
          helperText={touched.email ? errors.email : ""}
          error={touched.email && Boolean(errors.email)}
          label="Date Range"
          fullWidth
          value={props.date}
          onChange={change.bind(null, "email")}
          required= {false}
        />
        </div>
        <div style={{paddingTop: '20px'}}>
          <Button
            type="submit"
            fullWidth
            variant="raised"
            color="primary"
            disabled={!isValid}
          >
            Schedule
          </Button>
        </div>
      </form>
    );
   };
   