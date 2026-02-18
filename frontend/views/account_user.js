let allLoans = []; // Przechowuje wszystkie wypożyczenia

function user_load_copies(){
    var accessToken=localStorage.getItem('accessToken');
    const userId = get_user_id();
    if (!userId) {
        console.error('User ID not found');
        return;
    }
    
    safeFetch("borrow", {
        method: "GET",
        headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken },
    })
        .then(function (response) {
            if (response.status === 401 || response.status === 403) {
                alert('Brak uprawnień do wykonania tej operacji.');
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(function(data){
            allLoans = data;
            applyLoanFilter();
        })
        .catch(function (error) {
            if (error.message !== 'Unauthorized') {
                alert('Błąd: ' + error.message);
            }
        });
}

function applyLoanFilter(){
    const showCurrentOnly = document.getElementById("filter_current_loans")?.checked || false;
    
    const filtered = showCurrentOnly 
        ? allLoans.filter(loan => loan.return_date === null)
        : allLoans;
    
    displayLoans(filtered);
}

function displayLoans(loans){
    var text="";
    for(let loan of loans){
        text+="<tr>";
        text+="<td>"+loan.id+"</td>";
        text+="<td>"+loan.title+"</td>";
        text+="<td>"+loan.author+"</td>";
        text+="<td>"+formatDate(loan.borrow_date)+"</td>";
        text+="<td>"+(loan.return_date ? formatDate(loan.return_date) : '')+"</td>";
        text+="<td>"+formatDate(loan.expected_return_date)+"</td>";
        text+="<td><button onclick=details("+loan.book_id+")>Details</button>";
        if(loan.return_date==null){
            text+="<button onclick=return_loan("+loan.id+")>Return</button></td>";
        }
        text+="</tr>";
    }
    document.getElementById("user_copies_list").innerHTML=text;
}

function formatDate(dateString){
    if(!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function return_loan(loan_id){
    var accessToken=localStorage.getItem('accessToken');
    safeFetch("borrow/return/"+loan_id, {
        method: "GET",
        headers: { "Content-Type": "application/json","Authorization":"Bearer "+accessToken },
    })
        .then(function (response) {
            if (response.status === 401 || response.status === 403) {
                alert('Brak uprawnień do wykonania tej operacji.');
                throw new Error('Unauthorized');
            }
            user_load_copies();
            return response.json();
        })
        .catch(function (error) {
            if (error.message !== 'Unauthorized') {
                alert('Błąd: ' + error.message);
            }
        });
}