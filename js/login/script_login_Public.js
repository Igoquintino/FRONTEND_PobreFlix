document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Previne o envio padrão do formulário

    // Obtém os valores dos campos
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    // Limpa mensagens anteriores
    errorMessage.textContent = "";

    // Validação básica de campos vazios
    if (!email || !password) {
        errorMessage.textContent = "Preencha todos os campos.";
        return;
    }

    try {
        // Faz a requisição POST para o servidor
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json(); // Converte a resposta em JSON

        if (!response.ok) {
            throw new Error(data.error || "Erro ao fazer login. Verifique suas credenciais.");
        }

        // Salva o token e informações do usuário no localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("Login bem-sucedido! ID:", data.user.id);
        
        // Redireciona para a página inicial do usuário
        window.location.href = "./homepage_user.html";

    } catch (error) {
        console.error("Erro no login:", error);
        errorMessage.textContent = error.message;
    }
});
