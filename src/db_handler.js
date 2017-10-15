const JsonDB = require('node-json-db');

const db = new JsonDB('HLCModDB', true, false);

/*export const get_user = function(teamId,userId){
  let data = false;
  try {data = db.getData(`/users/${teamId}/${userId}`); } catch (error) {
    console.error(error);
  }
  return data
}

*/


