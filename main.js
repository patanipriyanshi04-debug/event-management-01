document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    // 1. Scroll effect on Navbar
    const checkScroll = () => {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    window.addEventListener("scroll", checkScroll);
    checkScroll(); // Check once on initial load

    // 2. Mobile Menu Toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
            
            // Adjust aria-expanded for accessibility if present
            const expanded = hamburger.classList.contains("active");
            hamburger.setAttribute("aria-expanded", expanded);
        });
    }

    // 3. Close menu when clicking outside navbar or clicking a nav-link
    document.addEventListener("click", (e) => {
        if (hamburger && navMenu && !navbar.contains(e.target) && navMenu.classList.contains("active")) {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }
    });

    // 4. Dynamic Navbar & Supabase Session Integration
    const updateNavbar = (user) => {
        if (!navMenu) return;

        const currentPath = window.location.pathname;
        const pageName = currentPath.split("/").pop() || "index.html";
        const isEvents = pageName === "events.html";
        const isAuth = pageName === "auth.html";

        if (user) {
            navMenu.innerHTML = `
                <li><a href="index.html#home" class="nav-link">Home</a></li>
                <li><a href="events.html" class="nav-link ${isEvents ? 'active' : ''}">Events</a></li>
                <li><a href="index.html#services" class="nav-link">Services</a></li>
                <li><a href="index.html#gallery" class="nav-link">Gallery</a></li>
                <li><a href="index.html#packages" class="nav-link">Packages</a></li>
                <li><a href="index.html#about" class="nav-link">About</a></li>
                <li><a href="index.html#testimonials" class="nav-link">Testimonials</a></li>
                <li><a href="index.html#faq" class="nav-link">FAQ</a></li>
                <li><a href="index.html#contact" class="nav-link">Contact</a></li>
                <li class="nav-user-item">
                    <span class="nav-user-email" style="font-weight: 500; color: var(--text-muted); font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px; padding: 6px 0;">
                        <i class="fa-regular fa-envelope" style="color: var(--primary);"></i>
                        ${user.email}
                    </span>
                </li>
                <li><a href="#" class="btn btn-secondary nav-btn" id="btnLogout">Logout</a></li>
            `;

            // Bind logout event listener
            const btnLogout = document.getElementById("btnLogout");
            if (btnLogout) {
                btnLogout.addEventListener("click", async (e) => {
                    e.preventDefault();
                    btnLogout.innerText = "Logging out...";
                    btnLogout.style.pointerEvents = "none";
                    const { error } = await supabaseClient.auth.signOut();
                    if (error) {
                        console.error("Logout error:", error.message);
                        btnLogout.innerText = "Logout";
                        btnLogout.style.pointerEvents = "auto";
                    } else {
                        window.location.href = "index.html";
                    }
                });
            }
        } else {
            navMenu.innerHTML = `
                <li><a href="index.html#home" class="nav-link">Home</a></li>
                <li><a href="events.html" class="nav-link ${isEvents ? 'active' : ''}">Events</a></li>
                <li><a href="index.html#services" class="nav-link">Services</a></li>
                <li><a href="index.html#gallery" class="nav-link">Gallery</a></li>
                <li><a href="index.html#packages" class="nav-link">Packages</a></li>
                <li><a href="index.html#about" class="nav-link">About</a></li>
                <li><a href="index.html#testimonials" class="nav-link">Testimonials</a></li>
                <li><a href="index.html#faq" class="nav-link">FAQ</a></li>
                <li><a href="index.html#contact" class="nav-link">Contact</a></li>
                <li><a href="auth.html" class="nav-link ${isAuth ? 'active' : ''}">Login/Signup</a></li>
                <li><a href="auth.html" class="btn btn-primary nav-btn">Get Started</a></li>
            `;
        }

        // Re-bind click event to newly created nav links to auto-close mobile drawer
        const updatedNavLinks = navMenu.querySelectorAll(".nav-link");
        updatedNavLinks.forEach(link => {
            link.addEventListener("click", () => {
                if (hamburger && navMenu) {
                    hamburger.classList.remove("active");
                    navMenu.classList.remove("active");
                }
            });
        });
    };

    // Listen for auth state changes to update the navbar dynamically
    if (typeof supabaseClient !== "undefined") {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            const user = session?.user || null;
            updateNavbar(user);
        });
    } else {
        updateNavbar(null);
    }

    // 5. Render Upcoming Event Cards dynamically from eventsData
    const upcomingGrid = document.getElementById("upcomingGrid");
    if (upcomingGrid && typeof eventsData !== "undefined") {
        // Render top 3 upcoming events
        const upcomingEvents = eventsData.slice(0, 3);
        upcomingGrid.innerHTML = "";
        upcomingEvents.forEach(event => {
            const card = document.createElement("article");
            card.className = "event-card";
            card.innerHTML = `
                <div class="event-image-container" style="background: ${event.gradient}">
                    <div class="event-placeholder-graphic">
                        <i class="${event.icon}"></i>
                    </div>
                    <span class="event-overlay-category">${event.categoryName}</span>
                    <span class="event-overlay-price">${event.price === 0 ? "Free" : `$${event.price}`}</span>
                </div>
                <div class="event-info">
                    <div class="event-date-row">
                        <i class="fa-regular fa-calendar"></i>
                        <span>${new Date(event.date).toLocaleDateString("en-US", {month: 'short', day: 'numeric', year: 'numeric'})} • ${new Date(event.date).toLocaleTimeString("en-US", {hour: 'numeric', minute: '2-digit'})}</span>
                    </div>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-desc">${event.description.length > 110 ? event.description.substring(0, 110) + "..." : event.description}</p>
                    <div class="event-meta-info">
                        <div class="event-meta-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${event.location}</span>
                        </div>
                    </div>
                    <div class="event-card-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                        <a href="events.html" class="btn btn-outline" style="flex: 1; padding: 10px; font-size: 0.85rem;">View Details</a>
                        <button class="btn btn-primary btn-book-upcoming" data-category="${event.categoryName}" style="flex: 1; padding: 10px; font-size: 0.85rem;">Book Now</button>
                    </div>
                </div>
            `;
            upcomingGrid.appendChild(card);
        });

        // Add booking hooks on teaser buttons
        upcomingGrid.querySelectorAll(".btn-book-upcoming").forEach(btn => {
            btn.addEventListener("click", () => {
                const category = btn.getAttribute("data-category");
                const bookingForm = document.getElementById("booking");
                if (bookingForm) {
                    bookingForm.scrollIntoView({ behavior: "smooth" });
                    
                    // Match select box options
                    const typeSelect = document.getElementById("bookingType");
                    if (typeSelect) {
                        for (let option of typeSelect.options) {
                            if (option.text.toLowerCase() === category.toLowerCase() || option.value.toLowerCase().includes(category.toLowerCase().split(" ")[0])) {
                                typeSelect.value = option.value;
                                break;
                            }
                        }
                    }
                }
            });
        });
    }

    // 6. Gallery Filtering Logic
    const filterButtons = document.querySelectorAll(".gallery-filter-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");
    if (filterButtons.length > 0 && galleryItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                // Toggle active button class
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const filterValue = btn.getAttribute("data-filter");
                galleryItems.forEach(item => {
                    const itemCategory = item.getAttribute("data-category");
                    if (filterValue === "all" || itemCategory === filterValue) {
                        item.style.display = "block";
                        setTimeout(() => {
                            item.style.opacity = "1";
                            item.style.transform = "scale(1)";
                        }, 50);
                    } else {
                        item.style.opacity = "0";
                        item.style.transform = "scale(0.85)";
                        setTimeout(() => {
                            item.style.display = "none";
                        }, 300);
                    }
                });
            });
        });
    }

    // 7. Gallery Lightbox Modal
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxClose = document.querySelector(".lightbox-close");
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");

    let currentGalleryImages = [];
    let currentImageIndex = 0;

    const updateLightboxImage = () => {
        if (currentGalleryImages.length > 0) {
            const currentItem = currentGalleryImages[currentImageIndex];
            const imgElement = currentItem.querySelector("img");
            const captionElement = currentItem.querySelector(".gallery-overlay h4");
            if (imgElement && lightboxImg) {
                lightboxImg.src = imgElement.src;
                lightboxImg.alt = imgElement.alt;
            }
            if (captionElement && lightboxCaption) {
                lightboxCaption.textContent = captionElement.textContent;
            }
        }
    };

    if (lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener("click", () => {
                // Build list of currently visible gallery items
                const activeFilter = document.querySelector(".gallery-filter-btn.active")?.getAttribute("data-filter") || "all";
                currentGalleryImages = Array.from(galleryItems).filter(el => {
                    const cat = el.getAttribute("data-category");
                    return activeFilter === "all" || cat === activeFilter;
                });
                
                currentImageIndex = currentGalleryImages.indexOf(item);
                updateLightboxImage();
                
                lightbox.classList.add("active");
                lightbox.setAttribute("aria-hidden", "false");
                document.body.style.overflow = "hidden";
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove("active");
            lightbox.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        };

        if (lightboxClose) {
            lightboxClose.addEventListener("click", closeLightbox);
        }
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        if (lightboxPrev) {
            lightboxPrev.addEventListener("click", (e) => {
                e.stopPropagation();
                if (currentGalleryImages.length > 0) {
                    currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                    updateLightboxImage();
                }
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener("click", (e) => {
                e.stopPropagation();
                if (currentGalleryImages.length > 0) {
                    currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
                    updateLightboxImage();
                }
            });
        }

        // Keyboard support
        document.addEventListener("keydown", (e) => {
            if (lightbox.classList.contains("active")) {
                if (e.key === "Escape") closeLightbox();
                if (e.key === "ArrowLeft" && lightboxPrev) lightboxPrev.click();
                if (e.key === "ArrowRight" && lightboxNext) lightboxNext.click();
            }
        });
    }

    // 8. Event Packages select hooks
    const packageButtons = document.querySelectorAll(".btn-select-pkg");
    packageButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const packageName = btn.getAttribute("data-package");
            const price = btn.getAttribute("data-budget");
            const bookingSection = document.getElementById("booking");
            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: "smooth" });
                
                // Pre-fill budget field
                const budgetInput = document.getElementById("bookingBudget");
                if (budgetInput) {
                    budgetInput.value = price;
                }

                // Pre-fill type based on packages recommendations
                const typeSelect = document.getElementById("bookingType");
                if (typeSelect) {
                    if (packageName === "Basic") {
                        typeSelect.value = "Private Parties";
                    } else if (packageName === "Standard") {
                        typeSelect.value = "Weddings";
                    } else if (packageName === "Premium") {
                        typeSelect.value = "Corporate Events";
                    }
                }
            }
        });
    });

    // 9. FAQ Accordion Logic
    const faqTriggers = document.querySelectorAll(".faq-trigger");
    faqTriggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            const faqItem = trigger.parentElement;
            const isOpen = faqItem.classList.contains("active");

            // Close all items
            document.querySelectorAll(".faq-item").forEach(item => {
                item.classList.remove("active");
                item.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
            });

            // Open clicked item if it was closed
            if (!isOpen) {
                faqItem.classList.add("active");
                trigger.setAttribute("aria-expanded", "true");
            }
        });
    });

    // 10. Booking Form Validation & Submit redirect
    const bookingForm = document.getElementById("onlineBookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            // Fields to validate
            const nameInput = document.getElementById("bookingName");
            const emailInput = document.getElementById("bookingEmail");
            const phoneInput = document.getElementById("bookingPhone");
            const typeSelect = document.getElementById("bookingType");
            const dateInput = document.getElementById("bookingDate");
            const guestsInput = document.getElementById("bookingGuests");
            const budgetInput = document.getElementById("bookingBudget");

            // Error displays
            const nameError = document.getElementById("nameError");
            const emailError = document.getElementById("emailError");
            const phoneError = document.getElementById("phoneError");
            const typeError = document.getElementById("typeError");
            const dateError = document.getElementById("dateError");
            const guestsError = document.getElementById("guestsError");
            const budgetError = document.getElementById("budgetError");

            // Reset errors
            const inputs = [nameInput, emailInput, phoneInput, typeSelect, dateInput, guestsInput, budgetInput];
            const errors = [nameError, emailError, phoneError, typeError, dateError, guestsError, budgetError];
            
            inputs.forEach(input => {
                if (input) input.classList.remove("invalid");
            });
            errors.forEach(err => {
                if (err) err.classList.remove("visible");
            });

            // Name check
            if (!nameInput.value.trim()) {
                nameInput.classList.add("invalid");
                nameError.classList.add("visible");
                isValid = false;
            }

            // Email check
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
                emailInput.classList.add("invalid");
                emailError.classList.add("visible");
                isValid = false;
            }

            // Phone check (10 digits)
            const phoneRegex = /^\d{10}$/;
            const phoneClean = phoneInput.value.replace(/\D/g, "");
            if (!phoneInput.value.trim() || !phoneRegex.test(phoneClean)) {
                phoneInput.classList.add("invalid");
                phoneError.classList.add("visible");
                isValid = false;
            }

            // Type check
            if (!typeSelect.value) {
                typeSelect.classList.add("invalid");
                typeError.classList.add("visible");
                isValid = false;
            }

            // Date check (Must be future date)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(dateInput.value);
            if (!dateInput.value || inputDate <= today) {
                dateInput.classList.add("invalid");
                dateError.classList.add("visible");
                isValid = false;
            }

            // Guests check (min 5)
            if (!guestsInput.value || parseInt(guestsInput.value) < 5) {
                guestsInput.classList.add("invalid");
                guestsError.classList.add("visible");
                isValid = false;
            }

            // Budget check (min 500)
            if (!budgetInput.value || parseInt(budgetInput.value) < 500) {
                budgetInput.classList.add("invalid");
                budgetError.classList.add("visible");
                isValid = false;
            }

            if (isValid) {
                // Generate a unique Booking ID
                const bookingId = "EVT-" + Math.floor(10000 + Math.random() * 90000);
                
                // Prepare details payload
                const bookingPayload = {
                    bookingId: bookingId,
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    eventType: typeSelect.value,
                    eventDate: dateInput.value,
                    guests: guestsInput.value,
                    budget: budgetInput.value,
                    message: document.getElementById("bookingMessage")?.value.trim() || ""
                };

                // Store in localStorage for the success.html page
                localStorage.setItem("lastBookingDetails", JSON.stringify(bookingPayload));
                
                // Redirect to success.html
                window.location.href = "success.html";
            }
        });
    }

    // 11. Quick Contact Form hook
    const contactFormQuick = document.getElementById("contactFormQuick");
    if (contactFormQuick) {
        contactFormQuick.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Thank you for your message! Our team will get back to you shortly.");
            contactFormQuick.reset();
        });
    }
});
