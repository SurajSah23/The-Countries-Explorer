const countryList = document.getElementById("country-list");
const searchInput = document.getElementById("search");
const regionFilter = document.getElementById("region-filter");
const languageFilter = document.getElementById("language-filter");
const nextPageButton = document.getElementById("next-page");
const prevPageButton = document.getElementById("prev-page");
const pageInfo = document.getElementById("page-info");

let countries = [];
let filteredCountries = [];
let currentPage = 1;
let countriesPerPage = 10;

function updateCountriesPerPage() {
  if (window.matchMedia("(max-width: 767px)").matches) {
    countriesPerPage = 5;
  } else if (window.matchMedia("(max-width: 1024px)").matches) {
    countriesPerPage = 10;
  } else {
    countriesPerPage = 15;
  }
  displayCountries();
}

updateCountriesPerPage();
window.addEventListener("resize", updateCountriesPerPage);

async function fetchCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    countries = await response.json();
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    filteredCountries = countries;
    displayCountries();
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
}
fetchCountries();

function displayCountries() {
  countryList.innerHTML = "";
  const startIndex = (currentPage - 1) * countriesPerPage;
  const endIndex = startIndex + countriesPerPage;
  const countriesToDisplay = filteredCountries.slice(startIndex, endIndex);

  countriesToDisplay.forEach(country => {
    const countryCard = document.createElement("div");
    countryCard.className = "country-card";
    countryCard.innerHTML = "<img src='" + country.flags.png + "' alt='" + country.name.common + " flag' />" +
      "<h2>" + country.name.common + "</h2>" +
      "<div class='btn-delete'>" +
      "<button onclick='viewCountryDetails(\"" + country.name.common + "\")'><b><i>Show more</i></b></button>" +
      "<p class='favorite-btn' onclick='toggleFavorite(\"" + country.name.common + "\")'>❤️</p>" +
      "</div>";
    countryList.appendChild(countryCard);
  });

  updatePaginationInfo();
  updatePaginationButtons();
}

function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const favoritesStrip = document.getElementById('favoritesStrip');
  const favoriteCountriesList = document.getElementById('favoriteCountriesList');

  favoriteCountriesList.innerHTML = '';

  if (favorites.length > 0) {
    favoritesStrip.style.display = 'block';

    favorites.forEach(country => {
      const li = document.createElement('li');
      li.className = "favorite-item";
      li.innerHTML = "<span>" + country + "</span>" +
        "<span onclick='removeFavorite(\"" + country + "\")'><i class='fa-solid fa-trash-can'></i></span>";
      favoriteCountriesList.appendChild(li);
    });
  } else {
    favoritesStrip.style.display = 'none';
  }
}

function removeFavorite(country) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(fav => fav !== country);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

window.onload = loadFavorites;

function toggleFavorite(country) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (favorites.includes(country)) {
    favorites = favorites.filter(fav => fav !== country);
  } else if (favorites.length < 5) {
    favorites.push(country);
  } else {
    alert("You can only have up to 5 favorites.");
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

function filterCountries() {
  const searchValue = searchInput.value.toLowerCase();
  const selectedRegion = regionFilter.value;
  const selectedLanguage = languageFilter.value;

  filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.common.toLowerCase().includes(searchValue);
    let matchesRegion = true;
    if (selectedRegion !== "all") {
      matchesRegion = country.region === selectedRegion;
    }

    let matchesLanguage = true;
    if (selectedLanguage !== "all") {
      matchesLanguage = country.languages && Object.values(country.languages).includes(selectedLanguage);
    }

    if (selectedRegion !== "all" && selectedLanguage !== "all") {
      return matchesSearch && matchesRegion;
    } else if (selectedLanguage !== "all") {
      return matchesSearch && matchesLanguage;
    } else if (selectedRegion !== "all") {
      return matchesSearch && matchesRegion;
    } else {
      return matchesSearch;
    }
  });

  currentPage = 1;
  displayCountries();
}

function nextPage() {
  if (currentPage < Math.ceil(filteredCountries.length / countriesPerPage)) {
    currentPage++;
    displayCountries();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayCountries();
  }
}

function updatePaginationInfo() {
  const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);
  pageInfo.textContent = "Page " + currentPage + " of " + totalPages;
}

function updatePaginationButtons() {
  prevPageButton.style.display = currentPage > 1 ? "inline-block" : "none";
  nextPageButton.style.display = currentPage < Math.ceil(filteredCountries.length / countriesPerPage) ? "inline-block" : "none";
}

function viewCountryDetails(countryName) {
  const country = countries.find(c => c.name.common === countryName);
  localStorage.setItem("selectedCountry", JSON.stringify(country));
  window.location.href = "country-details.html";
}

searchInput.addEventListener("input", filterCountries);
regionFilter.addEventListener("change", filterCountries);
languageFilter.addEventListener("change", filterCountries);
nextPageButton.addEventListener("click", nextPage);
prevPageButton.addEventListener("click", prevPage);

function toggleMenu() {
  const navContent = document.getElementById('nav-content');
  navContent.classList.toggle('active');
}