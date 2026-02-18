function nav_bar_is_logged(bool) {
    const userInfoEl = document.getElementById('nav_user_info');

    if (bool == true) {
        document.getElementById('nav_log').style.display = "none";
        document.getElementById('nav_reg').style.display = "none";
        document.getElementById('nav_acc').style.display = "block";
        document.getElementById('nav_log_out').style.display = "block";
        if (userInfoEl) {
            userInfoEl.style.display = "block";
            const userName = localStorage.getItem('user_name') || 'User';
            userInfoEl.textContent = userName;
        }
    }
    else {
        document.getElementById('nav_log').style.display = "block";
        document.getElementById('nav_reg').style.display = "block";
        document.getElementById('nav_acc').style.display = "none";
        document.getElementById('nav_log_out').style.display = "none";
        if (userInfoEl) {
            userInfoEl.style.display = "none";
        }
    }
}

function set_logged(bool) {
    localStorage.setItem('logged', bool);
    nav_bar_is_logged(bool);
}

function set_role(data) {
    localStorage.setItem('role', data);
}

function set_user_id(user_id) {
    localStorage.setItem('user_id', user_id);
}

function set_user_name(name) {
    localStorage.setItem('user_name', name);
}

function set_tokens(accessToken,refreshToken){
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}


function get_user_id() {
    return localStorage.getItem('user_id');
}

function is_admin() {
    return localStorage.getItem('role') == "admin";
}

function check_if_logged() {
    nav_bar_is_logged(localStorage.getItem('logged') == "true");//bo local storage zapisuje do stringa :/
    load_page("main").then(function () {
        get_all_books();
    })
}

let allBooks = []; 

function get_all_books() {
    safeFetch("book/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            allBooks = data;
            displayBooks(data);
            loadFilters();
        });
}

function loadFilters() {
    safeFetch("book/authors/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => response.json())
        .then(authors => {
            let text = '<option value="">All authors</option>';
            authors.forEach(author => {
                text += `<option value="${author}">${author}</option>`;
            });
            document.getElementById("filter_author").innerHTML = text;
        });

    safeFetch("book/genres/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => response.json())
        .then(genres => {
            let text = '<option value="">All genres</option>';
            genres.forEach(genre => {
                text += `<option value="${genre}">${genre}</option>`;
            });
            document.getElementById("filter_genre").innerHTML = text;
        });
}

function applyFilters() {
    const searchText = document.getElementById("filter_search")?.value.toLowerCase() || '';
    const selectedAuthor = document.getElementById("filter_author")?.value || '';
    const selectedGenre = document.getElementById("filter_genre")?.value || '';
    const showAvailableOnly = document.getElementById("filter_available")?.checked || false;

    const filtered = allBooks.filter(book => {
        const matchesSearch = !searchText ||
            book.title.toLowerCase().includes(searchText) ||
            (book.description && book.description.toLowerCase().includes(searchText));

        const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;

        const matchesGenre = !selectedGenre || book.genre === selectedGenre;

            const matchesAvailable = !showAvailableOnly || book.is_available === true;

        return matchesSearch && matchesAuthor && matchesGenre && matchesAvailable;
    });

    displayBooks(filtered);
}

function displayBooks(books) {
    var text = "";
    for (let book of books) {
        text += "<tr>";
        text += "<td>" + book.title + "</td>";
        text += "<td>" + book.author + "</td>";
        text += "<td><span class='genre-badge-list'>" + book.genre + "</span></td>";
        text += "<td>" + (book.description || '') + "</td>";
            text += "<td>" + (book.is_available ? '<span class="available-icon">✓</span>' : '<span class="unavailable-icon">✗</span>') + "</td>";
        text += "<td><button onclick=details(" + book.id + ")>Details</button>";
            if (localStorage.getItem('logged') == "true" && book.is_available == true && localStorage.getItem('role') != "admin") {
            text += "<button onclick=borrow_book(" + book.id + ")>Borrow</button></td>";
        }
        text += "</tr>";
    }
    document.getElementById("admin_books_list").innerHTML = text;
}


function load_page(view_name) {
    return safeFetch("views/" + view_name + '.html', {
        method: "GET",
        headers: { "Content-Type": "application/html" },
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            document.getElementById('main').innerHTML = data;
            // Dodaj do historii przeglądarki
            if (history.state?.page !== view_name) {
                history.pushState({ page: view_name }, '', '#' + view_name);
            }
            return data;
        });
}

// Obsługa przycisku "Wstecz" w przeglądarce
window.addEventListener('popstate', function (event) {
    if (event.state && event.state.page) {
        console.log(event.state.page);
        safeFetch("views/" + event.state.page + '.html', {
            method: "GET",
            headers: { "Content-Type": "application/html" },
        })
            .then(function (response) {
                return response.text();
            })
            .then(function (data) {
                document.getElementById('main').innerHTML = data;
                if (event.state.page === 'main') {
                    get_all_books();
                } else if (event.state.page === 'account_admin') {
                    admin_account_load_content();
                } else if (event.state.page === 'account_user') {
                    user_load_copies();
                }
            });
    }
});



function redirect() {
    if (is_admin()) {
        load_page("account_admin").then(function () {
            admin_account_load_content();
        });
    }
    else {
        load_page("account_user").then(function () {
            user_load_copies();
        });

    }
}

let isRefreshing = false;
let refreshPromise = null;

async function safeFetch(url, options = {}) {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "Content-Type": "application/json",
            "Authorization": accessToken ? `Bearer ${accessToken}` : ""
        }
    });

    if (response.status !== 401) {
        return response;
    }

    if (url.includes("/token")) {
        log_out();
        throw new Error("Session expired");
    }

    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken();
    }

    try {
        const newAccessToken = await refreshPromise;

        return fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                "Content-Type": "application/json",
                "Authorization": `Bearer ${newAccessToken}`
            }
        });
    } catch (err) {
        log_out();
        throw err;
    }
}

async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            throw new Error("No refresh token");
        }

        const res = await fetch("/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!res.ok) {
            throw new Error("Refresh failed");
        }

        const data = await res.json();

        localStorage.setItem("accessToken", data.accessToken);

        if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
        }

        return data.accessToken;
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
}