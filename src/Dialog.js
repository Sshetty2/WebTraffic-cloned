import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import uniqueId from 'lodash/uniqueId';
import './App.css';

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

const DialogComponent = props => {

    let meetupEventData = props.meetupEventData
    meetupEventData = meetupEventData.map(event => ({ ...event, checked: false, id: uniqueId() }));
    

    const onCheck = (e) => {
      console.log(e.target.id)
      const otherEvents = meetupEventData.filter(event => event.id !== e.target.id);
      let meetupEvent = meetupEventData.filter(event => event.id === e.target.id)
      meetupEvent = meetupEvent[0]
      let updatedEvent = { ...meetupEvent , checked: !meetupEvent.checked };
      meetupEventData = 
      // console.log(`meetup event after updated ${JSON.stringify(updatedEvent, null, 4)}`)
      // this.setState({ items: [updatedItem, ...otherItems] });
    } 


    function toReadableDateFormat(utcMilliseconds){
        var d = new Date(0);
        d.setUTCMilliseconds(utcMilliseconds)
        return (d.toLocaleDateString("en-US", options));
    }
    let options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };

    return (
        <Dialog
          open={props.open}
          TransitionComponent={Transition}
          keepMounted
          onClose={props.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle style={{padding: '20px 24px 6px'}} id="alert-dialog-slide-title">
           <h1 className='habibi Dialog-header'>{"Heres What I found! . . ."}<br />{"Are you sure you'd like to schedule the following events?"}</h1>
          </DialogTitle>
          
          <DialogContent style={{padding: '0px 0px 0px 22px'}} >
          <DialogContentText id="alert-dialog-slide-description">
            {meetupEventData.map((x,i) =>{
                return(
                    <div>
                        <ul key={i} style={{padding:'0px 0px 18px 0px', margin: '0px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                              <li style={{color: 'rgba(0, 0, 0, 0.85)'}}>{typeof x["venue"] !== 'undefined' ? x["venue"]["name"]: null}</li>
                              <input
                                  style={{marginRight: '15px'}}
                                  type="checkbox"
                                  checked= {x["checked"]}
                                  onChange = {onCheck}
                                  id = {x["id"]}
                              />
                            </div>
                            <li style={{textDecoration: 'underline', color: 'rgba(0, 0, 0, 0.85)'}}><a href={x["event_url"]} target="_blank">{x["name"]}</a></li>
                            <li style={{color: 'rgba(0, 0, 0, 0.85)'}}>{toReadableDateFormat(x["time"])}</li>
                        </ul>
                    </div>
                )
            })}
            </DialogContentText>
            
          </DialogContent>
          <div style={{padding:'0px 20px 0px 20px'}}>
          <h3 style={{fontSize:'13px', textShadow:'#ff8a00bd 1px 0 7px'}}>{"Warning: You must be signed into chrome or allow syncing on request for the authentication flow to work properly"}</h3>
          </div>
          <DialogActions>
            <Button onClick={props.dialogClose} color="primary">
              No
            </Button>
            <Button onClick={props.handleConfirmation} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
    );
}

export default DialogComponent;