/// a must
let express = require('express');
let cors = require('cors');
const { json } = require('express');

let app = express();
app.use(cors());

require('dotenv').config();
const PORT = process.env.PORT;
///


app.get('/location', handleLocation);


function handleLocation(request, response){
    let city = request.query.city;
    let jsonData = require('./data/location.json');
    let jsonobject = jsonData[0];
    let locationObject = new Location(city, jsonobject.display_name, jsonobject.lat, jsonobject.lon);
    response.status(200).json(locationObject);
}

function Location(search_query, formatted_query,latitude,longitude ){

this.search_query = search_query;
this.formatted_query = formatted_query;
this.latitude = latitude;
this.longitude = longitude;


}

// //{
//     "search_query": "seattle",
//     "formatted_query": "Seattle, WA, USA",
//     "latitude": "47.606210",
//     "longitude": "-122.332071"
//   }

//listen
app.listen(PORT, ()=>{
    console.log(`app is listening on this port ${PORT}`)
});


