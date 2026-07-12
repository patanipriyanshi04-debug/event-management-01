document.addEventListener("DOMContentLoaded", () => {
    // Tab switching elements
    const authTabs = document.getElementById("authTabs");
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    const formsContainer = document.getElementById("formsContainer");

    // Forms
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    // Toast elements
    const authToast = document.getElementById("authToast");
    const authToastMessage = document.getElementById("authToastMessage");

    // Switch to Login Tab function
    const switchToLogin = () => {
        tabSignup.classList.remove("active");
        tabLogin.classList.add("active");
        authTabs.setAttribute("data-active", "login");
        formsContainer.classList.remove("slide-active");
    };

    // Switch to Signup Tab function
    const switchToSignup = () => {
        tabLogin.classList.remove("active");
        tabSignup.classList.add("active");
        authTabs.setAttribute("data-active", "signup");
        formsContainer.classList.add("slide-active");
    };

    // Tab Event Listeners
    if (tabLogin && tabSignup) {
        tabLogin.addEventListener("click", switchToLogin);
        tabSignup.addEventListener("click", switchToSignup);
    }

    // Helper: Show alert toast message
    const showToast = (message, type = "success") => {
        authToastMessage.innerText = message;
        
        // Dynamic background borders based on message type
        if (type === "error") {
            authToast.style.backgroundColor = "#fee2e2";
            authToast.style.borderLeftColor = "#ef4444";
            authToast.style.color = "#991b1b";
            authToast.querySelector("i").className = "fa-solid fa-circle-xmark";
            authToast.querySelector("i").style.color = "#ef4444";
        } else {
            authToast.style.backgroundColor = "var(--success-light)";
            authToast.style.borderLeftColor = "var(--success)";
            authToast.style.color = "#065f46";
            authToast.querySelector("i").className = "fa-solid fa-circle-check";
            authToast.querySelector("i").style.color = "var(--success)";
        }

        authToast.classList.add("show");
        setTimeout(() => {
            authToast.classList.remove("show");
        }, 3000);
    };

    // Helper: validate email address format
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Helper: add visual input error indicators
    const markInputError = (input, message) => {
        input.style.borderColor = "#ef4444";
        input.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)";
        
        // Show validation message nearby or rely on toast
        input.addEventListener("input", function resetBorder() {
            input.style.borderColor = "";
            input.style.boxShadow = "";
            input.removeEventListener("input", resetBorder);
        });
    };

    // Redirect already logged-in users to home page
    if (typeof supabaseClient !== "undefined") {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                window.location.href = "index.html";
            }
        });
    }

    // Login Form Validation & Submission
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById("loginEmail");
            const passwordInput = document.getElementById("loginPassword");
            let valid = true;

            // Validate email
            if (!emailInput.value.trim()) {
                markInputError(emailInput);
                showToast("Email address is required.", "error");
                valid = false;
            } else if (!isValidEmail(emailInput.value.trim())) {
                markInputError(emailInput);
                showToast("Please enter a valid email address.", "error");
                valid = false;
            }

            // Validate password
            if (valid && !passwordInput.value) {
                markInputError(passwordInput);
                showToast("Password field cannot be empty.", "error");
                valid = false;
            }

            if (valid) {
                const email = emailInput.value.trim();
                const password = passwordInput.value;

                // Disable submit button
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerText;
                submitBtn.disabled = true;
                submitBtn.innerText = "Logging in...";

                supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                }).then(({ data, error }) => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;

                    if (error) {
                        showToast(error.message, "error");
                        markInputError(emailInput);
                        markInputError(passwordInput);
                    } else {
                        showToast(`Welcome back, ${email.split('@')[0]}! Redirecting...`);
                        loginForm.reset();
                        
                        // Redirect user to home page after toast completes
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 1500);
                    }
                }).catch(err => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;
                    showToast(err.message || "An unexpected error occurred.", "error");
                });
            }
        });
    }

    // Signup Form Validation & Submission
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById("signupName");
            const emailInput = document.getElementById("signupEmail");
            const passwordInput = document.getElementById("signupPassword");
            const agreeCheckbox = document.getElementById("agreeTerms");
            let valid = true;

            // Validate Full Name
            if (!nameInput.value.trim()) {
                markInputError(nameInput);
                showToast("Please enter your full name.", "error");
                valid = false;
            }

            // Validate Email
            if (valid && !emailInput.value.trim()) {
                markInputError(emailInput);
                showToast("Email address is required.", "error");
                valid = false;
            } else if (valid && !isValidEmail(emailInput.value.trim())) {
                markInputError(emailInput);
                showToast("Please enter a valid email address.", "error");
                valid = false;
            }

            // Validate Password Length
            if (valid && passwordInput.value.length < 8) {
                markInputError(passwordInput);
                showToast("Password must be at least 8 characters long.", "error");
                valid = false;
            }

            // Validate Checkbox Terms
            if (valid && !agreeCheckbox.checked) {
                showToast("You must agree to the Terms & Privacy Policy to proceed.", "error");
                valid = false;
            }

            if (valid) {
                const name = nameInput.value.trim();
                const email = emailInput.value.trim();
                const password = passwordInput.value;

                // Disable submit button
                const submitBtn = signupForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerText;
                submitBtn.disabled = true;
                submitBtn.innerText = "Creating account...";

                supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: name
                        }
                    }
                }).then(({ data, error }) => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;

                    if (error) {
                        showToast(error.message, "error");
                        markInputError(emailInput);
                        markInputError(passwordInput);
                    } else {
                        showToast(`Welcome to Eventify, ${name}! Account created.`);
                        signupForm.reset();
                        
                        // Transition to Login form state after registration success
                        setTimeout(() => {
                            switchToLogin();
                            // Prefill email field
                            const loginEmailInput = document.getElementById("loginEmail");
                            if (loginEmailInput) {
                                loginEmailInput.value = email;
                            }
                        }, 1500);
                    }
                }).catch(err => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;
                    showToast(err.message || "An unexpected error occurred.", "error");
                });
            }
        });
    }
});
