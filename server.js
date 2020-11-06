/// require
let express = require('express');
let cors = require('cors');

let app = express();
app.use(cors());

require('dotenv').config();


let pg = require('pg');
//client??
let client = new pg.Client(process.env.DATABASE_URL);
let superagent = require('superagent');
const { request, response } = require('express');



//env
const PORT = process.env.PORT;
const weatherAPI = process.env.WEATHER_API_KEY;
const locationAPI = process.env.GEOCODE_API_KEY;
const trailsAPI = process.env.TRAIL_API_KEY;
const moviesAPI = process.env.MOVIE_API_KEY;
const yelpAPI = process.env.YELP_API_KEY;

//get
app.get('/location', locationChecking);

app.get('/weather', handleWeather);

app.get('/trails', handleTrails);

app.get('/movies', handleMovies);

app.get('/yelp', handleYelp);


let currentCity = "london";
let lat = " ";
let lon = " ";
///location
/////////////////////////////////////////////
function handleLocation(city, request, response){


    currentCity = city; 
    superagent.get(`https://eu1.locationiq.com/v1/search.php?key=${locationAPI}&q=${city}&format=json`).then((data)=>{
        console.log('superagent location');
        let apiObject = data.body[0];
        let locationObject = new Location(city, apiObject.display_name, apiObject.lat, apiObject.lon);
        lat = apiObject.lat;
        lon = apiObject.lon;

        let insert = `INSERT INTO locations (search_query , formatted_query , latitude , longitude) VALUES ($1,$2,$3,$4) RETURNING *;`;

        //mapping
        let values = [city, apiObject.display_name, apiObject.lat, apiObject.lon];

        client.query(insert, values)
          .then(data => {
         
           
          }).catch(error => {
            console.log('something went wrong123 ', error);
    
          });

        response.status(200).json(locationObject);
    }).catch ((error) => {
        response.status(500).send('something went wrong456');
    });
}

function locationChecking(request,response){
    let city = request.query.city;
    let selectStatement = `SELECT search_query,formatted_query,latitude,longitude FROM locations WHERE search_query='${city}';`;
    client.query(selectStatement).then(data=>{

    
    if (data.rowCount !== 0) {
        console.log('data');
        lat = data.rows[0].latitude;
        lon = data.rows[0].longitude;
        response.send(data.rows[0]);
      }
  
      else {
        console.log('handelLocation from checkerlocation');
        handleLocation(city, request, response);
      }
  
  
    }).catch((error) => {
      console.log('catch Data');
      response.send('error');
  
    });
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

    }).catch ((error) => {
        response.status(500).send('something went wrong');
    });
}

function Weather(valid_date, weather){
    this.forecast = weather;
    this.time = new Date(valid_date).toDateString();
}
//////////////////////////////////////////


//trails

function handleTrails(request,response){

console.log(lat,lon);
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

}).catch ((error) => {
    response.status(500).send('something went wrong');
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


function handleMovies(request, response){

   
       superagent.get(`https://api.themoviedb.org/3/search/movie?api_key=${moviesAPI}&query=${currentCity}`).then((data)=>{
           let moviesArray = []
           let apiObject = data.body.results;
         
           for (let i=0 ; i < apiObject.length ; i++){
           
           let moviesObject = new Movie(apiObject[i].title, apiObject[i].overview, apiObject[i].vote_average, apiObject[i].vote_count, apiObject[i].poster_path, apiObject[i].popularity, apiObject[i].release_date);
           moviesArray.push(moviesObject);
           }
           response.status(200).json(moviesArray);
   
       }).catch ((error) => {
           response.status(500).send('something went wrong');
       });
   }

   function Movie(title, overview, vote_average, vote_count, poster_path, popularity, release_date ){


    this.title = title;
    this.overview = overview;
    this.average_votes = vote_average;
    this.total_votes = vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${poster_path}`;
    this.popularity = popularity;
    this.released_on = release_date;
   }


   

function handleYelp(request,response){
  
    let page = request.query.page;
    let pagNum = 5; //5 numbers in each request
    let beginnigPage = (page-1)*pagNum;

const yelpParameters = {

    terms : 'restaurant',
    location : currentCity,
    limit : 5,
    offset : beginnigPage,

};

    superagent.get(`https://api.yelp.com/v3/businesses/search`).query(yelpParameters).set('Authorization', `Bearer ${yelpAPI}`).then((data)=>{
        let yelpArray = [];
     
        let apiObject = data.body.businesses;
      
        for (let i=0 ; i < apiObject.length ; i++){
        
        let yelpObject = new Yelp(apiObject[i].name, apiObject[i].image_url, apiObject[i].price, apiObject[i].rating, apiObject[i].url);
        yelpArray.push(yelpObject);
        };

        response.status(200).json(yelpArray);

    }).catch ((error) => {
        response.status(500).send('something went wrong');
    });


}


function Yelp(name, image_url, price, rating, url){

    this.name = name;
    this.image_url = image_url;
    this.price = price;
    this.rating = rating;
    this.url = url;

}

//listen
client.connect().then((data)=>{
    app.listen(PORT, ()=>{
        console.log(`app is listening on this port ${PORT}`)
    });
}).catch ((error) => {
    response.status(500).send('something went wrong',error);
});




