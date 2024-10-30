const searchInput = document.getElementById('search');
const countriesContainer = document.getElementById('countries');
const favoritesContainer = document.getElementById('favoritesList');
const toggleButton = document.getElementById('openFavorites');
const favoritesSection = document.getElementById('favorites');
const loadMoreButton = document.getElementById('loadMore');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentPage = 1;
const pageSize = 10;

async function fetchCountries() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    localStorage.setItem('allCountries', JSON.stringify(data));
    displayCountries(data);
}

function displayCountries(countries) {
    countriesContainer.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCountries = countries.slice(start, end);

    paginatedCountries.forEach(country => {
        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
            <h3>${country.name.common}</h3>
            <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" width="100">
            <span class="favorite-icon ${favorites.includes(country.name.common) ? 'active' : ''}" onclick="toggleFavorite('${country.name.common}', event)">❤️</span>
        `;
        card.onclick = (e) => {
            if (!e.target.classList.contains('favorite-icon')) {
                showDetails(country);
            }
        };
        countriesContainer.appendChild(card);
    });

    loadMoreButton.style.display = end >= countries.length ? 'none' : 'block';
}

function showDetails(country) {
    const detailsHtml = `
        <div id="country-info" class="country-info">
            <h2>${country.name.common}</h2>
            <p><strong>Top Level Domain:</strong> ${country.tld ? country.tld.join(', ') : 'N/A'}</p>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Population:</strong> ${country.population}</p>
            <p><strong>Area:</strong> ${country.area} km²</p>
            <p><strong>Languages:</strong> ${Object.values(country.languages).join(', ')}</p>
            <button onclick="goBack()">Back</button>
        </div>
    `;
    countriesContainer.innerHTML = detailsHtml;
    applyStyles();
}

function applyStyles() {
    const countryInfo = document.getElementById('country-info');

    countryInfo.style.backgroundColor = '#fff';
    countryInfo.style.borderRadius = '8px';
    countryInfo.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    countryInfo.style.padding = '20px';
    countryInfo.style.maxWidth = '400px';
    countryInfo.style.margin = 'auto';

    const heading = countryInfo.querySelector('h2');
    heading.style.color = '#333';
    heading.style.marginBottom = '15px';

    const paragraphs = countryInfo.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.style.color = '#555';
        p.style.margin = '8px 0';
    });

    const strongText = countryInfo.querySelectorAll('strong');
    strongText.forEach(strong => {
        strong.style.color = '#000';
    });

    const button = countryInfo.querySelector('button');
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.padding = '10px 15px';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.3s ease';

    button.onmouseover = function () {
        button.style.backgroundColor = '#0056b3';
    };
    button.onmouseout = function () {
        button.style.backgroundColor = '#007bff';
    };
}

function goBack() {
    currentPage = 1;
    fetchCountries();
}

function toggleFavorite(countryName, event) {
    event.stopPropagation();
    const index = favorites.indexOf(countryName);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        if (favorites.length < 5) {
            favorites.push(countryName);
        } else {
            alert("You can only favorite up to 5 countries!");
            return;
        }
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

function displayFavorites() {
    favoritesContainer.innerHTML = '';
    if (favorites.length > 0) {
        const allCountries = JSON.parse(localStorage.getItem('allCountries') || '[]');
        allCountries.forEach(country => {
            if (favorites.includes(country.name.common)) {
                const favItem = document.createElement('div');
                favItem.className = 'country-card';
                favItem.innerHTML = `
                    <h3>${country.name.common}</h3>
                    <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" width="100">
                    <span class="delete-icon" onclick="deleteFavorite('${country.name.common}', event)">🗑️</span>
                `;
                favoritesContainer.appendChild(favItem);
            }
        });
    } else {
        favoritesContainer.innerHTML = '<div>No favorites yet.</div>';
    }
}

function deleteFavorite(countryName, event) {
    event.stopPropagation();
    const index = favorites.indexOf(countryName);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

toggleButton.addEventListener('click', () => {
    favoritesSection.style.display = 'block';
    countriesContainer.style.display = 'none';
    loadMoreButton.style.display = 'none';
    displayFavorites();
});

loadMoreButton.addEventListener('click', () => {
    currentPage++;
    displayCountries(JSON.parse(localStorage.getItem('allCountries') || '[]'));
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const allCountries = JSON.parse(localStorage.getItem('allCountries') || '[]');
    const filteredCountries = allCountries.filter(country =>
        country.name.common.toLowerCase().includes(searchTerm)
    );
    displayCountries(filteredCountries);
});

fetchCountries();
