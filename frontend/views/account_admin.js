function admin_load_users(){
    var accessToken=localStorage.getItem('accessToken');
    var text="";
        safeFetch("user/load", {
            method: "GET",
            headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken },
        }).then(function (response) {
                return response.json();
            })
            .then(function(data){
                for(let user of data){
                    text+="<tr>";
                    text+="<td>"+user.id+"</td>";
                    text+="<td>"+user.name+"</td>";
                    text+="<td>"+user.lname+"</td>";
                    text+="<td>"+user.email+"</td>";
                    text+="<td>"+user.is_admin+"</td>";
                    text+="</tr>";
                }
                document.getElementById("admin_user_list").innerHTML=text;
            })
            .catch(function (error) {
                if (error.message !== 'Unauthorized') {
                    document.getElementById("admin_user_list").innerHTML = '<tr><td colspan="6" style="color:red;">Błąd: ' + error.message + '</td></tr>';
                }
            });
          
}
function admin_load_books(){
    var text="";
        safeFetch("book/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function(data){
            for(let book of data){
                text+="<tr>";
                text+="<td>"+book.id+"</td>";
                text+="<td>"+book.title+"</td>";
                text+="<td>"+book.author+"</td>";
                text+="<td>"+book.genre+"</td>";
                text+="<td>"+book.description+"</td>";
                text+="<td>"+book.copies+"</td>";
                text+="<td><button onclick=book_editor("+book.id+")>Edit Book</button>"+"<button onclick=delete_book("+book.id+")>Delete Book</button>"+"</td>";
                text+="</tr>";
            }
            document.getElementById("admin_books_list").innerHTML=text;
        });
}



function admin_account_load_content(){
        admin_load_users();
        admin_load_books();
}




