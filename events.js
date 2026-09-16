// Mock Event Data Array is now loaded from events-data.js

// App State Variables
let currentCategory = "all";
let searchQuery = "";
let sortBy = "date-asc";

// DOM Elements
const eventsGrid = document.getElementById("eventsGrid");
const searchInput = document.getElementById("searchInput");
const sortBySelect = document.getElementById("sortBy");
const categoryTabs = document.querySelectorAll(".category-tab");

// Modal Elements
const eventModal = document.getElementById("eventModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalBanner = document.getElementById("modalBanner");
const modalBannerIcon = document.getElementById("modalBannerIcon");
const modalCategory = document.getElementById("modalCategory");
const modalTitle = document.getElementById("modalTitle");
const modalDateTime = document.getElementById("modalDateTime");
const modalLocation = document.getElementById("modalLocation");
const modalOrganizer = document.getElementById("modalOrganizer");
const modalTicketsLeft = document.getElementById("modalTicketsLeft");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const btnRegisterTicket = document.getElementById("btnRegisterTicket");

// Notification Toast Elements
const alertToast = document.getElementById("alertToast");
const toastMessage = document.getElementById("toastMessage");

// Format Price Helper
const formatPrice = (price) => {
    return price === 0 ? "Free" : `$${price}`;
};

// Format Date Helper
const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString("en-US", {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const timeFormatted = d.toLocaleTimeString("en-US", {
        hour: 'numeric',
        minute: '2-digit'
    });
    return `${dateFormatted} • ${timeFormatted}`;
};

// Main Rendering Function
const renderEvents = () => {
    // 1. Filter events by Category
    let filteredEvents = eventsData.filter(event => {
        if (currentCategory === "all") return true;
        return event.category === currentCategory;
    });

    // 2. Filter events by Search Query
    if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filteredEvents = filteredEvents.filter(event => {
            return event.title.toLowerCase().includes(query) ||
                   event.categoryName.toLowerCase().includes(query) ||
                   event.location.toLowerCase().includes(query) ||
                   event.venue.toLowerCase().includes(query) ||
                   event.organizer.toLowerCase().includes(query);
        });
    }

    // 3. Sort Events
    filteredEvents.sort((a, b) => {
        if (sortBy === "date-asc") {
            return new Date(a.date) - new Date(b.date);
        } else if (sortBy === "date-desc") {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === "price-asc") {
            return a.price - b.price;
        } else if (sortBy === "price-desc") {
            return b.price - a.price;
        }
        return 0;
    });

    // 4. Render Grid HTML
    eventsGrid.innerHTML = "";

    if (filteredEvents.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-calendar-xmark"></i>
                <h3>No Events Found</h3>
                <p>We couldn't find matches for "${searchQuery}". Try selecting another category or typing another term.</p>
            </div>
        `;
        return;
    }

    filteredEvents.forEach(event => {
        const card = document.createElement("article");
        card.className = "event-card";
        card.innerHTML = `
            <div class="event-image-container" style="background: ${event.gradient}">
                <div class="event-placeholder-graphic">
                    <i class="${event.icon}"></i>
                </div>
                <span class="event-overlay-category">${event.categoryName}</span>
                <span class="event-overlay-price">${formatPrice(event.price)}</span>
            </div>
            <div class="event-info">
                <div class="event-date-row">
                    <i class="fa-regular fa-calendar"></i>
                    <span>${formatDate(event.date)}</span>
                </div>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-desc">${event.description.length > 110 ? event.description.substring(0, 110) + "..." : event.description}</p>
                <div class="event-meta-info">
                    <div class="event-meta-item">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>${event.location}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fa-solid fa-users"></i>
                        <span>${event.ticketsLeft} seats left</span>
                    </div>
                </div>
                <div class="event-card-actions">
                    <button class="btn btn-outline btn-view-details" data-id="${event.id}">View Details</button>
                </div>
            </div>
        `;

        // Attach click listener directly to Details button
        const detailsBtn = card.querySelector(".btn-view-details");
        detailsBtn.addEventListener("click", () => openModal(event));

        eventsGrid.appendChild(card);
    });
};

// Modal Operations
const openModal = (event) => {
    modalBanner.style.background = event.gradient;
    modalBannerIcon.className = `${event.icon}`;
    modalCategory.innerText = event.categoryName;
    modalTitle.innerText = event.title;
    modalDateTime.innerText = formatDate(event.date);
    modalLocation.innerHTML = `<strong>${event.venue}</strong><br>${event.location}`;
    modalOrganizer.innerText = event.organizer;
    modalTicketsLeft.innerText = `${event.ticketsLeft} spots remaining`;
    modalDescription.innerText = event.description;
    modalPrice.innerText = formatPrice(event.price);

    // Save selected event id to register button
    btnRegisterTicket.setAttribute("data-event-id", event.id);

    eventModal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
};

const closeModal = () => {
    eventModal.classList.remove("active");
    document.body.style.overflow = ""; // Restore scroll
};

// Toast Notifications
const showToast = (message, type = "success") => {
    toastMessage.innerText = message;
    
    if (type === "error") {
        alertToast.style.backgroundColor = "#fee2e2";
        alertToast.style.borderLeftColor = "#ef4444";
        alertToast.style.color = "#991b1b";
        alertToast.querySelector("i").className = "fa-solid fa-circle-xmark";
        alertToast.querySelector("i").style.color = "#ef4444";
    } else {
        alertToast.style.backgroundColor = "var(--success-light)";
        alertToast.style.borderLeftColor = "var(--success)";
        alertToast.style.color = "#065f46";
        alertToast.querySelector("i").className = "fa-solid fa-circle-check";
        alertToast.querySelector("i").style.color = "var(--success)";
    }

    alertToast.classList.add("show");
    
    setTimeout(() => {
        alertToast.classList.remove("show");
    }, 3000);
};

// Initialize listeners
const setupEventListeners = () => {
    // 1. Search filter
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderEvents();
    });

    // 2. Sorting selection
    sortBySelect.addEventListener("change", (e) => {
        sortBy = e.target.value;
        renderEvents();
    });

    // 3. Category tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            categoryTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentCategory = tab.getAttribute("data-category");
            renderEvents();
        });
    });

    // 4. Close modal buttons
    modalCloseBtn.addEventListener("click", closeModal);
    eventModal.addEventListener("click", (e) => {
        if (e.target === eventModal) closeModal();
    });

    // 5. Register button click
    btnRegisterTicket.addEventListener("click", async () => {
        if (typeof supabaseClient === "undefined") {
            showToast("Supabase client is not loaded.", "error");
            return;
        }

        // Disable button during validation and submission
        btnRegisterTicket.disabled = true;
        btnRegisterTicket.innerText = "Checking session...";

        // Check if user is logged in
        let sessionData = null;
        try {
            const res = await supabaseClient.auth.getSession();
            sessionData = res.data.session;
        } catch (e) {
            console.error(e);
        }

        if (!sessionData) {
            btnRegisterTicket.disabled = false;
            btnRegisterTicket.innerText = "Register for Event";
            showToast("Please log in to register for events.", "error");
            setTimeout(() => {
                window.location.href = "auth.html";
            }, 1200);
            return;
        }

        const eventId = btnRegisterTicket.getAttribute("data-event-id");
        const eventObj = eventsData.find(ev => ev.id === parseInt(eventId));

        if (eventObj) {
            btnRegisterTicket.innerText = "Registering...";
            try {
                const user = sessionData.user;
                const { error } = await supabaseClient
                    .from("registrations")
                    .insert([
                        {
                            event_id: parseInt(eventId),
                            user_id: user.id,
                            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                            email: user.email,
                            registration_date: new Date().toISOString(),
                            status: "Registered"
                        }
                    ]);

                btnRegisterTicket.disabled = false;
                btnRegisterTicket.innerText = "Register for Event";

                if (error) {
                    showToast(error.message, "error");
                } else {
                    closeModal();
                    showToast("Registration Successful");

                    // Decrement tickets count (local session only)
                    if (eventObj.ticketsLeft > 0) {
                        eventObj.ticketsLeft--;
                        renderEvents();
                    }
                }
            } catch (err) {
                btnRegisterTicket.disabled = false;
                btnRegisterTicket.innerText = "Register for Event";
                showToast(err.message || "An unexpected error occurred.", "error");
            }
        } else {
            btnRegisterTicket.disabled = false;
            btnRegisterTicket.innerText = "Register for Event";
        }
    });
};

// Boot application
document.addEventListener("DOMContentLoaded", () => {
    // Read category from query parameters if present
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        currentCategory = categoryParam;
        categoryTabs.forEach(t => {
            if (t.getAttribute("data-category") === categoryParam) {
                t.classList.add("active");
            } else {
                t.classList.remove("active");
            }
        });
    }

    renderEvents();
    setupEventListeners();
});
