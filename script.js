document.addEventListener("DOMContentLoaded", () => {
    // Seleciona o botão de login
    const loginButton = document.getElementById("btn-login");

    if (loginButton) {
        loginButton.addEventListener("click", () => {
            window.location.href = "../pages/login.html"; // Redireciona para a página de login
        });
    }
});
