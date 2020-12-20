
$(function() { 

	var Weather = function() {
		var res = []
	}

	Weather.prototype.setDate = function() {
		var d = new Date();
		var n = d.toDateString(); 
	};

	

	Weather.prototype.setLocation = function() {
		$("#input-location").on("submit", (function(e){
			e.preventDefault();
			this.location = $("#location").val();
			$('.days-box').animate({opacity: 1}, 1200, 'linear');	
			$('.search-sun').animate({opacity: 0}, 1000, 'linear');	
			$('.weather-bg').show();
			$('.title-search-wrapper, .search-wrapper').hide();
			$('#remove-location').show();
			
			this.forecast();
			this.currentWeather();
		}).bind(this) );
	};


	Weather.prototype.getWeatherIcon = function(wId, sunrise, sunset) {
		if(wId) {
			var icon={};
			icon.name = "na";

			function between(min, max, group) {
				if (wId >= min && wId < max) {
					icon.name = group ? group : "na";
				}
			}

			between(200, 300, "thunderstorm");
			between(300, 400, "showers");
			between(500, 600, "rain");
			between(600, 700, "snow");
			between(700, 800, "na");
			between(801, 900, "cloudy");
			between(900, 1000, "na");


			var cond = {
					200: "storm-showers",
					201: "storm-showers",
					202: "thunderstorm",
					500: "rain-mix",
					501: "rain-mix",
					502: "rain",
					511: "sleet",
					520: "rain-mix",
					521: "rain-mix",
					600: "snow",
					611: "sleet",
					701: "fog",
					741: "fog",
					905: "windy",
					906: "hail",
				};

			var dayCond = {
				721: "haze",
				800: "sunny"
			};
			var nightCond = {
				800: "clear",
				701: "fog",
				741: "fog"
			};

			
			
			icon.name = cond[wId] ? cond[wId] : icon.name;
			icon.name = dayCond[wId] ? dayCond[wId] : icon.name;
			var time = "day";
			if (sunrise && sunset) {
				var now = Date.now()/1000;
				var srDate = new Date(sunrise*1000);
				if (srDate.getDate() == new Date().getDate()) {
					if (now <= sunrise && now >= sunset) {
						time = nightCond[wId] ? "night" : "night-alt";
						icon.name = nightCond[wId] ? nightCond[wId] : icon.name;
					}
				} else {
					time = nightCond[wId] ? "night" : "night-alt";
					icon.name = nightCond[wId] ? nightCond[wId] : icon.name;
				}
			}
			icon.name = "wi-"+icon.name;
			return icon;
		}
	}; //end getWeatherIcon

	Weather.prototype.displayWeatherIcon = function(selector, icon) {
		if (selector && typeof icon == "object") {
			if (icon.name != "na") {
				$(selector).addClass(icon.name);
			}
		}
	};

	

	Weather.prototype.currentWeather = function() {
		if (this.location) {
			
			function setMain(res) {
				if (res.main) {
					$("#temperature").text(Math.round(res.main.temp)+"° C");
					$("#city-name").text(res.name);
				}
			}

			$.getJSON("https://api.openweathermap.org/data/2.5/weather",{q: this.location, units: "metric", appid: "bc1301b0b23fe6ef52032a7e5bb70820"}, (function(json) {
				var wId = json.weather[0].id;
				if(wId) {
					var icon = this.getWeatherIcon(wId, json.sys.sunrise, json.sys.sunset);
					this.displayWeatherIcon("#wicon-main",icon);
				}
				setMain(json);
			}).bind(this) );
		}
	}; 



	Weather.prototype.forecast = function() {
		function setForecast(res) {
			this.daily=[];
			var list = res.list;
			
			for (var i = 0, len = list.length; i < len; i++) {
				this.daily[i] = this.daily[i] ? this.daily[i] : {};
				this.daily[i].mainTemp = Math.round(list[i].temp.day);
				this.daily[i].day = new Date(list[i].dt*1000).getDay();
				var iconId = list[i].weather[0].id;
				this.daily[i].icon = this.getWeatherIcon(iconId);
			}
		}
		function displayForecast() {
			var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
			_this = this;
			$(".days-box").children(".day-col").each(function(index) {
				$(this).find('.day').text(days[_this.daily[index].day]);
				$(this).find('.d-main-temp').text(_this.daily[index].mainTemp+"°");
				$(this).find('.wi').addClass(_this.daily[index].icon.name);

			});
		}
		

		$.getJSON("https://api.openweathermap.org/data/2.5/forecast/daily",{q: this.location, cnt: 7, units: "metric", appid: "bc1301b0b23fe6ef52032a7e5bb70820"}, (function(json) {
				setForecast.call(this,json);
				displayForecast.call(this);	
		}).bind(this) );
	};



    
	$('.day-col-content').on('click', function() {
		$('.courrent-temperature').empty();
		$('.day-col').removeClass('selected');
		$(this).parent().addClass('selected');
		$('.selected-day').html($(this).clone());
		$('.actual-weather .temperature').insertBefore($('.actual-weather .weather')); 
	});
	
	$('.actual-weather #temperature').insertBefore($('.actual-weather i')); 

	$('#remove-location').on("click", function(){
		location = "";
	});
	$('#city-name').appendTo('.location-name');


	$( document ).ajaxComplete(function( event, request, settings ) {
		if($('.weather .wi-sunny').length) {
			$('body .weather-bg').removeClass('cloud-bg rain-bg snow-bg storm-bg');
			$('body .weather-bg').addClass('sun-bg');
		}
		if($('.weather .wi-cloudy').length) {
			$('body .weather-bg').removeClass('sun-bg rain-bg snow-bg storm-bg');
			$('body .weather-bg').addClass('cloud-bg');
		}
		if($('.wi-main.wi-snow').length) {
			$('body .weather-bg').removeClass('cloud-bg rain-bg sun-bg storm-bg');
			$('body .weather-bg').addClass('snow-bg');
		}
		/*if($('.weather .wi-rain, .weather .wi-rain-mix').length) {
			$('body .weather-bg').removeClass('cloud-bg sun-bg snow-bg storm-bg');
			$('body .weather-bg').addClass('rain-bg');
		}*/
		if($('.weather .wi-storm-showers, .weather .wi-thunderstorm').length) {
			$('body .weather-bg').removeClass('cloud-bg rain-bg snow-bg sun-bg');
			$('body .weather-bg').addClass('storm-bg');
		}
		
	});

	var weather = new Weather();
		weather.setDate();
		weather.setLocation();

});