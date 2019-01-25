/*global chrome*/
import React from 'react';
import Autosuggest from 'react-autosuggest';
import TextField from "@material-ui/core/TextField";
import './App.css';


export default class AutosuggestField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: [],
      grpNameArray: []
    };


  }



getSuggestions = x => {
// gets suggestions array from chrome local storage after it has been set in the content script which was initiated through a message from the background script when a tab is updated
    chrome.storage.local.get(['grpNameArray'], (result) => {
        if(result.grpNameArray){
        this.setState({
            grpNameArray: result.grpNameArray
        });
      }
    });

    const inputValue = x.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.state.grpNameArray.filter(y =>
    y.toLowerCase().slice(0, inputLength) === inputValue
  );
};

getSuggestionValue = suggestion => suggestion;

renderInputComponent = inputProps => (
<TextField
        id="group-name"
        name="group-name"
        label="Group Name"       
        fullWidth
        {...inputProps} 
        refCallback={inputProps.ref}
        ref={null}
        />
)

renderSuggestion = suggestion => (
<span className='open-sans'>{suggestion}</span>
);

  onChange = (event, { newValue }) => {
    this.setState({
        value: newValue
        
    });
    this.props.getInputData(newValue);
  };


  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };



  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;

    const inputProps = {
      placeholder: 'Type A Group Name',
      value,
      onChange: this.onChange
    };

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

