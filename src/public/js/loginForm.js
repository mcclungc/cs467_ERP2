// /*Javascript to Login to website*/

$(function() {
    $("#login").click((e) => {
        e.preventDefault();

		let email = $('#email').val();
		let password = $('#password').val();

        // Set the base data object
        data = {
            "email": email,
            "password": password
        };

        $.ajax({
            url: "/api/login",
            type: "POST",
            data: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            dataType: "json",
            success: (res, status, jq) => {
				const host = window.location.host;
				
				if(res.is_admin == 0) {
					window.location.replace('http://' + host + '/home');
				} else {
					window.location.replace('http://' + host + '/admin');
				}
            },
            error: (jq, status, err) => {
				$("#email").val('');
				$("#password").val('');
            }
        })
    });
});
