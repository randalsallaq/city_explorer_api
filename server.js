/// a must
let express = require('express');
let cors = require('cors');
// const { json } = require('express');

let app = express();
app.use(cors());

require('dotenv').config();
const PORT = process.env.PORT;
///


app.get('/location', handleLocation);

app.get('/weather', handleWeather);


function handleLocation(request, response){

    try{
    let city = request.query.city;
    let jsonData = require('./data/location.json');
    let jsonobject = jsonData[0];
    let locationObject = new Location(city, jsonobject.display_name, jsonobject.lat, jsonobject.lon);
    response.status(200).json(locationObject);
    } catch (error) {
        response.status(500).send('something went wrong');

    }
}

function Location(city, display_name, lat, lon){

this.search_query = city;
this.formatted_query = display_name;
this.latitude = lat;
this.longitude = lon;


}
//******************* */
// //{
//     "search_query": "seattle",
//     "formatted_query": "Seattle, WA, USA",
//     "latitude": "47.606210",
//     "longitude": "-122.332071"
//   }

/****************** */



function handleWeather(request, response){

 let weatherArray = [];

try{
let jsonData = require('./data/weather.json');
let jsonobject = jsonData.data;
console.log(jsonobject);
for (var i=0 ; i < jsonobject.length ; i++){

// jsonobject[i].valid_date;
// jsonobject[i].weather.description;
let weatherObject = new Weather(jsonobject[i].valid_date, jsonobject[i].weather.description);
weatherArray.push(weatherObject);

}
response.status(200).json(weatherArray);
} catch(error){
    response.status(500).send('something went wrong');
}
}

function Weather(valid_date, weather){
    this.forecast = weather;
    this.time = valid_date;
}

//listen
app.listen(PORT, ()=>{
    console.log(`app is listening on this port ${PORT}`)
});


