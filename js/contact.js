// Disable ES6ConvertVarToLetConst inspection
// such that WebStorm doesn't flood the file with warnings.
// noinspection ES6ConvertVarToLetConst

"use strict";

document.addEventListener("DOMContentLoaded", function () {
    var contactForm = document.getElementById("contactForm");

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var name = document.getElementById("name").value.trim();
        var email = document.getElementById("email").value.trim();
        var message = document.getElementById("message").value.trim();

        clearErrors();

        var isValid = true;

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
            window.location.href = `mailto:?subject=Minesweeper Contact: ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}\n\nFrom: ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
        }
    });
});

function validateName(name) {
    // Just alphanumerical name
    var nameRegex = /^[a-zA-Z0-9\s]+$/;
    return nameRegex.test(name) && name.length > 3;
}

function validateEmail(email) {
    // What the fuck is this regex?
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateMessage(message) {
    // mensaje de más de 5 carácteres
    return message.length >= 5;
}

function displayError(elementId, message) {
    var errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = "block";
}

function clearErrors() {
    var errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(element => {
        element.textContent = "";
        element.style.display = "none";
    });
}