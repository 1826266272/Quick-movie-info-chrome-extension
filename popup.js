const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const resultDiv = document.getElementById("result");
const header = document.getElementById("header");


const API_KEY = "51894299";

async function searchMovie() {
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
