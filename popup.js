const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const resultDiv = document.getElementById("result");
const header = document.getElementById("header");
const watchLater = document.getElementById("watchLaterLink");


const API_KEY = "51894299";
const SUPABASE_URL = "https://fbzjvswlfgmehuxnhsgj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiemp2c3dsZmdtZWh1eG5oc2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzUyODAsImV4cCI6MjA4OTkxMTI4MH0.d3IFfapNTI2S5O3IccJ2_lD-SwNWdMJN9mgDaUS2goI";

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
    console.log(data);

    resultDiv.innerHTML = `
      <div class="movie-title">
        ${data.Title} (${data.Year})
        <button id="watchLaterBtn">Watch Later</button>
      </div>
      

      <div class="rating-label">IMDb Rating
        <div class="rating ${ratingClass}">
            ${data.imdbRating}
        </div>
      </div>

      <div><span class="label">Genre:</span> ${data.Genre}</div>
      <div><span class="label">Runtime:</span> ${data.Runtime}</div>
      <div><span class="label">Awards:</span> ${data.Awards}</div>
      <div><span class="label">Director:</span> ${data.Director}</div>
      <div><span class="label">Actors:</span> ${data.Actors}</div>
      <div><span class="label">Plot:</span> ${data.Plot}</div>
      <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank" class="imdb-link">
        view more
      </a>
      <img class="movie-poster" src="${data.Poster}" alt="Poster"/>
    `;
    document
      .getElementById("watchLaterBtn")
      .addEventListener("click", () => {
  
        const movie = {
          title: data.Title,
          year: data.Year,
          poster: data.Poster,
          imdb_id: data.imdbID,
          rating: data.imdbRating
        };
  
        saveMovieToSupabase(movie);
    });
  } catch (err) {
    resultDiv.innerHTML = "<p>Error fetching movie data</p>";
  }
  header.style.display = "none";
  watchLater.style.display = "none";
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

  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 100);
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

    suggestions.innerHTML = data.Search
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


//supabse funtcions

//save movie to supabase

async function saveMovieToSupabase(movie) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(movie)
    });

    watchLaterBtn.innerText = "Saved !";
    watchLaterBtn.style = "background-color: #4DD0E1";
    watchLaterBtn.disabled = true;
  } catch (err) {
    console.error(err);
    alert("Failed to save movie");
  }
}