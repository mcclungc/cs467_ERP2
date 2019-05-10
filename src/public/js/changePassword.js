var submitButton = document.getElementById("changePass");
submitButton.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
	var form = document.getElementById("password");
	var pass = document.getElementById("newPassword");
	var entry = {};
	entry.password = pass.value;
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
	req.send(JSON.stringify(entry));
});
