"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registrationForm");
    const fields = document.getElementsByClassName("field");
    const labels = document.getElementsByTagName("label");
    const nameInput = document.querySelector("#fullName");
    const allInputs = document.querySelectorAll("input");
    const interestOptions = document.querySelector("#interestOptions");
    const submitButton = document.querySelector("#submitButton");
    const successMessage = document.querySelector("#successMessage");
    const modal = document.querySelector("#confirmationModal");
    const toast = document.querySelector("#toast");

    const helpToggle = document.getElementById("helpToggle");
    helpToggle.dataset.component = "dropdown";
    helpToggle.setAttribute("title", "Show or hide registration help");
    console.log("Help component:", helpToggle.dataset.component);
    console.log("Name input required:", nameInput.hasAttribute("required"));
    console.log("Name placeholder:", nameInput.getAttribute("placeholder"));
    console.log("Number of fields:", fields.length, "Labels:", labels.length, "Inputs:", allInputs.length);

    console.log("Form parent:", form.parentElement);
    console.log("Form children:", form.children);
    console.log("First child:", form.firstElementChild);
    console.log("Last child:", form.lastElementChild);
    console.log("Next section:", form.parentElement.nextElementSibling);
    console.log("Previous sibling:", form.previousElementSibling);
    console.log("Name belongs to a field:", nameInput.closest(".field") !== null);
    console.log("Is name input an input:", nameInput.matches("input"));

    nameInput.setAttribute("data-field", "full-name");
    console.log("Field dataset:", nameInput.dataset.field);
    nameInput.classList.add("ready");
    nameInput.classList.remove("ready");
    nameInput.classList.toggle("highlighted");
    nameInput.classList.toggle("highlighted");
    nameInput.classList.add("old-class");
    nameInput.classList.replace("old-class", "new-class");
    nameInput.classList.remove("new-class");
    nameInput.removeAttribute("data-field");

    const demoText = document.getElementById("demoText");
    console.log("textContent:", demoText.textContent);
    console.log("innerText:", demoText.innerText);
    console.log("innerHTML:", demoText.innerHTML);

    let toastTimer;
    let pendingSubmitData = null;
    let lastFocusedElement = null;
    let intervalId;

    const errorIds = {
        fullName: "fullNameError",
        email: "emailError",
        phone: "phoneError",
        password: "passwordError",
        confirmPassword: "confirmPasswordError",
        birthDate: "birthDateError",
        interests: "interestsError",
        experience: "experienceError",
        about: "aboutError",
        terms: "termsError"
    };

    const get = (id) => document.getElementById(id);

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
    }

    function setError(fieldName, message) {
        const field = get(fieldName);
        get(errorIds[fieldName]).textContent = message;
        if (field && field.classList) {
            field.classList.toggle("invalid", Boolean(message));
            field.classList.toggle("valid", !message && field.value.trim() !== "");
            if (message) field.setAttribute("aria-invalid", "true");
            else field.removeAttribute("aria-invalid");
        }
    }

    function validateField(fieldName) {
        const value = get(fieldName).value.trim();
        let message = "";

        if (fieldName === "fullName") {
            if (!value) message = "Please enter your full name.";
            else if (value.length < 3) message = "Name must contain at least 3 characters.";
        }

        if (fieldName === "email") {
            if (!value) message = "Please enter your email.";
            else if (!get("email").validity.valid) message = "Please enter a valid email address.";
        }

        if (fieldName === "phone") {
            if (!value) message = "Please enter your phone number.";
            else if (!get("phone").validity.valid) message = "Phone number must contain exactly 11 digits.";
        }

        if (fieldName === "password") {
            if (!value) message = "Please enter a password.";
            else if (value.length < 8) message = "Password must contain at least 8 characters.";
        }

        if (fieldName === "confirmPassword") {
            if (!value) message = "Please confirm your password.";
            else if (value !== get("password").value) message = "Passwords do not match.";
        }

        if (fieldName === "birthDate") {
            if (!value) message = "Please select your date of birth.";
            else if (new Date(value) >= new Date()) message = "Date of birth must be in the past.";
        }

        if (fieldName === "interests") {
            if (!interestOptions.querySelector('input[name="interests"]:checked')) {
                message = "Select at least one interest.";
            }
        }

        if (fieldName === "experience" && !value) message = "Please select your experience level.";

        if (fieldName === "about") {
            if (!value) message = "Please tell us about yourself.";
            else if (value.length < 20) message = "Please write at least 20 characters.";
        }

        if (fieldName === "terms" && !get("terms").checked) {
            message = "You must accept the terms and conditions.";
        }

        setError(fieldName, message);
        return message === "";
    }

    function updateChecklist() {
        const checks = {
            name: get("fullName").value.trim().length >= 3,
            email: get("email").validity.valid && get("email").value.trim() !== "",
            phone: get("phone").validity.valid && get("phone").value.trim() !== "",
            password: get("password").value.length >= 8 &&
                get("password").value === get("confirmPassword").value,
            interests: Boolean(interestOptions.querySelector('input[name="interests"]:checked')),
            about: get("about").value.trim().length >= 20,
            terms: get("terms").checked
        };

        let completed = 0;
        Object.entries(checks).forEach(([key, isDone]) => {
            const item = document.querySelector(`[data-check="${key}"]`);
            item.classList.toggle("done", isDone);
            if (isDone) completed++;
        });

        const percentage = Math.round((completed / Object.keys(checks).length) * 100);
        get("progressBar").style.width = percentage + "%";
        get("progressText").textContent = percentage + "% completed";
    }

    function updateButton() {
        const requiredFields = [
            "fullName", "email", "phone", "password", "confirmPassword",
            "birthDate", "experience", "about"
        ];
        const fieldsValid = requiredFields.every((fieldName) => validateField(fieldName));
        const interestsValid = validateField("interests");
        const termsValid = validateField("terms");

        submitButton.disabled = !(fieldsValid && interestsValid && termsValid);
        updateChecklist();
    }

    function updateSelectedInterests() {
        const selected = interestOptions.querySelectorAll('input[name="interests"]:checked');
        const list = get("selectedInterests");
        list.innerHTML = "";

        if (selected.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.textContent = "No interests selected yet.";
            emptyItem.classList.add("empty-item");
            list.append(emptyItem);
            return;
        }

        selected.forEach((checkbox) => {
            const item = document.createElement("li");
            item.textContent = checkbox.value;
            item.dataset.interest = checkbox.value;
            list.appendChild(item);
        });
    }

    function updatePasswordStrength() {
        const password = get("password").value;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const labels = ["Not entered", "Weak", "Fair", "Good", "Strong"];
        get("passwordStrength").textContent = "Password strength: " + labels[score];
        get("strengthBar").style.width = (score * 25) + "%";
        get("strengthBar").style.backgroundColor =
            score < 2 ? "#dc2626" : score < 4 ? "#f59e0b" : "#16a34a";
    }

    function updateCharacterCounter() {
        const length = get("about").value.length;
        get("charCounter").textContent = `${length} / 300 characters`;
    }

    function getFormData() {
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
    }

    function openModal() {
        lastFocusedElement = document.activeElement;
        const data = getFormData();
        const selected = [...interestOptions.querySelectorAll('input:checked')]
            .map((checkbox) => checkbox.value);

        const review = get("reviewDetails");
        review.innerHTML = "";
        const details = [
            ["Name", data.fullName],
            ["Email", data.email],
            ["Phone", data.phone],
            ["Date of birth", data.birthDate],
            ["Interests", selected.join(", ")],
            ["Experience", data.experience]
        ];

        details.forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = label + ": ";
            paragraph.append(strong, document.createTextNode(value));
            review.append(paragraph);
        });

        modal.hidden = false;
        get("closeModal").focus();
    }

    function closeModal() {
        modal.hidden = true;
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    form.addEventListener("input", (event) => {
        const fieldName = event.target.name;
        if (errorIds[fieldName]) validateField(fieldName);
        if (fieldName === "password" || fieldName === "confirmPassword") {
            updatePasswordStrength();
            validateField("confirmPassword");
        }
        if (fieldName === "about") updateCharacterCounter();
        updateButton();
    });

    form.addEventListener("change", (event) => {
        if (event.target.name === "interests") {
            updateSelectedInterests();
            validateField("interests");
        }
        if (event.target.name && errorIds[event.target.name]) {
            validateField(event.target.name);
        }
        updateButton();
    });

    form.addEventListener("focusin", (event) => {
        if (event.target.matches("input, select, textarea")) {
            event.target.closest(".field")?.classList.add("focused");
        }
    });

    form.addEventListener("focusout", (event) => {
        if (event.target.name && errorIds[event.target.name]) {
            validateField(event.target.name);
        }
        event.target.closest(".field")?.classList.remove("focused");
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        updateButton();

        if (submitButton.disabled) {
            showToast("Please correct the highlighted fields.");
            const firstInvalid = form.querySelector(".invalid");
            firstInvalid?.focus();
            return;
        }

        pendingSubmitData = getFormData();
        openModal();
    });

    get("confirmButton").addEventListener("click", () => {
        closeModal();
        successMessage.textContent =
            `Thank you, ${pendingSubmitData.fullName}! Your registration has been completed successfully.`;
        successMessage.hidden = false;
        get("pageStatus").textContent = "Registration completed.";
        showToast("Registration successful!");
        submitButton.disabled = true;
        pendingSubmitData = null;
    });

    get("cancelButton").addEventListener("click", closeModal);
    get("closeModal").addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    interestOptions.addEventListener("change", (event) => {
        if (event.target.matches('input[name="interests"]')) {
            updateSelectedInterests();
            updateButton();
        }
    });

    form.addEventListener("click", () => console.log("Form click: bubbling listener"));
    form.addEventListener("click", () => console.log("Form click: capturing listener"), true);
    get("interestOptions").addEventListener("click", (event) => {
        console.log("Interest group target:", event.target);
        console.log("Interest group currentTarget:", event.currentTarget);
    });

    helpToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const content = get("helpContent");
        content.hidden = !content.hidden;
        helpToggle.setAttribute("aria-expanded", String(!content.hidden));
    });

    const tabs = document.querySelector(".tabs");
    tabs.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-tab]");
        if (!tab) return;

        document.querySelectorAll(".tab").forEach((item) => {
            item.classList.remove("active");
            item.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        const tabContent = {
            privacy: ["Privacy", "Your registration details are used for this demonstration only."],
            process: ["Registration process", "Complete the form, review your details, and confirm your registration."],
            support: ["Support", "Use the help panel or review the form messages if you need assistance."]
        };

        const [heading, description] = tabContent[tab.dataset.tab];
        get("tabPanel").innerHTML = `<h3>${heading}</h3><p>${description}</p>`;
    });

    document.querySelector(".accordion").addEventListener("click", (event) => {
        const button = event.target.closest(".accordion-button");
        if (!button) return;
        const panel = button.nextElementSibling;
        panel.hidden = !panel.hidden;
        button.setAttribute("aria-expanded", String(!panel.hidden));
    });

    get("addNoteButton").addEventListener("click", () => {
        const note = document.createElement("p");
        note.textContent = "A new note was created with createElement() and append().";
        note.classList.add("hint");
        note.dataset.note = "demo";
        get("notesArea").append(note);
        note.before(document.createTextNode("→ "));
        note.after(document.createElement("hr"));
        showToast("Note added.");
    });

    get("removeNoteButton").addEventListener("click", () => {
        const note = get("notesArea").querySelector('[data-note="demo"]');
        if (note) {
            note.replaceWith(document.createTextNode("The note was replaced and removed."));
            showToast("Note removed.");
        } else {
            showToast("There is no note to remove.");
        }
    });

    get("changeTextButton").addEventListener("dblclick", () => {
        demoText.textContent = "Text changed after a double-click.";
        demoText.classList.toggle("highlighted");
    });
    get("changeTextButton").addEventListener("click", () => {
        demoText.innerText = "You clicked the change text button.";
        demoText.style.fontWeight = "bold"; // Inline style example
    });
    get("changeTextButton").addEventListener("mouseenter", () => demoText.classList.add("highlighted"));
    get("changeTextButton").addEventListener("mouseleave", () => demoText.classList.remove("highlighted"));

    get("themeButton").addEventListener("click", () => document.body.classList.toggle("dark"));
    get("menuButton").addEventListener("click", () => {
        const links = get("navLinks");
        links.classList.toggle("open");
        get("menuButton").setAttribute("aria-expanded", String(links.classList.contains("open")));
    });

    form.addEventListener("reset", () => {
        setTimeout(() => {
            Object.keys(errorIds).forEach((fieldName) => {
                get(errorIds[fieldName]).textContent = "";
                const field = get(fieldName);
                if (field && field.classList) field.classList.remove("invalid", "valid");
            });
            get("selectedInterests").innerHTML = '<li class="empty-item">No interests selected yet.</li>';
            get("charCounter").textContent = "0 / 300 characters";
            get("passwordStrength").textContent = "Password strength: not entered";
            get("strengthBar").style.width = "0";
            get("successMessage").hidden = true;
            get("successMessage").textContent = "";
            get("notesArea").replaceChildren();
            get("progressBar").style.width = "0";
            get("progressText").textContent = "0% completed";
            document.querySelectorAll("#checklist li").forEach((item) => item.classList.remove("done"));
            submitButton.disabled = true;
            get("pageStatus").textContent = "Form has been reset.";
            closeModal();
        }, 0);
    });

    get("windowInfo").textContent =
        `Current page: ${window.location.pathname} | Viewport: ${window.innerWidth}px wide`;
    console.log("Current URL:", window.location.href);
    console.log("History length:", window.history.length);

    get("backToTop").addEventListener("click", () => {
        window.history.replaceState({ page: "registration" }, "", window.location.pathname + "#home");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("load", () => console.log("Window load event fired."));
    window.addEventListener("resize", () => {
        get("windowInfo").textContent =
            `Current page: ${window.location.pathname} | Viewport: ${window.innerWidth}px wide`;
    });
    window.addEventListener("scroll", () => {
        get("pageStatus").textContent =
            window.scrollY > 250 ? "You are viewing the registration page." : "Form is ready.";
    });

    get("fullName").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            get("email").focus();
        }
    });
    get("fullName").addEventListener("keyup", (event) => {
        get("pageStatus").textContent = `Typing name: ${event.target.value.length} characters`;
    });

    let seconds = 5;
    get("pageStatus").textContent = "Page ready. Status refresh in 5 seconds.";
    intervalId = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            get("pageStatus").textContent = `Page ready. Status refresh in ${seconds} seconds.`;
        } else {
            clearInterval(intervalId);
            get("pageStatus").textContent = "You can complete the registration form.";
        }
    }, 1000);

    setTimeout(() => {
        if (get("pageStatus").textContent.startsWith("Page ready")) {
            get("pageStatus").textContent = "Welcome! Complete the form when you are ready.";
        }
    }, 6000);

    updateSelectedInterests();
    updateCharacterCounter();
    updatePasswordStrength();
    updateChecklist();
});
