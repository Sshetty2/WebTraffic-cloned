import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import './App.css';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

export default class SuccessDialogComponent extends React.Component {
    constructor(props) {
        super(props);
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
          {/* <DialogTitle style={{padding: '20px 24px 6px'}} id="alert-dialog-slide-title">
           <h1 className='habibi Dialog-header'></h1>
          </DialogTitle> */}
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              <p>The Items were successfully posted to your Google Calendar!</p>
              <p>Keep in mind that you have only scheduled the events. If you plan on attending, you should RSVP so that they will know you'll be coming :)</p>
              <p>Thanks for using Meetup-Batch Event Set Tool</p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.dialogClose} color="primary">
              Thanks
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
