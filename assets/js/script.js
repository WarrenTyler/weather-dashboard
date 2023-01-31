// API Key
const apiKey = "0c844d8b5a9a8c945f153e1fd8606479";

// DOM elements
const searchButtonEl = document.querySelector("#search-button");
const searchInputEl = document.querySelector("#search-input");
const searchHistoryEl = document.querySelector("#search-history");

populateSearchHistory();

function populateSearchHistory() {
  const storedCities = JSON.parse(localStorage.getItem("cities")) || [];
  storedCities.forEach((city) => {
    addToSearchHistory(city.name);
    console.log(city.name);
  });
}

function newButtonEl(cityName) {
  return Object.assign(document.createElement("button"), {
    className: "btn btn-secondary",
    textContent: cityName,
    type: "button",
    name: cityName
  });
}

function addToSearchHistory(cityName) {
  // get node list of existing buttons in search history
  const cityButtonEls = searchHistoryEl.querySelectorAll("button");

  // add button to search history, if not already present
  if(![...cityButtonEls].some(button => button.name === cityName)){
    searchHistoryEl.prepend(newButtonEl(cityName));
  }
}

// addEventListener on search button
searchButtonEl.addEventListener("click", function (event) {
  event.preventDefault();
  // store searchInput into variable
  const city = searchInputEl.value;
  console.log("Search for City: " + city);

  // const city = "London";

  // URL 1 build
  const queryURL1 = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;

  // We need this data first in order to make the 2nd request
  fetch(queryURL1)
    .then((response) => response.json())
    .then((citiesFound) => {
      console.log(citiesFound);
      // console.log(citiesFound)
      const firstCity = citiesFound[0];
      console.log("firstCity: " + firstCity.name);
      // console.log("lat: " + firstCity.lat);
      // console.log("lon" + firstCity.lon);

      // 2nd URL data request chained onto 1st URL data request
      const queryURL2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${firstCity.lat}&lon=${firstCity.lon}&appid=${apiKey}`;

      addCititesToLocalStorage(firstCity);
      
      return fetch(queryURL2);
    })
    .then((response) => response.json())
    .then((cityData) => {
      // the below is the data from return fetch (queryURL2)
      // console.log(cityData);
      addToSearchHistory(cityData.city.name);
    });

  // Function to save cities to localStorage
  function addCititesToLocalStorage(cityToStore) {
    const storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    if (!storedCities.some((city) => city.name === cityToStore.name)) {
      storedCities.push(cityToStore);
    }
    localStorage.setItem("cities", JSON.stringify(storedCities));
  }
});
