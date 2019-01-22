/*global chrome*/
import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import  AutosuggestField  from "./Autosuggest";


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

    return (

        <form
          onSubmit={this.props.onFormSubmit}
        >
        <div style={gnamestyle}>
        <AutosuggestField getInputData={this.props.getInputData} />
        </div>
        <div style={drangestyle}>  
        <TextField
          id="date-range"
          name="date-range"
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
   