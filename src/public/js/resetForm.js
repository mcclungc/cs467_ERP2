var submitButton = document.getElementById("reset");
submitButton.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
	var form = document.getElementById("resetForm");
	var user = document.getElementById("username");
	var entry = {};
	entry.userName = user.value;
	req.open("POST", "/", true);
	req.setRequestHeader('Content-Type','application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			console.log(response);
			form.innerHTML = '<p class="formResponse">**If your email matches one we have on file, then we will email a temporary password shortly.  If you do not receive an email, please contact your system administrator.**<br /><br /><br /><a href="/" class="submit">Return to Login</a></p>';
		} else {
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(entry));
});
