const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const resultDiv = document.getElementById("result");
const header = document.getElementById("header");


const API_KEY = "51894299";

async function searchMovie() {
  suggestions.innerHTML = "";
  const movieName = movieInput.value.trim();

  if (!movieName) {
    resultDiv.innerHTML = "<p>Please enter a movie name</p>";
    return;
  }

  resultDiv.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?t=${movieName}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.Response === "False") {
      resultDiv.innerHTML = "<p>404 Movie not found</p>";
      return;
    }

    let ratingClass = "red";
    const ratingValue = parseFloat(data.imdbRating);

    if (ratingValue >= 7.5) {
      ratingClass = "green";
    } else if (ratingValue >= 5) {
      ratingClass = "yellow";
    }

    resultDiv.innerHTML = `
      <div class="movie-title">${data.Title} (${data.Year})</div>

      <div class="rating-label">IMDb Rating
        <div class="rating ${ratingClass}">
            ${data.imdbRating}
        </div>
      </div>

      <div><span class="label">Genre:</span> ${data.Genre}</div>
      <div><span class="label">Runtime:</span> ${data.Runtime}</div>
      <div><span class="label">Director:</span> ${data.Director}</div>
      <div><span class="label">Actors:</span> ${data.Actors}</div>
      <div><span class="label">Plot:</span> ${data.Plot}</div>
      <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank" class="imdb-link">
        view more
      </a>

      <img class="movie-poster" src="${data.Poster}" alt="Poster"/>
    `;
  } catch (err) {
    resultDiv.innerHTML = "<p>Error fetching movie data</p>";
  }
  header.style.display = "none";
}

// Click search button
searchBtn.addEventListener("click", searchMovie);

// Press Enter key inside input
movieInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchMovie();
  }
});


// Google-like Suggestions Feature

const suggestions = document.getElementById("suggestions");
let debounceTimer;

// Hide suggestions initially
suggestions.innerHTML = "";

// Live input listener
movieInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = movieInput.value.trim();

  if (query.length < 2) {
    suggestions.innerHTML = "";
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 300);
});

// Fetch suggestions from OMDb
async function fetchSuggestions(query) {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (!data.Search) {
      suggestions.innerHTML = "";
      return;
    }

    suggestions.innerHTML = data.Search.slice(0, 6)
      .map(
        movie => `
        <li data-title="${movie.Title}">
          ${movie.Title} (${movie.Year})
        </li>`
      )
      .join("");
  } catch (err) {
    suggestions.innerHTML = "";
  }
}

// Click suggestion → search movie
suggestions.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const title = e.target.dataset.title;
    movieInput.value = title;
    suggestions.innerHTML = "";
    searchMovie();
  }
});

// Click outside input + suggestions → hide dropdown
document.addEventListener("click", (e) => {
  if (
    !e.target.closest("#movieInput") &&
    !e.target.closest("#suggestions")
  ) {
    suggestions.innerHTML = "";
  }
});
