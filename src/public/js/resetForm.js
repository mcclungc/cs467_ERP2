$(function() {
    $("#reset").click((e) => {
        e.preventDefault();

		let email = $('#email');

        // Set the base data object
        data = {
            "email": email.val(),
        };

        $.ajax({
            url: "/api/password",
            type: "POST",
            data: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            dataType: "json",
            success: (res, status, jq) => {
				const host = window.location.host;
				window.location.replace('http://' + host);

            },
            error: (jq, status, err) => {
				const host = window.location.host;
				window.location.replace('http://' + host);
            }
        })
    });
});
