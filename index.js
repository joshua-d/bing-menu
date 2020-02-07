"use strict";

var Alexa = require("alexa-sdk");
var http = require('http');

var date = new Date();
var day = (date.getDay() + 6) % 7;


function get_web_data(callback, diningHallURL) {
  
    var options = {
        host: 'menus.sodexomyway.com',
        path: diningHallURL,
        method: 'GET',
    };

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var res_data = "";
        
        res.on('data', chunk => {
            res_data = res_data + chunk;
        });
        
        res.on('end', () => {
            callback(res_data);
        });

    });
    
    req.end();
    
}


function readResponse(res_data, mealID) {
    
    var foods = [];
    var meals = ["BREAKFAST", "LUNCH", "AFTERNOON SNACK", "DINNER", "BRUNCH"];
    var meal = meals[mealID];
    
    if (day > 4) {
      for (var i = 0; i < day - 4; i++)
        res_data = res_data.slice(res_data.indexOf(meal) + 1);
    }
    else
      for (var i = 0; i < day + 1; i++)
        res_data = res_data.slice(res_data.indexOf(meal) + 1);
    
    res_data = res_data.slice(0, res_data.indexOf("accordion-block"));
    
    while (res_data.indexOf("foodItemName") >= 0) {
        res_data = res_data.slice(res_data.indexOf("foodItemName") + 14);
        foods[foods.length] = res_data.slice(0, res_data.indexOf("\""));
    }
    
    return foods;
    
}

  
var handlers = {
  
  "MainIntent": function () {
    
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
        diningHallURL = '/BiteMenu/Menu?menuId=17395&locationId=74015005&whereami=https://binghamton.sodexomyway.com/dining-near-me/woods-dinig-center';
        break;
      case "c4":
        diningHallURL = '/BiteMenu/Menu?menuId=18060&locationId=74015006&whereami=https://binghamton.sodexomyway.com/dining-near-me/chenango-champlain-collegiate-center';
        break;
      case "Hinman":
        diningHallURL = '/BiteMenu/Menu?menuId=1205&locationId=74015007&whereami=https://binghamton.sodexomyway.com/dining-near-me/hinman-dining-center';
        break;
      case "Appalachian":
        diningHallURL = '/BiteMenu/Menu?menuId=17338&locationId=74015009&whereami=https://binghamton.sodexomyway.com/dining-near-me/appalachian-collegiate-center';
      
    }
      
    
    var meal = this.event.request.intent.slots.meal.value;
    var meals = ['breakfast', 'lunch', 'afternoon snack', 'dinner', 'brunch'];
    var mealID = meals.indexOf(meal);
    
    if (day > 4 && mealID < 2) {
      mealID = 4;
      meal = "brunch";
    }
    
        
    get_web_data(res_data => {
			
        var foods = readResponse(res_data, mealID);
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
