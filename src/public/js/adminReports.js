document.addEventListener("DOMContentLoaded", function() {
    xhttpReq('/api/gcharts/getuseremails',populateIssuedBy);

});

// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});


// Instantiates the pie chart, passes in the data and
// draws it.
function drawChart(user,breakdown,chartData,startDate,endDate) {

var title = '';

// Create Chart Title.
if (user == "Select All"){
        title += 'All Awards broken down by ' + breakdown + ' ';
}
else {
        title += 'Awards issued by ' + user + ' broken down by ' + breakdown + ' ';
}
if (startDate.length > 1 && endDate.length > 1){
        title += 'from ' + startDate + ' to ' + endDate;
}
else if (startDate.length > 1){
        title += 'from ' + startDate + ' and onward';
}
else if (endDate.length > 1){
        title += 'from prior to ' + endDate;
}

// Create the data table.
var data = new google.visualization.DataTable();
data.addColumn('string', breakdown);
data.addColumn('number', 'Quantity');
data.addRows(chartData);

// Set chart options
var options = {'title':title,
               'width':800,
               'height':600};

// Instantiate and draw our chart, passing in some options.
var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
chart.draw(data, options);
}

var issuedByDropdown = document.getElementById("issuedby");
var breakdownByDropdown = document.getElementById("breakdownby");
var startdate = document.getElementById("startdate");
var enddate = document.getElementById("enddate");
var submitQueryButton = document.getElementById("submitQuery")

//Event Listeners
submitQueryButton.addEventListener("click",submitQuery)

function submitQuery (){
    const xmlHttp = new XMLHttpRequest();

    if (breakdownByDropdown.options[breakdownByDropdown.selectedIndex].text == 'Region'){
        var url = '/api/gcharts/submitregionquery';
    }
    else{
        var url = '/api/gcharts/submitdepartmentquery';
    }

    var email = issuedByDropdown.options[issuedByDropdown.selectedIndex].text;
    var breakdown = breakdownByDropdown.options[breakdownByDropdown.selectedIndex].text;
    var sdate = startdate.value;
    var edate = enddate.value;

    url += '?email=' + email + '&breakdown=' + breakdown + '&startdate=' + sdate + '&enddate=' + edate;
    xmlHttp.open("GET",url);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.send();

    if (breakdown == "Region"){
    xmlHttp.onreadystatechange=function(){
        if(this.readyState==4 && this.status==200){
            var res = JSON.parse(this.responseText);
            data = [];
            //var keys = Object.keys(res);
            //console.log(res);
            res.forEach(function(r){
                data.push(['Northeast',r.Northeast]);
                data.push(['South',r.South]);
                data.push(['Midwest',r.Midwest]);
                data.push(['West',r.West]);
		console.log(r.startDate);
                drawChart(email,breakdown,data,r.startDate,r.endDate);
            });
        }
    }
    }
    else if (breakdown == "Department"){
    xmlHttp.onreadystatechange=function(){
        if(this.readyState==4 && this.status==200){
            var res = JSON.parse(this.responseText);
            data = [];
            //var keys = Object.keys(res);
            //console.log(res);
            res.forEach(function(r){
                data.push(['Finance',r.Finance]);
                data.push(['Marketing',r.Marketing]);
                data.push(['HR',r.HR]);
                data.push(['IT',r.IT]);
                data.push(['Legal',r.Legal]);
                data.push(['Sourcing',r.Sourcing]);
                data.push(['Engineering',r.Engineering]);
                data.push(['Sales',r.Sales]);
                drawChart(email,breakdown,data,r.startDate,r.endDate);
            });
        }
    }

    }
}

function xhttpReq(url,func){
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET",url);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.send();

    xmlHttp.onreadystatechange=function(){
        if(this.readyState==4 && this.status==200){
            func(this);
        }
    }
}

function populateIssuedBy(xmlHttp){
    var res = JSON.parse(xmlHttp.responseText);
    res.forEach(function (r){
        var emailOption = document.createElement("option");
        emailOption.text = r.email;
        issuedByDropdown.add(emailOption);
    });
}



