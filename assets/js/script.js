// API Key
const apiKey = "0c844d8b5a9a8c945f153e1fd8606479";

// DOM elements
const searchButtonEl = document.querySelector("#search-button");
const searchInputEl = document.querySelector("#search-input");
const searchHistoryEl = document.querySelector("#search-history");

populateSearchHistory();

function populateSearchHistory() {
  const storedWeather =
    JSON.parse(localStorage.getItem("weatherForCities")) || [];
  storedWeather.forEach((weather) => {
    addToSearchHistory(weather.city.name);
    // console.log(city.name);
  });
}

function newButtonEl(cityName) {
  return Object.assign(document.createElement("button"), {
    className: "btn btn-secondary",
    textContent: cityName,
    type: "button",
    name: cityName,
  });
}

function addToSearchHistory(cityName) {
  // get node list of existing buttons in search history
  const cityButtonEls = searchHistoryEl.querySelectorAll("button");

  // add button to search history, if not already present
  if (![...cityButtonEls].some((button) => button.name === cityName)) {
    searchHistoryEl.prepend(newButtonEl(cityName));
  }
}

// Function to save cities to localStorage
function addWeatherToLocalStorage(cityWeather) {
  const storedWeather =
    JSON.parse(localStorage.getItem("weatherForCities")) || [];
  if (
    !storedWeather.some(
      (weather) => weather.city.name === cityWeather.city.name
    )
  ) {
    storedWeather.push(cityWeather);
  }
  localStorage.setItem("weatherForCities", JSON.stringify(storedWeather));
}

function populateTodayPanel(weather) {
  const todayPanelEl = document.querySelector("#today-panel");

  todayPanelEl.innerHTML = createTodayPanelHTML(weather);
}

function getWeatherIconURL(weather) {
  return `http://openweathermap.org/img/wn/${weather.list[0].weather[0].icon}@2x.png`;
}

function convertKelvinToCelcius(kelvin) {
  return kelvin - 273.15;
}

function createTodayPanelHTML(weather) {
  return `
    <h2 id="city-name" class="display-4">${weather.city.name}</h2>
    <div class="card">
      <h2 class="card-header h3">
      ${moment.unix(weather.list[0].dt).format(
        "DD/MM/YYYY"
      )}
      </h2>
      <div class="card-body">
        <img src="${getWeatherIconURL(weather)}" />
        <p>Temperature: ${convertKelvinToCelcius(weather.list[0].main.temp).toFixed(2)}<sup>o</sup>C</p>
        <p>Wind: ${weather.list[0].wind.speed}</p>
        <p>Humidity: ${weather.list[0].main.humidity}</p>
      </div>
    </div>
  `;
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
      console.log("City found: " + !citiesFound.length);

      // if (!citiesFound.length) return;
      const firstCity = citiesFound[0];
      console.log("firstCity: " + firstCity.name);
      // console.log("lat: " + firstCity.lat);
      // console.log("lon" + firstCity.lon);

      // 2nd URL data request chained onto 1st URL data request
      const queryURL2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${firstCity.lat}&lon=${firstCity.lon}&appid=${apiKey}`;

      return fetch(queryURL2);
    })
    .then((response) => response.json())
    .then((cityWeather) => {
      // the below is the data from return fetch (queryURL2)
      console.log(cityWeather);

      addWeatherToLocalStorage(cityWeather);
      populateTodayPanel(cityWeather);
      addToSearchHistory(cityWeather.city.name);
    })
    .catch((err) => console.log(err));
});
