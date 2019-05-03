import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import './css/index.css';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const SuccessDialogComponent = props => {
    return (
      <div>
        {/* <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
          Slide in alert dialog
        </Button> */}
        <Dialog
          open={ props.open }
          TransitionComponent={ Transition }
          keepMounted
          onClose={ props.handleClose }
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description" style={{color:'rgba(0, 0, 0, 0.85)', textShadow:'#0072ff99 1px 0 17px'}}>
              <p>The Items were successfully posted to your Google Calendar and we've attempted to RSVP for your events with a high chance of success!</p>
              <p>Thanks you for using Meetup-Batch Event Set Tool!</p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={ props.dialogClose } color="primary">
              Thanks
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );

}

export default SuccessDialogComponent;