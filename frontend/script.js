

function hideAll(){
    
}



function load_list() {
    safeFetch("user/load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(function (response) {
            console.log(response);
            return response.json();
        })
        .then(function (data) {
            var txt = "<table border='1'>";
            txt += "<tr><th>ID</th><th>Username</th><th>Email</th><th>Password</th><th>Akcje</th></tr>";
            
            for (var id in data) {
                txt += "<tr>";
                txt += "<td>" + data[id]['id'] + "</td>";
                txt += "<td>" + data[id]['username'] + "</td>";
                txt += "<td>" + data[id]['email'] + "</td>";
                txt += "<td>" + data[id]['password'] + "</td>";
                txt += "<td>";
                txt += "<button onclick=\"edit_record('" + data[id]['id'] + "')\">edit</button> ";
                txt += "<button onclick=\"delete_user('" + data[id]['id'] + "')\">delete</button>";
                txt += "</td>";
                txt += "</tr>";
            }
            txt += "</table>";
            document.getElementById('lista').innerHTML = txt;
        })
}

function delete_user(id) {
    safeFetch("user/delete/" + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            load_list();
        })
}

function addRecord() {
    console.log("add")
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    body = {
        username: username,
        email: email,
        password: password,
    }

    safeFetch("user/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
        .then(function (response) {
            console.log(response);
            load_list();
        })

}

function edit_record(id) {
    safeFetch("user/load/" + id, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            document.getElementById('username_edit').value = data.username;
            document.getElementById('email_edit').value = data.email;
            document.getElementById('password_edit').value = data.password;
            document.getElementById('id_edit').value = id;
            document.getElementById("edit").style.display = "block";
        })
}

function update() {

    safeFetch("user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            load_list();
            document.getElementById("edit").style.display = "none";
        })

}

