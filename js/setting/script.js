
document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId"); // Recupera o userId do localStorage
    const token = localStorage.getItem("token"); // Recupera o token do localStorage

    if (!userId || !token) {
        alert("Usuário não autenticado. Faça login novamente.");
        window.location.href = "./login.html"; // Redireciona para a página de login
        return;
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

     // Formulário de alteração de senha
    // const passwordForm = document.getElementById("password-form");
    // passwordForm.addEventListener("submit", async (e) => {
    //     e.preventDefault();
    //     //const currentPassword = document.getElementById("current-password").value;
    //     const newPassword = document.getElementById("new-password").value;
    //     const confirmPassword = document.getElementById("confirm-password").value;
    //     console.log(newPassword);
    //     // Verifica se a nova senha e a confirmação coincidem
    //     if (newPassword !== confirmPassword) {
    //         alert("As senhas não coincidem.");
    //         return;
    //     }

    //     // Verifica a senha atual no backend
    //     //const isCurrentPasswordValid = await verifyCurrentPassword(currentPassword);
    //     // if (!currentPassword !== user.senha) {
    //     //     alert("Senha atual incorreta.");
    //     //     return;
    //     // }

        
    //     // Se a senha atual estiver correta, prossegue com a alteração da senha
    //     try {
    //         await sendAuthenticatedRequest(
    //             `http://localhost:3000/users/${userId}`,
    //             "PATCH",
    //             { senha: newPassword } // Corpo da requisição
    //         );

    //         alert("Senha alterada com sucesso!");
    //         window.location.reload(); // Recarrega a página
    //     } catch (error) {
    //         console.error(error);
    //         alert(error.message);
    //     }
    // });

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







     // Função para verificar a senha atual no backend
    //  async function verifyCurrentPassword(currentPassword) {
    //     try {
    //         const response = await sendAuthenticatedRequest(
    //             `http://localhost:3000/users/${userId}`, // Rota para verificar a senha atual
    //             "POST",
    //             { currentPassword } // Envia a senha atual para verificação
    //         );

    //         return response.isValid; // Assume que o backend retorna { isValid: true/false }
    //     } catch (error) {
    //         console.error(error);
    //         alert("Erro ao verificar a senha atual.");
    //         return false;
    //     }
    // }