



function generateCards(data) {
    const cardsContainer = document.querySelector(".cards");
    
    if (!cardsContainer) {
        console.error("Elemento .cards não encontrado no DOM.");
        return;
    }

    cardsContainer.innerHTML = ""; // Limpa antes de adicionar novos

    if (!data || data.length === 0) {
        cardsContainer.innerHTML = "<p class='text-center'>Nenhum resultado encontrado.</p>";
        return;
    }

    data.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("col-md-4", "mb-4");

        card.innerHTML = `
            <div class="card" style="width: 18rem;">
                <img src="${item.image_url}" class="card-img-top" alt="${item.title}">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">${item.description}</p>
                    <span class="badge bg-secondary">${item.genre}</span>
                    <span class="badge bg-info">${item.content_type}</span>
                    <br><br>
                    <a href="${item.video_url}" class="btn btn-primary" target="_blank">Assistir</a>
                </div>
            </div>
        `;

        cardsContainer.appendChild(card);
    });
}

// Função de Logout
async function logout() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("Nenhum token encontrado. O usuário já está desconectado.");
        window.location.href = "../index.html"; // Redireciona mesmo assim
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao fazer logout: ${response.statusText}`);
        }

        // Removendo o token após o logout
        localStorage.removeItem("token");

    } catch (error) {
        console.error("Erro no logout:", error);
    } finally {
        // Redireciona para a página de login independentemente do resultado da requisição
        window.location.href = "../index.html";
    }
}

// Verifica se os botões existem antes de adicionar os eventos
const btnFilmes = document.getElementById("btn-filmes");
const btnSeries = document.getElementById("btn-series");
const btnTodos = document.getElementById("btn-todos");
const searchForm = document.getElementById("search-form");

if (btnFilmes) btnFilmes.addEventListener("click", () => fetchFilteredCatalog("filme"));
if (btnSeries) btnSeries.addEventListener("click", () => fetchFilteredCatalog("serie"));
if (btnTodos) btnTodos.addEventListener("click", () => fetchAllCatalog());

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

// Redirecionamento para páginas
const homepage = document.getElementById("homepage");
const about = document.getElementById("about");
const settings = document.getElementById("settings");
const logoutBtn = document.getElementById("logout");

if (homepage) homepage.addEventListener("click", () => window.location.href = "homepage_user.html");
if (about) about.addEventListener("click", () => window.location.href = "about.html");
if (settings) settings.addEventListener("click", () => window.location.href = "config.html");
if (logoutBtn) logoutBtn.addEventListener("click",logout);




document.getElementById("btnAlterarNome").addEventListener("click", async () => {
    const newUsername = document.getElementById("newUsername").value.trim();
    const token = localStorage.getItem("token");

    if (!newUsername) {
        alert("Por favor, digite um novo nome.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/user/update", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: newUsername })
        });

        if (!response.ok) {
            throw new Error("Erro ao atualizar nome.");
        }

        alert("Nome atualizado com sucesso!");
    } catch (error) {
        console.error(error);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
        console.error("Usuário não autenticado.");
        return;
    }

    // Atualizar Nome de Usuário
    document.getElementById("username-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const newUsername = document.getElementById("new-username").value.trim();
        if (!newUsername) {
            alert("Por favor, digite um novo nome de usuário.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: newUsername }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar nome de usuário.");
            }

            alert("Nome de usuário atualizado com sucesso!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar o nome.");
        }
    });

    // Atualizar Senha
    document.getElementById("password-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const currentPassword = document.getElementById("current-password").value.trim();
        const newPassword = document.getElementById("new-password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Todos os campos são obrigatórios.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("As senhas não coincidem.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar a senha.");
            }

            alert("Senha alterada com sucesso!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erro ao alterar a senha.");
        }
    });


    document.getElementById("delete-account").addEventListener("click", async function () {
        if (!confirm("Tem certeza que deseja deletar sua conta? Essa ação é irreversível!")) {
            return;
        }
    
        const userId = localStorage.getItem("user_id"); // Obtém o ID do usuário do localStorage
        const token = localStorage.getItem("token"); // Obtém o token JWT do localStorage
    
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`, // Envia o token JWT no header
                },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao deletar conta.");
            }
    
            alert("Conta deletada com sucesso!");
            localStorage.clear(); // Limpa o localStorage (remove o token e o ID do usuário)
            window.location.href = "login.html"; // Redireciona para a página de login
        } catch (error) {
            console.error(error);
            alert(error.message || "Erro ao excluir a conta.");
        }
    });


    // // Deletar Conta
    // document.getElementById("delete-account").addEventListener("click", async function () {
    //     if (!confirm("Tem certeza que deseja deletar sua conta? Essa ação é irreversível!")) {
    //         return;
    //     }

    //     try {
    //         const response = await fetch(`http://localhost:3000/users/${userId}`, {
    //             method: "DELETE",
    //             headers: {
    //                 "Authorization": `Bearer ${token}`,
    //             },
    //         });

    //         if (!response.ok) {
    //             throw new Error("Erro ao deletar conta.");
    //         }

    //         alert("Conta deletada com sucesso!");
    //         localStorage.clear();
    //         window.location.href = "login.html";
    //     } catch (error) {
    //         console.error(error);
    //         alert("Erro ao excluir a conta.");
    //     }
    // });
});






// // Simulação de dados vindo do backend (substituir por fetch real)
// const catalogData = [
//     {
//         title: "Filme 1",
//         description: "Descrição do Filme 1",
//         genre: "Ação",
//         content_type: "filme",
//         video_url: "https://exemplo.com/video1",
//         image_url: "https://via.placeholder.com/150"
//     },
//     {
//         title: "Série 1",
//         description: "Descrição da Série 1",
//         genre: "Drama",
//         content_type: "serie",
//         video_url: "https://exemplo.com/video2",
//         image_url: "https://via.placeholder.com/150"
//     }
// ];


















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
        fetch(`http://localhost:3000/catalog/${encodeURIComponent(searchQuery)}`, {
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
