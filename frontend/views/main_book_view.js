function load_book_details(id){
            safeFetch("book/details/" + id, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    document.getElementById('book_title').innerHTML = data.title;
                    document.getElementById('book_author').innerHTML = data.author;
                    document.getElementById('book_genre').innerHTML = data.genre;
                    document.getElementById('book_description').innerHTML = data.description || '';
                    document.getElementById('book_copies').innerHTML += data.available_copies;
                    if(data.next_available_date!=null){
                        document.getElementById('book_next_available').innerHTML += data.next_available_date;
                    }
                    else if(data.available_copies!=0){
                        document.getElementById('book_next_available').innerHTML  += "NOW!";
                    }
                    else{
                        document.getElementById('book_next_available').innerHTML  += "No copies";
                    }   
                    return data;
                });
}




function details(id){
    load_page("main_book_view").then(function(){
            load_book_details(id);
        });
}


function borrow_book(book_id){
    var accessToken=localStorage.getItem('accessToken');
    const userId = get_user_id();
    if (!userId) {
        console.error('User ID not found. Please log in again.');
        alert('Błąd: Musisz być zalogowany aby wypożyczyć książkę.');
        return;
    }

    body = {
        book_id: book_id,
        user_id: parseInt(userId),
    }
    safeFetch("borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken  },
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
            if (data.error) {
                console.error('Borrow error:', data.error);
                alert('Błąd wypożyczenia: ' + data.error);
            } else {
                redirect();
            }
            return data;
        })
        .catch(function(error) {
            if (error.message !== 'Unauthorized') {
                console.error('safeFetch error:', error);
                alert('Błąd połączenia: ' + error.message);
            }
        });
}