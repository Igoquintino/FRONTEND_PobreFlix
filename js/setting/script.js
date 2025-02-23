
document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId"); // Recupera o userId do localStorage
    console.log('user: ',userId);
    const token = localStorage.getItem("token"); // Recupera o token do localStorage

    if (!userId || !token) {
        alert("Usuário não autenticado. Faça login novamente.");
        window.location.href = "./login.html"; // Redireciona para a página de login
        return;
    }

    // Função para decodificar o token JWT
    function decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            //console.log(payload);
            return payload;
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
            return null;
        }
    }

    // Verifica se o usuário é administrador
    const payload = decodeToken(token);
    console.log(payload.userType);
    if (payload && payload.userType === "Administrator") {
        // Mostra a opção de administração no dropdown
        const adminOption = document.getElementById("admin-option");
        if (adminOption) {
            adminOption.style.display = "block";
        }
    }

    // Função para enviar requisições autenticadas
    async function sendAuthenticatedRequest(url, method, body = null) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho
        };

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null, // Envia o corpo da requisição, se houver
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro na requisição.");
        }

        return response.json();
    }

    // Formulário de alteração do nome de usuário
    const usernameForm = document.getElementById("username-form");
    if (usernameForm) {
        usernameForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newUsername = document.getElementById("new-username").value.trim();
            if (!newUsername) {
                alert("Por favor, digite um novo nome de usuário.");
                return;
            }

            try {
                const response = await sendAuthenticatedRequest(
                    `http://localhost:3000/users/${userId}`,
                    "PATCH",
                    { name: newUsername } // Corpo da requisição
                );

                // Verifica se a resposta do backend contém um novo token
                if (response.token) {
                    localStorage.setItem("token", response.token); // Atualiza o token no localStorage
                    alert("Nome de usuário atualizado com sucesso! Você foi reautenticado.");
                } else {
                    alert("Nome de usuário atualizado com sucesso!");
                }

                window.location.reload(); // Recarrega a página
            } catch (error) {
                console.error(error);
                alert("Erro ao atualizar o nome de usuário: " + error.message);
            }
        });
    }

    // Formulário de alteração de senha
    const passwordForm = document.getElementById("password-form");
    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Verifica se a nova senha e a confirmação coincidem
        if (newPassword !== confirmPassword) {
            alert("As senhas não coincidem.");
            return;
        }

        // Se a nova senha e a confirmação coincidirem, prossegue com a alteração da senha
        try {
            const response = await sendAuthenticatedRequest(
                `http://localhost:3000/users/${userId}`,
                "PATCH",
                { password: confirmPassword } // Corpo da requisição
            );

             // Verifica se a resposta do backend contém um novo token
            if (response.token) {
                localStorage.setItem("token", response.token); // Atualiza o token no localStorage
                alert("Senha alterada com sucesso! Você foi reautenticado.");
            } else {
                alert("Senha alterada com sucesso!");
            }


            window.location.reload(); // Recarrega a página
        } catch (error) {
            console.error(error);
            alert(error.message); // Exibe a mensagem de erro do backend
        }
    });
});

    // Botão de exclusão de conta
    const deleteAccountButton = document.getElementById("delete-account");
    deleteAccountButton.addEventListener("click", async () => {
        const confirmDelete = confirm("Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.");

        if (confirmDelete) {
            try {
                await sendAuthenticatedRequest(
                    `http://localhost:3000/users/${userId}`,
                    "DELETE"
                );

                alert("Conta deletada com sucesso!");
                localStorage.clear(); // Limpa o localStorage
                window.location.href = "./login.html"; // Redireciona para a página de login
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        }
    });

    // Logout
    const logoutButton = document.getElementById("logout");
    logoutButton.addEventListener("click", () => {
        localStorage.clear(); // Limpa o localStorage
        window.location.href = "./login.html"; // Redireciona para a página de login
    });

    // Redirecionamento para a homepage
    const homepageLink = document.getElementById("homepage");
    homepageLink.addEventListener("click", () => {
        window.location.href = "./homepage_user.html";
    });

