var submitButton = document.getElementById("createUser");
submitButton.addEventListener("click", function(event) {
	event.preventDefault();
	var req = new XMLHttpRequest();
	var form = document.getElementById("cUser");
	var user = document.getElementById("userName");
	var password = document.getElementById("password");
	var name = document.getElementById("name");
	var department = document.getElementById("department");
	var region = document.getElementById("region");
	var uType = document.getElementById("userType");
	var formInput = {};
	formInput.email = user.value;
	formInput.password = password.value;
	formInput.name = name.value;
	formInput.department_id = department.value;
	formInput.region_id = region.value;
	formInput.is_admin = uType.value;
	req.open("POST", "/api/users", true);
	req.setRequestHeader('Content-Type','application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			console.log(response);
			if(response.id){
				form.insertAdjacentHTML('afterend', '<p class="userCreated">User Successfully Created!</p>');
			}
		} else {
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(formInput));
});
