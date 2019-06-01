var t1aText = "In order to create a new user hover over the 'User Management' button on the home page. Click on the 'Create User' button. Fill in the requested information in each of the fields and finally click the 'Create User' button."; 

var t2aText = "In order to View/Edit/Remove existing user hover over the 'User Management' button on the home page. Click on the 'View/Edit/Remove' button. In order to delete a user you need to put a check in the check box next to their name and click the 'Delete' button. To edit a user, you simply need to click the 'edit' button in the same row as the user you'd like to edit. It will take you to another page where you can edit details about the user. You also have the option to add a new user by clicking the 'Add User' button.";
        
var t3aText = "In order to run a Report, hover over the 'Reports' button on the home page. Click on 'Create Reports'. It will bring you to a page which will allow you to construct you're own search query and in return you'll be presented with a pie chart depicting the breakdown of the requested data. You will find more indepth instructions when visiting the page.";
        
var t4aText = "Click on the Account button which is located on the top right and select Account. Next click on the 'Update Information' button. You should be presented with a page that allows you to edit your name and email address. Make any alterations necessary and click 'Update Information' to finalize your changes.";
        
var t5aText = "Click on the Account button which is located on the top right and select Account. Next click on the 'Change Password' button. You should be presented with a page that allows you to set a new password. Click 'Change Password' and that will complete the alterations.";
        
var t6aText = "If you ever forget your password you always have the option of resetting it. This can be done so by clicking on the 'Forgot Password?' link on the login page. You will be asked to enter in the email the account was registered under.  If the email is registered, a password reset email will be sent. If you do not receive an email, please contact your system administrator.";
        

var t1 = document.getElementById("t1");
var t1a = document.getElementById("t1a");
var t2 = document.getElementById("t2");
var t2a = document.getElementById("t2a");
var t3 = document.getElementById("t3");
var t3a = document.getElementById("t3a");
var t4 = document.getElementById("t4");
var t4a = document.getElementById("t4a");
var t5 = document.getElementById("t5");
var t5a = document.getElementById("t5a");
var t6 = document.getElementById("t6");
var t6a = document.getElementById("t6a");

var searchButton = document.getElementById("searchButton");
var resetButton = document.getElementById("reset");
var searchQuery = document.getElementById("searchQuery");

answerTitle = [t1,t2,t3,t4,t5,t6];
answerTextElm = [t1a,t2a,t3a,t4a,t5a,t6a];
answerText = [t1aText,t2aText,t3aText,t4aText,t5aText,t6aText];
clickedStatus = [0,0,0,0,0,0];

searchButton.addEventListener ("click",search);
resetButton.addEventListener ("click",resetSearch);

function search(){
    
    var included = [0,0,0,0,0,0];
    var searchText = searchQuery.value.toUpperCase();
    console.log(searchText);
    resetSearch();
    
    for (i = 0; i < included.length; i++){
        if(answerTitle[i].textContent.toUpperCase().includes(searchText) || answerText[i].toUpperCase().includes(searchText)){
            included[i] = 1;
        }
    }
    
    for (i = 0; i < included.length; i++){
        if(included[i] != 1){
            answerTitle[i].style.visibility = "hidden";
            answerTextElm[i].style.visibility = "hidden";
        }
    } 
}

function resetSearch(){
    for (i = 0; i < clickedStatus.length; i++){
        answerTitle[i].style.visibility = "visible";
        answerTextElm[i].style.visibility = "visible";
        answerTextElm[i].innerHTML = "";
        searchQuery.value = "";
    }
}

t1.onclick = function(){
    if (clickedStatus[0] == 0){
        t1a.innerText = t1aText;
        clickedStatus[0] = 1;
    }
    else{
        t1a.innerText = "";
        clickedStatus[0] = 0;
    }
};

t2.onclick = function(){
    if (clickedStatus[1] == 0){
        t2a.innerText = t2aText;
        clickedStatus[1] = 1;
    }
    else{
        t2a.innerText = "";
        clickedStatus[1] = 0;
    }
};

t3.onclick = function(){
    if (clickedStatus[2] == 0){
        t3a.innerText = t3aText;
        clickedStatus[2] = 1;
    }
    else{
        t3a.innerText = "";
        clickedStatus[2] = 0;
    }
};

t4.onclick = function(){
    if (clickedStatus[3] == 0){
        t4a.innerText = t4aText;
        clickedStatus[3] = 1;
    }
    else{
        t4a.innerText = "";
        clickedStatus[3] = 0;
    }
};

t5.onclick = function(){
    if (clickedStatus[4] == 0){
        t5a.innerText = t5aText;
        clickedStatus[4] = 1;
    }
    else{
        t5a.innerText = "";
        clickedStatus[4] = 0;
    }
};

t6.onclick = function(){
    if (clickedStatus[5] == 0){
        t6a.innerText = t6aText;
        clickedStatus[5] = 1;
    }
    else{
        t6a.innerText = "";
        clickedStatus[5] = 0;
    }
};

searchQuery.addEventListener('keydown', function(event){
    if (event.keyCode == 13){
        search();
    }
} );

