// Função para buscar por título
async function fetchByTitle(title) {
    fetchCatalog(`http://localhost:3000/catalog/${title}`);
};


// Evento para a barra de pesquisa
if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const searchTerm = document.getElementById("search-input").value.trim();

        if (!searchTerm) {
            console.warn("Pesquisa vazia. Digite algo para pesquisar.");
            return;
        }

        fetchByTitle(searchTerm);
    });
}


// Função genérica para buscar dados da API
async function fetchCatalog(url) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao buscar dados: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        generateCards(data);

    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
}





document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        alert('Usuário não autenticado. Faça login novamente.');
        window.location.href = 'login.html';
        return;
            }

        // Captura o termo de pesquisa da URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

    if (searchQuery) {
        fetch(`http://localhost:3000/search?query=${encodeURIComponent(searchQuery)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = data.map(item => `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                    </div>
                </div>
            `).join('');
        })
        .catch((error) => {
            console.error('Error:', error);
        });      
    }

            // Logout
    document.getElementById('logout').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});
