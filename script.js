// app.js

const apiKey = 'zoel2DRmctA_YHitpEei-OBT3NVPUNK8XGRyd9vryf260Cll'; // Coloca aquí tu API Key de Currents API
const newsContainer = document.getElementById('news-container');
const unsplashApiKey = 'TuClaveAPIdeUnsplash'; // Coloca aquí tu API Key de Unsplash

// Función para obtener y mostrar las noticias
function getNews(apiUrl = `https://api.currentsapi.services/v1/latest-news?apiKey=${apiKey}`) {
    showLoader(); // Muestra un indicador de carga
    fetch(apiUrl)
        .then(response => {
            hideLoader(); // Oculta el indicador de carga
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data);
            displayNews(data.news);
        })
        .catch(error => {
            console.error('Error al obtener noticias:', error);
            newsContainer.innerHTML = `<p>Error al cargar noticias: ${error.message}. Intenta nuevamente más tarde.</p>`;
        });
}

// Función para mostrar las noticias en la página
function displayNews(articles) {
    newsContainer.innerHTML = ''; // Limpia el contenedor

    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = '<p>No se encontraron noticias.</p>';
        return;
    }

    articles.forEach(article => {
        const imageUrl = article.image || `https://source.unsplash.com/featured/?${article.title.split(' ').join(',')}`;
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <img src="${imageUrl}" alt="${article.title}" class="news-image">
            <h2>${article.title}</h2>
            <p>${article.description || 'Descripción no disponible.'}</p>
            <time>${new Date(article.published).toLocaleString()}</time>
            <button class="favorite-btn" onclick="toggleFavorite('${article.id}')"><i class="fa fa-heart"></i></button>
            <div class="rating">
                ${[1, 2, 3, 4, 5].map(star => `<i class="star fa fa-star" data-value="${star}" onclick="rateArticle('${article.id}', ${star})"></i>`).join('')}
            </div>
        `;
        newsContainer.appendChild(newsItem);
        updateFavoriteStatus(article.id);
        updateRatingStars(article.id);
    });
}

// Función para buscar noticias personalizadas
function searchNews() {
    const query = document.getElementById('searchQuery').value;
    if (query) {
        const apiUrl = `https://api.currentsapi.services/v1/search?keywords=${query}&apiKey=${apiKey}`;
        getNews(apiUrl);
    } else {
        alert('Por favor, introduce un término de búsqueda.');
    }
}

// Función para filtrar noticias por categorías
function filterByCategory() {
    const category = document.getElementById('categorySelect').value;
    if (category) {
        const apiUrl = `https://api.currentsapi.services/v1/latest-news?category=${category}&apiKey=${apiKey}`;
        getNews(apiUrl);
    } else {
        getNews(); // Si no hay categoría seleccionada, carga las noticias más recientes
    }
}

// Función para obtener noticias locales
function getLocalNews() {
    if (navigator.geolocation) {
        showLoader(); // Muestra un indicador de carga mientras se obtiene la ubicación
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiUrl = `https://api.currentsapi.services/v1/search?location=${lat},${lon}&apiKey=${apiKey}`;
            getNews(apiUrl);
        }, () => {
            hideLoader(); // Oculta el indicador de carga si falla la geolocalización
            alert("No se pudo obtener la ubicación. Asegúrate de permitir el acceso a la ubicación.");
        });
    } else {
        alert("La geolocalización no está soportada en este navegador.");
    }
}

// Función para alternar entre modo oscuro y claro
function toggleTheme() {
    const isDarkMode = document.getElementById('themeSwitch').checked;
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
}

// Función para alternar entre modo de lectura y normal
function toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
}

// Función para mostrar un indicador de carga
function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    newsContainer.innerHTML = '';
    newsContainer.appendChild(loader);
}

// Función para ocultar el indicador de carga
function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

// Funcionalidad de Favoritos
function toggleFavorite(articleId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.includes(articleId)) {
        favorites = favorites.filter(id => id !== articleId);
    } else {
        favorites.push(articleId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteStatus(articleId);
}

function updateFavoriteStatus(articleId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const button = document.querySelector(`.news-item [onclick="toggleFavorite('${articleId}')"]`);
    if (button) {
        button.classList.toggle('favorited', favorites.includes(articleId));
    }
}

// Funcionalidad de Calificación
function rateArticle(articleId, rating) {
    let ratings = JSON.parse(localStorage.getItem('ratings')) || {};
    ratings[articleId] = rating;
    localStorage.setItem('ratings', JSON.stringify(ratings));
    updateRatingStars(articleId);
}

function updateRatingStars(articleId) {
    const ratings = JSON.parse(localStorage.getItem('ratings')) || {};
    const stars = document.querySelectorAll(`.news-item .star[data-value][onclick^="rateArticle('${articleId}')"]`);
    stars.forEach(star => {
        star.classList.toggle('selected', star.getAttribute('data-value') <= ratings[articleId]);
    });
}

// Llama a la función para obtener noticias al cargar la página
getNews();
