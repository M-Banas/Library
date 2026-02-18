function loginIn(){
    var email = document.getElementById("login_email").value;
    var password = document.getElementById("login_password").value;
    body = {
        email: email,
        password: password,
    }
    safeFetch("user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if(data!="Wrong creditials" && data.role){
                set_role(data.role);
                set_user_id(data.user_id);
                set_user_name(data.name);
                set_tokens(data.accessToken,data.refreshToken);
                set_logged(true);
                redirect();
            }
        })
        .catch(function(error) {
            console.error('Login error:', error);
        });
}

function log_out(){
    set_logged(false);
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    load_page("login")
}
