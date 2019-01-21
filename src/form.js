/*global chrome*/
import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import  AutosuggestField  from "./Autosuggest";

import $ from 'jquery';

require("./styles.css");


export default class Form extends React.Component {
  constructor(props) {
    super(props);

  }



  render(){


    var gnamestyle = {
      paddingTop: '0px',
      paddingBottom:'20px'
    };

    var drangestyle = {
      paddingTop: '10px'
    }

    // const change = (name, e) => {
    //   e.persist();
    //   handleChange(e);
    // };
    console.log(this.props.date)


    return (

        <form
          onSubmit={() => {
            alert(this.props.date);
          }}
        >
        <div style={gnamestyle}>
        <AutosuggestField />
        </div>
        <div style={drangestyle}>  
        <TextField
          id="date-range"
          name="date-range"
          // helperText={touched.email ? errors.email : ""}
          // error={touched.email && Boolean(errors.email)}
          label="Date Range"
          fullWidth
          value={this.props.date}
          required= {false}
        />
        </div>
        <div style={{paddingTop: '20px'}}>
          <Button
            type="submit"
            fullWidth
            variant="raised"
            color="primary"
            disabled={false}
          >
            Schedule
          </Button>
        </div>
      </form>
    );
   };
  }
   