import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import './App.css';

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

export default class DialogComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }


// not needed
//   handleClickOpen = () => {
//     this.setState({ open: true });
//   };



  render() {
    return (
      <div>
        {/* <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
          Slide in alert dialog
        </Button> */}
        <Dialog
          open={this.props.open}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle style={{padding: '20px 24px 6px'}} id="alert-dialog-slide-title">
           <h1 className='habibi Dialog-header'>{"Heres What I found! . . ."}<br />{"Are you sure you'd like to schedule the following events?"}</h1>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
            <div>
                <ul>
                    <li>Group Name:</li>
                    <li>Event Name:</li>
                    <li>Event Date:</li>
                </ul>
            </div> 
            <div>
                <ul>
                    <li>Group Name:</li>
                    <li>Event Summary:</li>
                    <li>Event Date:</li>
                </ul>
            </div> 
            <div>
                <ul>
                    <li>Group Name:</li>
                    <li>Event Summary:</li>
                    <li>Event Date:</li>
                </ul>
            </div> 
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.dialogClose} color="primary">
              No
            </Button>
            <Button onClick={this.props.handleConfirmation} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

