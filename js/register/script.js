
const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const passwordConfirmation = document.getElementById("password-confirmation");

document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "../index.html"; // Redireciona para a página inicial
  });
  

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (checkForm()) {
    await registerUser();
  }
});

async function registerUser() {
  const userData = {
    name: username.value,
    email: email.value,
    password: password.value
  };

  try {
    const response = await fetch("http://localhost:3000/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "login.html"; // Redireciona para a página de login
    } else {
      alert(`Erro: ${data.message || "Não foi possível realizar o cadastro."}`);
    }
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao conectar com o servidor.");
  }
}

function checkForm() {
  checkInputUsername();
  checkInputEmail();
  checkInputPassword();
  checkInputPasswordConfirmation();

  const formItems = form.querySelectorAll(".form-content");

  return [...formItems].every((item) => item.className === "form-content");
}

function checkInputUsername() {
  const usernameValue = username.value.trim();

  if (usernameValue === "") {
    errorInput(username, "Preencha um username!");
  } else {
    clearError(username);
  }
}

function checkInputEmail() {
  const emailValue = email.value.trim();

  if (emailValue === "") {
    errorInput(email, "O email é obrigatório.");
  } else {
    clearError(email);
  }
}

function checkInputPassword() {
  const passwordValue = password.value.trim();

  if (passwordValue === "") {
    errorInput(password, "A senha é obrigatória.");
  } else if (passwordValue.length < 8) {
    errorInput(password, "A senha precisa ter no mínimo 8 caracteres.");
  } else {
    clearError(password);
  }
}

function checkInputPasswordConfirmation() {
  const passwordValue = password.value.trim();
  const confirmationPasswordValue = passwordConfirmation.value.trim();

  if (confirmationPasswordValue === "") {
    errorInput(passwordConfirmation, "A confirmação de senha é obrigatória.");
  } else if (confirmationPasswordValue !== passwordValue) {
    errorInput(passwordConfirmation, "As senhas não são iguais.");
  } else {
    clearError(passwordConfirmation);
  }
}

function errorInput(input, message) {
  const formItem = input.parentElement;
  const textMessage = formItem.querySelector("a");

  textMessage.innerText = message;
  formItem.className = "form-content error";
}

function clearError(input) {
  const formItem = input.parentElement;
  formItem.className = "form-content";
}

