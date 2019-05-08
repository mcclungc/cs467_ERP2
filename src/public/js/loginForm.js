/*Javascript to Login to website*/

var submitButton = document.getElementById("login");
submitButton.addEventListener("click", login);

function login(){
	var req = new XMLHttpRequest();
	var form = document.getElementById("loginForm");
	var user = document.getElementById("user");
	var pass = document.getElementById("password");
	var entries = {};
	entries.userName = user.value;
	entries.password = pass.value;
	console.log(entries);
}

