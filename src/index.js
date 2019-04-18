import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

if(document.getElementsByTagName('title')[0].innerHTML === 'Meetup Batch Event Set Tool')
ReactDOM.render(<App />, document.getElementById('root'));
