/*global chrome*/
import React from "react";
import Autosuggest from 'react-autosuggest';
import TextField from "@material-ui/core/TextField";

// Imagine you have a list of languages that you'd like to autosuggest.
const languages = [
  {
    name: 'C',
    year: 1972
  },
  {
    name: 'Elm',
    year: 2012
  },
];



// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : languages.filter(lang =>
    lang.name.toLowerCase().slice(0, inputLength) === inputValue
  );
};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.name;

// const change = (name, e) => {
//     e.persist();
//     this.props.handleChange(e);
//     this.props.setFieldTouched(name, true, false);
//   };


const renderInputComponent = inputProps => (
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
const renderSuggestion = suggestion => (
  <div>
    {suggestion.name}
  </div>
);

export default class Example extends React.Component {
  constructor() {
    super();

    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.

    this.state = {
      value: '',
      suggestions: []
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
        value: newValue
    });

    chrome.storage.local.get(['grpNameArray'], function(result) {
        console.log('Value currently is ' + result.grpNameArray);
        this.setState({
            suggestions: result.grpNameArray,
        });
    }.bind(this));
  };


//   chrome.storage.local.get(['grpNameArray'], function(result) {
//     console.log('Value currently is ' + result.grpNameArray);
//   });

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.


  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
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

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Type A Group Name',
      value,
      onChange: this.onChange
    };

    // Finally, render it!
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        renderInputComponent={renderInputComponent}
      />
    );
  }
}

