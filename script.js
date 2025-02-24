document.addEventListener("DOMContentLoaded", function () {
    // Captura o botão de explorar catálogo
    const btnExplorar = document.querySelector(".btn-lg");
    const btnLogin = document.getElementById("btn-login");

    // Redireciona para a página de login ao clicar em explorar catálogo
    btnExplorar.addEventListener("click", function () {
        window.location.href = "./pages/login.html";
    });

    // Redireciona para a página de login ao clicar no botão de login
    btnLogin.addEventListener("click", function () {
        window.location.href = "./pages/login.html";
    });
});
