// global dom elements
const searchButtonEl = document.querySelector("#search-button");
const searchHistoryEl = document.querySelector("#search-history");

// remove old stored history
removeOldHistory();

// populate the search history, then rely on event listeners for user interaction
populateSearchHistory();


// FUNCTIONS ---------------------------------------------- //

// removes any weather objects that are older than the hourly reset value
// as api is updated regularly and user will have latest forecasts
function removeOldHistory() {
  const storedWeather =
    JSON.parse(localStorage.getItem("weatherForCities")) || [];

  const currentTime = moment();
  const hourlyReset = 3;

  const currentWeather = storedWeather.filter((weather) => {
    const storedWeatherTime = moment.unix(weather.list[0].dt);

    console.log(weather.city.name + currentTime.diff(storedWeatherTime, "hours"));

    return currentTime.diff(storedWeatherTime, "hours") < hourlyReset;
  });

  console.log(currentWeather);
  localStorage.setItem("weatherForCities", JSON.stringify(currentWeather));
}

// populate the search history by iterating through the local storage weather objects
function populateSearchHistory() {
  const storedWeather =
    JSON.parse(localStorage.getItem("weatherForCities")) || [];

  storedWeather.forEach((weather) => {
    addToSearchHistory(weather.city.name);
  });
}

// creates and returns a new button element based on city name
function newButtonEl(cityName) {
  return Object.assign(document.createElement("button"), {
    className: "btn btn-secondary",
    textContent: cityName,
    type: "button",
    name: cityName,
  });
}

// adds button to search history, if not already present
function addToSearchHistory(cityName) {
  // get node list of existing buttons in search history
  const cityButtonEls = searchHistoryEl.querySelectorAll("button");

  // only add, if not already present
  if (![...cityButtonEls].some((button) => button.name === cityName)) {
    searchHistoryEl.prepend(newButtonEl(cityName));
  }
}

// add the weather object to local storage, if not already present
function addWeatherToLocalStorage(cityWeather) {
  const storedWeather =
    JSON.parse(localStorage.getItem("weatherForCities")) || [];

  // only store, if not already present
  if (
    !storedWeather.some(
      (weather) => weather.city.name === cityWeather.city.name
    )
  ) {
    storedWeather.push(cityWeather);
  }

  localStorage.setItem("weatherForCities", JSON.stringify(storedWeather));
}

function getWeatherIconURL(weather, timeIndex) {
  return `http://openweathermap.org/img/wn/${weather.list[timeIndex].weather[0].icon}@2x.png`;
}

function convertKelvinToCelcius(kelvin) {
  return kelvin - 273.15;
}

function populateForecasts(weather) {
  const mainContentEl = document.querySelector("#main-content-wrapper");
  const cityNameEl = document.querySelector("#city-name");
  // these are the weather objects list indices for forecasts date and time
  const dtOffsets = [0, 8, 16, 24, 32, 39];

  // display the main content by removing the bootstrap class
  mainContentEl.classList.remove("d-none");

  // update the displayed city name based on the weather object
  cityNameEl.textContent = weather.city.name;

  // generate each card based on the time index
  dtOffsets.forEach((timeIndex, i) => {
    // use the array index to target where each card should be displayed
    const cardTargetEl = document.querySelector("#card-target-" + i);

    // get, then inject html into target element
    cardTargetEl.innerHTML = createCardHTML(weather, timeIndex);

    // get a reference to the newly created card in the dom
    const newCard = cardTargetEl.querySelector(":scope > div");

    if (i === 0) {
      // if it's the first card, then give a lighter colour theme to the card
      newCard.classList.add("text-white", "bg-secondary", "bg-gradient");
      newCard.querySelector(":scope > h5").classList.add("border-light");
    } else {
      // otherwise, use a darker theme
      newCard.classList.add("text-light", "bg-dark", "bg-gradient");
      newCard.querySelector(":scope > h5").classList.add("border-secondary");
    }
  });
}

// returns the HTML based on the weather object and the desired time offset
function createCardHTML(weather, timeIndex) {
  return `
    <div class="card mb-3">
      <h5 class="card-header">${moment
        .unix(weather.list[timeIndex].dt)
        .format("DD/MM/YYYY")}</h5>
      <div class="card-body">
        <img class="rounded d-block" src="${getWeatherIconURL(
          weather,
          timeIndex
        )}" />
        <p>Temp: ${convertKelvinToCelcius(
          weather.list[timeIndex].main.temp
        ).toFixed(2)}<sup>o</sup>C</p>
        <p>Wind: ${weather.list[timeIndex].wind.speed}</p>
        <p>Humidity: ${weather.list[timeIndex].main.humidity}</p>
      </div>
    </div>
  `;
}

function displayFeedback(msTime) {
  const feedbackTriggerEl = document.querySelector("#collapseSearchFeedback");
  feedbackTriggerEl.click();
  setTimeout(() => feedbackTriggerEl.click(), msTime);
}


// EVENT LISTENERS ---------------------------------------------- //

searchButtonEl.addEventListener("click", function (event) {
  event.preventDefault();

  const apiKey = "0c844d8b5a9a8c945f153e1fd8606479";
  const searchInputEl = document.querySelector("#search-input");

  const city = searchInputEl.value;
  console.log("Search for City: " + city);

  // only make search if user has entered some text
  // (this won't prevent bad input of city names)
  if (city) {
    const queryURL1 = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;

    // first, search for the desired city using the correct endpoint
    fetch(queryURL1)
      .then((response) => response.json())
      .then((citiesFound) => {
        // console.log("City found: " + !citiesFound.length);

        // if (!citiesFound.length) return;
        const firstCity = citiesFound[0];
        console.log("firstCity: " + firstCity.name);

        const queryURL2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${firstCity.lat}&lon=${firstCity.lon}&appid=${apiKey}`;
        // now we can search for the weather data associated with the latitude and longitude of the city
        // and use a different endpoint, by returning the fetch, we can pass that to the next 'then' by chaining
        return fetch(queryURL2);
      })
      .then((response) => response.json())
      .then((cityWeather) => {
        // use this data to populate the display and local storage
        console.log(cityWeather);

        populateForecasts(cityWeather);
        addWeatherToLocalStorage(cityWeather);
        addToSearchHistory(cityWeather.city.name);
      })
      .catch((err) => {
        console.log(err);
        // inform user that search was unsuccessful, (in milliseconds)
        displayFeedback(3000);
      });
  }

  // finally, clear the text of the last search
  searchInputEl.value = "";
  searchInputEl.focus();
});

searchHistoryEl.addEventListener("click", function (event) {
  const targetEl = event.target;
  // use event delegation and only target button elements
  if (targetEl.matches("button")) {
    // if a button exsists, then it should be in local storage
    // but try to avoid errors by using an empty array, if not found
    const storedWeather =
      JSON.parse(localStorage.getItem("weatherForCities")) || [];

    const weather = storedWeather.find(
      (cityWeather) => cityWeather.city.name == targetEl.name
    );

    // only populate forcasts, if a weather object was found
    if (weather) {
      populateForecasts(weather);
    }
  }
});
