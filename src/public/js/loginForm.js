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
	req.open("POST", "/", true);
	req.setRequestHeader('Content-Type','application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			console.log(response);
		} else {
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(entries));
}

