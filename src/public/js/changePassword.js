$(function() {
    $("#changePass").click((e) => {
        e.preventDefault();

		let newPassword = $('#newPassword').val();
		let confirmPassword = $('#confirmPassword').val();
		let button = $('#changePass');

        // Set the base data object
        data = {
            "newPassword": newPassword,
            "confirmPassword": confirmPassword
        };

        $.ajax({
            url: "/api/password",
            type: "PATCH",
            data: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            dataType: "json",
            success: (res, status, jq) => {
				$("#newPassword").val('');
				$("#confirmPassword").val('');
				
				if($('#message').length) {
					$('#message').remove();
				}
				
				let $message = $('<p id="message">Password Change Successful</p>');
				button.after($message);
				
            },
            error: (jq, status, err) => {
				$("#newPassword").val('');
				$("#confirmPassword").val('');

				if($('#message').length) {
					$('#message').remove();
				}

				let $message = $('<p id="message">Password Change Failed</p>');
				button.after($message);
            }
        })
    });
});
