
const express = require('express');
//const router = express.Router();
const dateFormat = require('dateformat');
const fs = require('fs');
const Request = require('request');
const awardmailer = require('nodemailer');
const email = require('./email');

let transporter = awardmailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'cs467.erp2@gmail.com',
        clientId: email.client,
        clientSecret: email.secret,
        //not sure what these mean, using because Corey did in password reset function
        refreshToken: '1/Q4f4viCguSJLjfOfBuU2RuguW1uHNNdyC39kVcKWRDZpwxtuyRY5Bd83NkZV9nD9',
        accessToken: 'ya29.GlsQBzK-taNVovCNauIYlPrQllW7095SNg7Jf9cbSlSqXo-MqlIXI2v1Fotcf0ScV2aJgDzYWSZ1sZRe003obdzY2NwKy8sjZ0iKNqOFLx-DaHQO2fJB_GXIxzl-'
    }
});

exports.mailAward = function(RecipientName, RecipientEmail, awardrootfilename){
//exports.mailAward = function(RecipientName, RecipientEmail, awardTypeID, complete){
/*
if (awardTypeID === 1){
    dirpath = 'public/latexfiles/output/eomaward.pdf';
}
else if(awardTypeID === 2){
    dirpath = 'public/latexfiles/output/eowaward.pdf';
}*/
dirpath = 'public/latexfiles/output/'+ awardrootfilename + '.pdf'

fs.readFile(dirpath, function (err, data) {
    if (err) throw err; 
    toField = RecipientName + '<' + RecipientEmail + '>';
    console.log(toField);                                           
    var mailOptions = {
        from: 'erp2 <cs467.erp2@gmail.com>', // sender address                                               
        to: toField, // list of receivers                               
        subject: 'Your Employee Recognition Award', // Subject line                                           
        text: 'Here is your Recognition Award. We appreciate all you do!', // plaintext body
        html: '<b>Recognition Award - Thanks for all you Do!</b>', // html body
        attachments: [
            {
                filename: 'award.pdf',   
                path: dirpath,                                
                contentType: 'application/pdf'
            }]
    };
    

    // send mail with defined transport object                                                 
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });

    });

};

exports.cleanupOutputDir = function (){
    //https://stackoverflow.com/questions/27072866/how-to-remove-all-files-from-directory-without-removing-directory-in-node-js/42182416
    var path = require('path');
    var directory = 'public/latexfiles/output';
    console.log('Current directory: ' + process.cwd());
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
            });
        }
        });
};

exports.renderLatexDoc = function(awardtype,context, complete){    
    // cleanupOutputDir(); //delete existing files in latex output directory
    //as discussed at https://stackoverflow.com/questions/41560344/how-to-use-a-pdflatex-child-process-to-get-a-pdf-as-a-stream-in-node-js     
    var process = require('process');
    process.chdir('public/latexfiles');  
    //console.log('Current directory: ' + process.cwd());
    if (awardtype == 1)
    {
        templateName = 'eomtemplatewithfields.tex';
        var awardfilename ='eomaward'; 
        context.awardrecord[0].awardfilename = awardfilename;
        //console.log(context.awardrecord.awardfilename);
        var spawn  = require('child_process').spawn;
        var jobname = '-jobname='+awardfilename;
        var latex = spawn('pdflatex', ['-output-directory', 'output/',jobname, templateName]);
    }
    else if (awardtype ==2)
    {
        templateName = 'eowtemplatewithfields.tex';
        var awardfilename = 'eowaward';
        context.awardrecord[0].awardfilename = awardfilename;
        var spawn  = require('child_process').spawn;
        var jobname = '-jobname='+awardfilename;
        var latex = spawn('pdflatex', ['-output-directory', 'output/',jobname, templateName]);
    }
    process.chdir('../..');
    //console.log('Current directory: ' + process.cwd());
    complete();
    };

exports.testEmailAward = function(){
    exports.mailAward("Connie McClung", "connie_mcclung@comcast.net", "test"); 
}

exports.writeCSV = function(data){
    //https://www.npmjs.com/package/csv-writer
    var createCsvWriter = require('csv-writer').createObjectCsvWriter;  
    //set up field names for csv file
    var csvWriter = createCsvWriter({  
        path: 'public/latexfiles/awarddata.csv',
        header: [
        {id: 'rname', title: 'RecipientName'},
        {id: 'rdept', title: 'RecipientDept'},
        {id: 'rregion', title: 'RecipientRegion'},
        {id: 'awarder', title: 'Awarder'},
        {id: 'awardedon', title: 'Date'},
        {id: 'sigfile', title:'SigFilename'}
        ]
    });
    
        //write data to a csv file
        csvWriter  
        .writeRecords(data)
        .then(()=> console.log('The CSV file ' + csvWriter.path + ' was written successfully.')); 
};

