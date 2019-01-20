/*global chrome*/
import React from 'react';
import Autosuggest from 'react-autosuggest';
import TextField from "@material-ui/core/TextField";
import './App.css';


export default class AutosuggestField extends React.Component {
  constructor(props) {
    super(props);
    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.

    this.state = {
      value: '',
      suggestions: [],
      grpNameArray: []
    };

    // Imagine you have a list of languages that you'd like to autosuggest

  }

  

// Teach Autosuggest how to calculate suggestions for any given input value.
getSuggestions = x => {
    chrome.storage.local.get(['grpNameArray'], (result) => {
        if(result.grpNameArray){
        this.setState({
            grpNameArray: result.grpNameArray
        });
      }
    });

    const inputValue = x.trim().toLowerCase();
    const inputLength = inputValue.length;
    console.log(this.state.grpNameArray)

    return inputLength === 0 ? [] : this.state.grpNameArray.filter(y =>
    y.toLowerCase().slice(0, inputLength) === inputValue
  );
};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
getSuggestionValue = suggestion => suggestion;



renderInputComponent = inputProps => (
<TextField
        id="group-name"
        name="group-name"
        label="Group Name"
        //   helperText={this.props.touched.email ? this.props.errors.email : ""}
        //   error={this.props.touched.email && Boolean(this.props.errors.email)}
        
        fullWidth
        //   value={this.props.date}
        //   onChange={change.bind(null, "email")}
        {...inputProps} 

        />
)

// Use your imagination to render suggestions.
renderSuggestion = suggestion => (
<span className='cav-brush'>{suggestion}</span>
);




  // onChange = (event, { newValue }) => {
  //   this.setState({
  //       value: newValue
        
  //   });
  //   console.log(this.state.value)
  // };


  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.


  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.


  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;
    console.log(this.props.onGroupChange)
    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Type A Group Name',
      value,
      onChange: this.props.onGroupChange.bind(this)
    };

    // Finally, render it!
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps}
        renderInputComponent={this.renderInputComponent}
      />
    );
  }
}

