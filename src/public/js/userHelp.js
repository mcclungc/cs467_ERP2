var t1aText = "In order to create an award you must click on the create award button after logging into" +
        " your user account. Next you will be presented with a screen where you will need to fill in all requested data" +
        " about the recipeient of the award. Upon submission the recipient will receive an email containing a signed PDF " +
        "representation of the award you issued them.";

var t2aText = "Click on the Account button which is located on the top right. Select account and then click the change signature button. You will be given the option to either free draw a signature or if you prefer you can use the upload signature option to import a signature you have saved locally on your computer. A user can only have one signature associated with their account at any given time so any time you submit a signature, regardless of whether freedrawn or imported, your previous signature will be replaced with the most recently submitted one.";
        
var t3aText = "Click on the Account button which is located on the top right and select Account. Click on the Change Password button and enter in the new password you would like to use as well as entering a second time in the 'Confirm Password' password box and click Change Password.";
        
var t4aText = "Click on the Account button which is located on the top right and select Account. Next click on the 'Update Information' button. You should be presented with a page that allows you to edit your name, email address, region and Department. Make any alterations necessary and click 'Update' to finalize your changes.";
        
var t5aText = "You can access a searchable history of all the awards you have ever issued from the user home page by either clicking on 'History' along the top navigation bar or alternatively clicking on the 'Recent Activity' button. You have the ability to search for an Employee by name. You also have the option to preview award certifictes that have already been issued or alternatively have them emailed again to the recipient. You can do so by clicking the 'Preview' button next to a recipients award and you will be given the options to 'Download as PDF' or to 'Email to Recipient'. You also have the ability to Delete an award from the system if you so choose by clicking the 'Delete' button.";
        
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

