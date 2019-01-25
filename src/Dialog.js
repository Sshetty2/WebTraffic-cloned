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
    }


// not needed
//   handleClickOpen = () => {
//     this.setState({ open: true });
//   };



  render() {
    let meetupEventData = this.props.meetupEventData

    function toReadableDateFormat(utcMilliseconds){
        var d = new Date(0);
        d.setUTCMilliseconds(utcMilliseconds)
        return (d.toLocaleDateString("en-US", options));
    }

    let options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    console.log(`the current meetupEventData is ${meetupEventData}`)
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
            {meetupEventData.map((x,i) =>{
                return(
                    <div>
                        <ul key={i} style={{padding:'0px', margin:'0px'}}>
                            <li>{x["venue"]["name"]}</li>
                            <li>{x["name"]}</li>
                            <li>{toReadableDateFormat(x["time"])}</li>
                        </ul>
                    </div>
                )
            })}
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

// {meetupEventData.map((x,i) =>{
    
//         Name:{x["venue"]["name"]}
//         Name:{x["name"]}
//         Date:{toReadableDateFormat(x["time"])}
    
// })}