document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Previne o envio padrão do formulário

    // Pega os valores dos campos de email e senha
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Faz a requisição POST para o servidor
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        // Converte a resposta em JSON
        const data = await response.json();

        // Se o login for bem-sucedido
        if (response.ok) {
            localStorage.setItem("token", data.token); // Salva o token no localStorage
            window.location.href = "/index.html"; // Redireciona para o dashboard
        } else {
            document.getElementById("errorMessage").textContent = data.message; // Exibe mensagem de erro
        }
    } catch (error) {
        document.getElementById("errorMessage").textContent = "Erro ao conectar com o servidor."; // Exibe erro de conexão
    }
});
