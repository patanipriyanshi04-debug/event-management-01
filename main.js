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

    // 3. Close menu when clicking outside navbar
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
        const isHome = pageName === "index.html" || pageName === "" || pageName === "/";
        const isEvents = pageName === "events.html";
        const isAuth = pageName === "auth.html";

        if (user) {
            navMenu.innerHTML = `
                <li><a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Home</a></li>
                <li><a href="events.html" class="nav-link ${isEvents ? 'active' : ''}">Events</a></li>
                <li class="nav-user-item">
                    <span class="nav-user-email" style="font-weight: 500; color: var(--text-muted); font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px; padding: 6px 0;">
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
                <li><a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Home</a></li>
                <li><a href="events.html" class="nav-link ${isEvents ? 'active' : ''}">Events</a></li>
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
        // Fallback: active state highlight for links if Supabase client isn't loaded
        const currentPath = window.location.pathname;
        const pageName = currentPath.split("/").pop() || "index.html";
        navLinks.forEach(link => {
            const linkPath = link.getAttribute("href");
            if (linkPath === pageName || (pageName === "index.html" && linkPath === "/")) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }
});
