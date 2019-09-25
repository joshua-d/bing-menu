"use strict";

var Alexa = require("alexa-sdk");
var http = require('http');

var date = new Date();
var day = date.getDay();

function httpGet(callback, diningHallURL) {
    var options = {
        host: 'menus.sodexomyway.com',
        path: diningHallURL,
        method: 'GET',
    };

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        res.on('end', () => {
            callback(responseString);
        });

    });
    req.end();
}


function readResponse(responseString, meal) {
	
	var foods = [];
	
	var meals = ["BREAKFAST", "LUNCH", "DINNER", "CONTINUOUS", "BRUNCH", "DINNER"];
	
	
	if (day > 4 && meal == 4) {
	  
	  for (var i = 0; i < 7 - day; i++) {
	
		  responseString = responseString.slice(responseString.indexOf(meals[meal]) + 1, responseString.length);
	
	  }
	  
	}
	
	else {
	
  	for (var i = 0; i < day; i++) {
	
	  	responseString = responseString.slice(responseString.indexOf(meals[meal]) + 1, responseString.length);
	
	  }
	
	}
	
  
	responseString = responseString.slice(0, responseString.indexOf(meals[meal + 1]));
	
	while (responseString.indexOf("foodItemName") != -1) {
		
		responseString = responseString.slice(responseString.indexOf("foodItemName") + 1, responseString.length);
		
		foods[foods.length] = responseString.slice(responseString.indexOf("\"") + 1, responseString.indexOf("\" data"));
		
	}
	
	return foods;
	
}


var handlers = {
  "MainIntent": function () {
    
    var foods;
    
    var diningHall = this.event.request.intent.slots.diningHall.value;
    var diningHallURL;
    
    if (!diningHall)
      diningHall = "CIW";
      
    if (diningHall == "college in the woods" || diningHall == "ciw" || diningHall == "CIW")
      diningHall = "C I W";
    else if (diningHall == "app")
      diningHall = "Appalachian";
    else if (diningHall == "newing" || diningHall == "Dickinson" || diningHall == "Chenango Champlain Collegiate Center" || diningHall == "C-4" || diningHall == "C4")
      diningHall = "c4";
      
      
    switch (diningHall) {
      
      case "C I W":
        diningHallURL = '/BiteMenu/Menu?menuId=1203&locationId=74015005&whereami=https://binghamton.sodexomyway.com/dining-near-me/woods-dinig-center';
        break;
      case "c4":
        diningHallURL = '/BiteMenu/Menu?menuId=1204&locationId=74015006&whereami=https://binghamton.sodexomyway.com/dining-near-me/chenango-champlain-collegiate-center';
        break;
      case "Hinman":
        diningHallURL = '/BiteMenu/Menu?menuId=1205&locationId=74015007&whereami=https://binghamton.sodexomyway.com/dining-near-me/hinman-dining-center';
        break;
      case "Appalachian":
        diningHallURL = '/BiteMenu/Menu?menuId=1202&locationId=74015009&whereami=https://binghamton.sodexomyway.com/dining-near-me/appalachian-collegiate-center';
      
    }
      
    
    var meal = this.event.request.intent.slots.meal.value;
    var mealID;
    
    
    switch (meal) {
      
      case "breakfast":
        mealID = 0;
        break;
      case "lunch":
        mealID = 1;
        break;
      case "dinner":
        mealID = 2;
        break;
      case "brunch":
        mealID = 4;
        break;
      
    }
    
    if (day > 4 && mealID < 2) {
      
      mealID = 4;
      meal = "brunch";
      
    }
        
    httpGet(responseString => {
			
			foods = readResponse(responseString, mealID);
			
			this.response.speak("For " + meal + ", at " + diningHall + ", there is: " + foods);
		
		  this.emit(':responseReady');
			
		}, diningHallURL);
		
  },
  
  
  "LaunchRequest": function () {
    
    this.response.speak("Welcome to Bing Menu. Try saying \"Alexa, bing menu dinner\", or \"Alexa, set dining hall to CIW\"");
    
    this.emit(':responseReady');
    
  }
  
};


exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
