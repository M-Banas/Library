
function checkPasswordStrength() {
    var password = document.getElementById("register_pass").value;
    var input = document.getElementById("register_pass");
    
    var hasLength = password.length >= 8;
    var hasUppercase = /[A-Z]/.test(password);
    var hasLowercase = /[a-z]/.test(password);
    var hasNumber = /[0-9]/.test(password);
    var hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    var allValid = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    
    if (password.length === 0) {
        input.classList.remove('input-valid', 'input-invalid');
    } else if (allValid) {
        input.classList.remove('input-invalid');
        input.classList.add('input-valid');
    } else {
        input.classList.remove('input-valid');
        input.classList.add('input-invalid');
    }
    
    updateRequirement('req-length', hasLength);
    updateRequirement('req-uppercase', hasUppercase);
    updateRequirement('req-lowercase', hasLowercase);
    updateRequirement('req-number', hasNumber);
    updateRequirement('req-special', hasSpecial);
    
    return allValid;
}

function updateRequirement(id, isValid) {
    var element = document.getElementById(id);
    if (isValid) {
        element.style.color = 'green';
    } else {
        element.style.color = 'gray';
    }
}

function checkPasswordSimilarity() {
    var password = document.getElementById("register_pass").value;
    var passwordConf = document.getElementById("register_pass_conf").value;
    var inputConf = document.getElementById("register_pass_conf");
    
    var isMatching = password === passwordConf && passwordConf.length > 0;
    
    if (passwordConf.length === 0) {
        inputConf.classList.remove('input-valid', 'input-invalid');
    } else if (isMatching) {
        inputConf.classList.remove('input-invalid');
        inputConf.classList.add('input-valid');
    } else {
        inputConf.classList.remove('input-valid');
        inputConf.classList.add('input-invalid');
    }
    
    return isMatching;
}

function checkEmailFormat() {
    var email = document.getElementById("register_email").value;
    var input = document.getElementById("register_email");
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    var isValid = emailRegex.test(email);
    
    if (email.length === 0) {
        input.classList.remove('input-valid', 'input-invalid');
    } else if (isValid) {
        input.classList.remove('input-invalid');
        input.classList.add('input-valid');
    } else {
        input.classList.remove('input-valid');
        input.classList.add('input-invalid');
    }
    
    return isValid;
}

function checkEmailSimilarity() {
    var email = document.getElementById("register_email").value;
    var emailConf = document.getElementById("register_email_conf").value;
    var inputConf = document.getElementById("register_email_conf");
    
    var isMatching = email === emailConf && emailConf.length > 0;
    
    if (emailConf.length === 0) {
        inputConf.classList.remove('input-valid', 'input-invalid');
    } else if (isMatching) {
        inputConf.classList.remove('input-invalid');
        inputConf.classList.add('input-valid');
    } else {
        inputConf.classList.remove('input-valid');
        inputConf.classList.add('input-invalid');
    }
    
    return isMatching;
}

function Register(){
    var name = document.getElementById("register_name").value;
    var lname = document.getElementById("register_lname").value;
    var email = document.getElementById("register_email").value;
    var email_conf = document.getElementById("register_email_conf").value;
    var password = document.getElementById("register_pass").value;
    var password_conf = document.getElementById("register_pass_conf").value;
    
    if (!name || !lname || !email || !email_conf || !password || !password_conf) {
        alert("Please fill in all fields!");
        return;
    }
    
    if (!checkEmailFormat() || !checkEmailSimilarity() || !checkPasswordStrength() || !checkPasswordSimilarity()) {
        alert("Please fix the validation errors!");
        return;
    }
    

    
    body = {
        name: name,
        lname:lname,
        email: email,
        password: password,
    }

    safeFetch("user/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            if(data == "User with this email already exists!"){
                alert("User with this email already exists!");
            }
            else{
                load_page('login');
            }
        })
        .catch(function (error) {
            console.error("Error:", error);
            alert("An error occurred during registration");
        })

    
}
