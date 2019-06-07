var t1aText = "To create a new user, hover over the User Management dashboard icon or navigation bar icon and click on Create User. Enter the required information in each of the fields, then click the Create User button."; 

var t2aText = "To View/Edit/Remove existing users, hover over the User Management dashboard icon on the home page. Click on the View/Edit/Remove Users button. To delete a user, check the box next to their name and click the Remove button at the top of the user table. To edit a user's name, click the Edit button in the same row as the user you'd like to edit. Enter changes in the textbox and click the Update button to save, or the Cancel button to discard changes. You can add a new user by clicking the Add User button at the top of the table.";
        
var t3aText = "To run a report, hover over the Reports dashboard icon and select Create Reports. Use the query form to construct your search query; scroll down the page to view a pie chart depicting the breakdown of the requested data. You will find more in-depth instructions when visiting the page.";
        
var t4aText = "Hover over the user icon in the top navigation bar and click Account. Your current account profile information will be displayed. Click on the Update Information button. To edit your name, enter changes in the Name textbox, then click the gray Update button to finalize your changes.";
        
var t5aText = "Hover over the user icon in the top navigation bar and click Account. Your current account profile information will be displayed. Click on the Change Password button and enter the new password in the Password text box, enter a second time in the Confirm Password password box, and click Change Password.";
        
var t6aText = "If you ever forget your password, you always have the option of resetting it. This can be done by clicking on the Forgot Password? link on the login page. Enter the email address for your account in the username box.  If the email is registered, your password will be reset and the new password will be emailed to that address.  If you do not receive an email, please contact your system administrator.";
        

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
            answerTitle[i].style.display = "none";
            answerTextElm[i].style.display = "none";
        }
    } 
}

function resetSearch(){
    for (i = 0; i < clickedStatus.length; i++){
        answerTitle[i].style.display = "block";
        answerTextElm[i].style.display = "block";
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

