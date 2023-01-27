// API Key
let apiKey = "";

// DOM elements
let searchButton = document.querySelector("#search-button");
let searchInput = document.querySelector("#search-input");
let cityList = document.querySelector(".city-list");

// addEventListener on search button
searchButton.addEventListener("click", function (event) {
  event.preventDefault();
  // store searchInput into variable
  let city = searchInput.value;
  console.log(city);

  // let city = "London";

  // URL 1 build
  let queryURL1 =
    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=` +
    apiKey;

  // We need this data first in order to make the 2nd request
  fetch(queryURL1)
    .then((response) => response.json())
    .then((citiesFound) => {
      let firstCity = citiesFound[0];
      console.log(firstCity.lat);
      console.log(firstCity.lon);

      // 2nd URL data request chained onto 1st URL data request
      let queryURL2 =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${firstCity.lat}&lon=${firstCity.lon}&appid=` +
        apiKey;

      return fetch(queryURL2);
    })

    .then((response) => response.json())
    .then((cityData) => {
      // the below is the data from return fetch (queryURL2)
      console.log(cityData);
    });

  // Create elements for every city searched
  let cityButton = document.createElement("li");

  // Assign text value
  cityButton.innerHTML = city;

  // Prepend every city
  cityList.prepend(cityButton);

  // Empty array to store cities in localStorage
  let cities = [];
  // Push cities searched into this array
  cities.push(city);

  // Function to save cities to localStorage
  function storeCitites() {
    localStorage.setItem("cities", JSON.stringify(cities));
    console.log(localStorage);
  }
  storeCitites();

  // Function to retrieve cities from localStorage

});