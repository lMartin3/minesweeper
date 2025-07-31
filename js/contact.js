document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        clearErrors();

        let isValid = true;

        if (!validateName(name)) {
            displayError("nameError", "Name must contain only letters and numbers");
            isValid = false;
        }

        if (!validateEmail(email)) {
            displayError("emailError", "Please enter a valid email address");
            isValid = false;
        }

        if (!validateMessage(message)) {
            displayError("messageError", "Message must be at least 5 characters long");
            isValid = false;
        }

        if (isValid) {
            const mailtoLink = `mailto:?subject=Minesweeper Contact: ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}\n\nFrom: ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
            window.location.href = mailtoLink;
        }
    });
});

function validateName(name) {
    // Just alphanumerical name
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    return nameRegex.test(name) && name.length > 3;
}

function validateEmail(email) {
    // What the fuck is this regex?
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateMessage(message) {
    // mensaje de más de 5 carácteres
    return message.length >= 5;
}

function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = "block";
}

function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(element => {
        element.textContent = "";
        element.style.display = "none";
    });
}