function book_editor(book_id) {
    if (book_id) {
        load_page("book_profile").then(function () {
            safeFetch("book/" + book_id, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    document.getElementById('mode').innerHTML = "EDIT"
                    document.getElementById("add_book_button").style.display = "none";
                    document.getElementById("update_book_button").style.display = "block";
                    document.getElementById("copies_ui").style.display = "block";
                    document.getElementById('book_id').value = data.id;
                    document.getElementById('book_title').value = data.title;
                    document.getElementById('book_author').value = data.author;
                    document.getElementById('book_genre').value = data.genre;
                    document.getElementById('book_description').value = data.description;
                    admin_load_copies();
                    return data;
                });
        });
    }
    else {
        load_page("book_profile").then(function () {
            document.getElementById('mode').innerHTML = "ADD";
            document.getElementById("add_book_button").style.display = "block";
            document.getElementById("update_book_button").style.display = "none";
            document.getElementById("copies_ui").style.display = "none";
        })
    };
}

function add_book() {
    var accessToken=localStorage.getItem('accessToken');
    var title = document.getElementById('book_title').value
    var author = document.getElementById('book_author').value
    var genre = document.getElementById('book_genre').value
    var description = document.getElementById('book_description').value
    body = {
        title: title,
        author: author,
        genre: genre,
        description: description,
    }
    safeFetch("book/add", {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken },
        body: JSON.stringify(body),
    })
        .then(function (response) {
            if (response.status === 401 || response.status === 403) {
                alert('Brak uprawnień do wykonania tej operacji.');
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(function (data) {
            redirect();
            return data;
        })
        .catch(function (error) {
            if (error.message !== 'Unauthorized') {
                alert('Błąd: ' + error.message);
            }
        });
}


function update_book() {
    var accessToken=localStorage.getItem('accessToken');
    var id = document.getElementById('book_id').value;
    var title = document.getElementById('book_title').value
    var author = document.getElementById('book_author').value
    var genre = document.getElementById('book_genre').value
    var description = document.getElementById('book_description').value
    body = {
        title: title,
        author: author,
        genre: genre,
        description: description,
    }
    safeFetch("book/update/" + id, {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken },
        body: JSON.stringify(body),
    })
        .then(function (response) {
            if (response.status === 401 || response.status === 403) {
                alert('Brak uprawnień do wykonania tej operacji.');
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(function (data) {
            redirect();
            return data;
        })
        .catch(function (error) {
            if (error.message !== 'Unauthorized') {
                alert('Błąd: ' + error.message);
            }
        });
}

function delete_book(id) {
    var accessToken=localStorage.getItem('accessToken');
    safeFetch("/book/delete/" + id, {
        method: "delete",
        headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken },
    })
        .then(function (response) {
            if (response.status === 401 || response.status === 403) {
                alert('Brak uprawnień do wykonania tej operacji.');
                throw new Error('Unauthorized');
            }
            return response.json().then(function(data) {
                if (data.error) {
                    throw new Error(data.error);
                }
                redirect();
            });
        })
        .catch(function (error) {
            if (error.message !== 'Unauthorized') {
                alert('Błąd: ' + error.message);
            }
        });
}

function add_copies(){
    var accessToken=localStorage.getItem('accessToken');
    var id = document.getElementById('book_id').value;
    var count = document.getElementById('book_quantity').value;
    body = {
        id:id,
        count:count,
    }
    safeFetch("copy/add", {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken },
        body: JSON.stringify(body),
    })
        .then(function (response) {
            if (response.status === 401 || response.status === 403) {
                alert('Brak uprawnień do wykonania tej operacji.');
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(function (data) {
            redirect();
            return data;
        })
        .catch(function (error) {
            if (error.message !== 'Unauthorized') {
                alert('Błąd: ' + error.message);
            }
        });

}

function admin_load_copies(){
    var accessToken=localStorage.getItem('accessToken');
    var text="";
    var id = document.getElementById('book_id').value;
        safeFetch("/copy/by-book/"+id, {
        method: "GET",
        headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function(data){
            for(let book of data){
                text+="<tr>";
                text+="<td>"+book.id+"</td>";
                text+="<td>"+book.is_borrowed+"</td>";
                text+="<td><button onclick=delete_copy("+book.id+")>Delete Copy</button></td>";
                text+="</tr>";
            }
            document.getElementById("admin_copies_list").innerHTML=text;
        });
}

function delete_copy(id){
    var accessToken=localStorage.getItem('accessToken');
    safeFetch("/copy/delete/"+id, {
        method: "delete",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer "+accessToken },
    })
        .then(function (response) {
            if (response.status === 401 || response.status === 403) {
                alert('Brak uprawnień do wykonania tej operacji.');
                throw new Error('Unauthorized');
            }
            return response.json().then(function(data) {
                if (data.error) {
                    throw new Error(data.error);
                }
                admin_load_copies();
            });
        })
        .catch(function (error) {
            if (error.message !== 'Unauthorized') {
                alert('Błąd: ' + error.message);
            }
        });
}