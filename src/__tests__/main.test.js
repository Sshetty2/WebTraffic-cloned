/* eslint-env jest */

import { makeXhrRequestGeneric } from '../../background_scripts/bgscript-xhrs';
import * as bgconstants from '../../background_scripts/bgscript-constants';


var getUser = user => fetch(`https://api.github.com/users/${user}`)

// var options = {
//     method: 'GET',
//     headers: {'user-agent': 'node.js'}
// };



// describe('#xhrMeetupTokenRequest()', () => {
//     it('should supply a token from Meetup\'s API', () => {
        
//     })
// })




// A simple example test
describe('#getUser() using Promises', () => {
  it('should load user data', () => {
    return getUser('vnglst')
    .then(data => {
        data.json().then(json => {
            expect(json).toBeDefined()
            expect(json.id).toEqual(3457693)
            console.log(bgconstants.mCK)
        })
    })
  })
})