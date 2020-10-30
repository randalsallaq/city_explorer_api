/// require
let express = require('express');
let cors = require('cors');

let app = express();
app.use(cors());

require('dotenv').config();

let superagent = require('superagent');
const { query } = require('express');


//env
const PORT = process.env.PORT;
const weatherAPI = process.env.WEATHER_API_KEY;
const locationAPI = process.env.GEOCODE_API_KEY;
const trailsAPI = process.env.TRAIL_API_KEY


//get
app.get('/location', handleLocation);

app.get('/weather', handleWeather);

app.get('/trails', handleTrails);

let currentCity = "amman";
let lat = " ";
let lon = " ";
///location
/////////////////////////////////////////////
function handleLocation(request, response){

    
    let city = request.query.city;
    currentCity = city; 
    superagent.get(`https://eu1.locationiq.com/v1/search.php?key=${locationAPI}&q=${city}&format=json`).then((data)=>{
        let apiObject = data.body[0];
        let locationObject = new Location(city, apiObject.display_name, apiObject.lat, apiObject.lon);
        lat = apiObject.lat;
        lon = apiObject.lon;
        response.status(200).json(locationObject);
    });

  
    // } catch (error) {
    //     response.status(500).send('something went wrong');

    // }
}

function Location(city, display_name, lat, lon){

this.search_query = city;
this.formatted_query = display_name;
this.latitude = lat;
this.longitude = lon;


}
///////////////////////////////////////////


///weather
//////////////////////////////////////////
function handleWeather(request, response){

 let weatherArray = [];

// try{
    superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${currentCity}&key=${weatherAPI}`).then((data)=>{
        console.log(data.body);
        let apiObject = data.body.data;
      
        for (var i=0 ; i < apiObject.length ; i++){
        
        let weatherObject = new Weather(apiObject[i].valid_date, apiObject[i].weather.description);
        weatherArray.push(weatherObject);
        
        }
        response.status(200).json(weatherArray);

    });

// } catch(error){
//     response.status(500).send('something went wrong');
// }
}

function Weather(valid_date, weather){
    this.forecast = weather;
    this.time = valid_date;
}
//////////////////////////////////////////


//trails

function handleTrails(request,response){



superagent.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=50&key=${trailsAPI}`).then((data)=>{


let trailsArray = [];
let apiObject = data.body.trails;

for (let i=0; i<apiObject.length; i++){
console.log(apiObject[i]);
    let traileObject = new Trails(apiObject[i].name, apiObject[i].location, apiObject[i].length, apiObject[i].stars, apiObject[i].starVotes, apiObject[i].summary, apiObject[i].url, apiObject[i].conditionDetails, apiObject[i].conditionDate);
    // console.log(apiObject[i].conditionDetails);
    trailsArray.push(traileObject);
}
response.status(200).json(trailsArray);

});

}

function Trails(name, location, length, stars, starVotes, summary, url, conditionDetails, conditionDate ){

    this.name = name;
    this.location = location;
    this.length = length;
    this.stars = stars;
    this.star_votes = starVotes;
    this.summary = summary;
    this.trail_url = url;
    this.conditions = conditionDetails;
    this. condition_date = conditionDate;
    

}

//listen
app.listen(PORT, ()=>{
    console.log(`app is listening on this port ${PORT}`)
});


