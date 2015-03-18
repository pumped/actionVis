var dataShim = function() {
	this.FEATURE = 0;
	this.THREAT = 1;
	this.ISLAND = 2;

	this.predatorColours = ['#f63','#f36','#f65','#f34','#f12'];
	this.speciesColor = '#333';//'#007EED'
	this.years = 0;
};

//exports.dataShim = dataShim;

//get ID <-> Common name lookup array
dataShim.prototype.getLookup = function() {

};


//set data for processing
dataShim.prototype.addFeaturesThreats = function(newFeatures, threats) {
	
	//features
	this.featuresRelevant = this._processRelevantFeatures(newFeatures.Features);

	var byIsland = this._processFeaturesByIsland(newFeatures.Features);
	this.featuresByIsland = byIsland[0];
	this.featureLocations = byIsland[1];

	//threats
	this.threatsRelevant = this._processRelevantThreats(threats.Threats);

	var byIsland = this._processThreatsByIsland(threats.Threats);
	this.threatsByIsland = byIsland[0];
	this.threatLocations = byIsland[1];	
};

dataShim.prototype.getFeaturesThreats = function(feature) {
	
	var threatArray = [];

	f = this.features_threats.FxT;
	var i;
	//get index from weird data structure
	for (i in f.ID_features) {
		//console.log(f.ID_features[i][0]);
		if (f.ID_features[i][0] == feature) {
			break;	
		}
	}

	//process matrix
	for (var j in f.features_threats) {
		if (f.features_threats[j][i] == 1) {
			//push threat ID
			threatArray.push(f.ID_threats[j][0]);
		}
	}

	//onsole.log(threatArray);

	return threatArray;
}

dataShim.prototype.getThreatsFeatures = function(threat) {
	
	var featureArray = [];

	f = this.features_threats.FxT;
	var i;
	//get index from weird data structure
	for (i in f.ID_threats) {
		//console.log(f.ID_threats[i][0]);
		if (f.ID_threats[i][0] == threat) {
			break;	
		}
	}

	//console.log(i);
	//process matrix
	for (var j in f.features_threats[i]) {
		if (f.features_threats[i][j] == 1) {
			//push threat ID
			featureArray.push(f.ID_features[j][0]);
		}
	}

	//console.log(featureArray);

	return featureArray;
}



dataShim.prototype.addActions = function (actions, threats) {
	this._processActions(actions, threats);
}

dataShim.prototype._processRelevantFeatures = function(f) {
	
	var relevant = [];

	this.years = f.relevant.length;

	//process relevant
	for (year in f.relevant) {
		var rYear = [];
		for (i in f.relevant[year]) {
			var rel = {
				"value": f.relevant[year][i],
				"island": f.ID_isl_relevant[i],
				"feature": f.ID_feat_relevant[i]
			}			
			rYear.push(rel);
		}
		relevant.push(rYear);
	}

	return relevant;
}

dataShim.prototype._processRelevantThreats = function(f) {
	
	var relevant = [];

	//process relevant
	for (year in f.relevant) {
		var rYear = [];
		for (i in f.relevant[year]) {
			var rel = {
				"value": f.relevant[year][i],
				"island": f.IDs_isl_relevant[i],
				"feature": f.IDs_th_relevant[i]
			}			
			rYear.push(rel);
		}
		relevant.push(rYear);
	}

	return relevant;
}


dataShim.prototype._processFeaturesByIsland = function(f) {

	// process features on Island
	var islandFeatures = {};
	var featuresIsland = {};
	for (i in f.ID_isl_relevant) {
		var island = f.ID_isl_relevant[i];
		var feature = f.ID_feat_relevant[i];

		//features on a particular island
		islandFeatures[island] = islandFeatures[island] || [];
		islandFeatures[island].push(feature);

		//islands a feature is on
		featuresIsland[feature] = featuresIsland[feature] || [];
		featuresIsland[feature].push(island);

	}

	return [islandFeatures, featuresIsland];	
}

dataShim.prototype._processThreatsByIsland = function(f) {

	// process features on Island
	var islandFeatures = {};
	var featuresIsland = {};
	for (i in f.IDs_isl_relevant) {
		var island = f.IDs_isl_relevant[i];
		var feature = f.IDs_th_relevant[i];

		//features on a particular island
		islandFeatures[island] = islandFeatures[island] || [];
		islandFeatures[island].push(feature);

		//islands a feature is on
		featuresIsland[feature] = featuresIsland[feature] || [];
		featuresIsland[feature].push(island);

	}

	return [islandFeatures, featuresIsland];	
}

dataShim.prototype._processF = function(f, features, data) {
	//console.log(f);
	var thresholds = {};
	for (var i in features.ID_isl_relevant) {

		// get feature id and island id
		var id = features.ID_feat_relevant[i];
		var island = features.ID_isl_relevant[i];

		var threshArray = f.F["thresh"+(parseInt(i)+1)];
		/*var thresholds = {};*/
		/*for (var j in threshArray) {
			var threshID = 0;
			thresholds[threshID] = )
		}*/

		//get threat that is on this island and affects species
		//console.log("ID: " + id);

		var threatIDs = [];
		for (var j in data["island"][island]["invasive-species"]) {
			var th = data["island"][island]["invasive-species"][j];
			//console.log("th: " + th);
			// if it endangers the species
			idx = data["invasive-species"][th].endangers.indexOf(id);
			//console.log("IDX: " + idx);
			if (idx>=0)	{
				//console.log(th + ' endangers '+ id);
				threatIDs.push(th);
			}
		}

		////console.log(parseInt(i)+1);
		//console.log(threshArray);

		var threats = {}
		if (threatIDs.length == 1) {
			threats[threatIDs[0]] = threshArray;
		} else {
			for (var j in threatIDs) {
				threats[threatIDs[j]] = threshArray[j];
			}
		}

		//console.log("ID: " + id);
		//console.log("Island: " + island);
		//console.log(threats);
		
		//feature,island --- threat->threshold
		/*
		id:{
			island:<islandID>,
			threatThresholds: {
				<threatID>:<threshold>
			}		
		}
		*/
		if (!thresholds[id]) {
			thresholds[id] = {}
		}
		thresholds[id][island] = threats;
	}

	this.thresholds = thresholds;
	//console.log(thresholds);
}

dataShim.prototype._getThresholds = function(featureID, islandID, threatID) {
	//console.log("Feature: "+featureID+", Island: "+islandID+", Threat: "+threatID);
	try {
		return this.thresholds[featureID][islandID][threatID];
	} 
	catch (err) {
		return false;
	}
}

dataShim.prototype._processActions = function(a,t) {
	var actions = a.chrom_best;
	var threats = t.Threats;

	var newActions = {};
	var actionsByIsland = {};

	var id = 0;
	var j;
	for (i in actions) {
		j = i % threats.IDs_isl_relevant.length;
		
		if (actions[i]) {
			island = threats.IDs_isl_relevant[j];
			year = parseInt(i / threats.IDs_isl_relevant.length);
			target = threats.IDs_th_relevant[j];

			var action = {
				"id": id,
				"type": "control",
				"cost": 1,
				"year": year,
				"target": target
			}

			//console.log(i + " : " + threats.IDs_isl_relevant[j]);

			newActions[id] = action;
			actionsByIsland[island] = actionsByIsland[island] || [];
			actionsByIsland[island].push(id);

			//increment id
			id++;			
		}
	}

	this.actions = newActions;
	this.actionsByIsland = actionsByIsland;
}

dataShim.prototype.getFeatures = function() {
	return this.featuresRelevant;
};


dataShim.prototype.addLookup = function(lookup) {
	this.lookup = lookup.Json;
}

//convert ID to Common Name
dataShim.prototype.lookupID = function(lookupType,ID) {
	/* 
		By ID or Constant
		feature: 0 | dataShim.FEATURE
		threat:  1 | dataShim.THREAT
		island:  2 | dataShim.ISLAND
	*/
	var l;

	switch (lookupType) {
		case this.FEATURE:
			l = this.lookup.features;
			break;

		case this.THREAT:
			l = this.lookup.threats;
			break;

		case this.ISLAND:
			l = this.lookup.islands;
			break;
	}

	var id = l[0].indexOf(ID);

	if (id == -1) {
		return false;
	}

	return l[1][id];
}

dataShim.prototype.addData = function(features, threats, chromosome, lookup, F, features_threats) {
	//process lookup data
	this.addLookup(lookup);
	lookup = this.lookup;

	this.features_threats = features_threats;

	//process threats/features
	this.addFeaturesThreats(features,threats, features_threats);

	this.addActions(chromosome, threats);

	var newData = {};

	newData.action = this.actions;
	
	//islands
	var islands = {};
	for (i in lookup.islands[0]) {
		var id = lookup.islands[0][i];
		var newIsland = {
			"id": id,
			"name": lookup.islands[1][i],
			"geometry": id,		  
			"species": this.featuresByIsland[id],
			"invasive-species": this.threatsByIsland[id]
		};

    //
    // assigning the location ids to the islands
    //
    (this.actionsByIsland[id] || []).forEach(function (e) {
      this.actions[e].location = id;
    }, this);

		islands[id] = newIsland;
	}

	newData.island = islands;

    //features
	var featuresLookup = {};
	for (i in lookup.features[0]) {
		var id = lookup.features[0][i];
		var newFeature = {
			"id": id,
			"name": lookup.features[1][i], 
			"location": (this.featureLocations[id] || []).map(function (id) { 
				return parseInt(islands[id].id, 10); 
			  }),
			"predators": this.getFeaturesThreats(id)
		}
		featuresLookup[id] = newFeature;
	}

	newData.species = featuresLookup;

	//invasives
	var threats = {};
	for (i in lookup.threats[0]) {
		var id = lookup.threats[0][i];
		var newThreat = {
			"id": id,
			"name": lookup.threats[1][i], 
			"location": (this.threatLocations[id] || []).map(function (id) { 
				return parseInt(islands[id].id, 10); 
			  }),
			"endangers": this.getThreatsFeatures(id)
		}
		threats[id] = newThreat;
	}

	newData["invasive-species"] = threats;



	this.data = newData;


	//process f structure
	this._processF(F,features.Features,this.data);



	//clean up
	delete this.features_threats;
}

dataShim.prototype.getData = function() {
	return this.data;
}


/* --- Graph Functions --- */

dataShim.prototype.getIslandFeatureGraph = function(islandID) {
	return this.getFeatureGraph(-1,islandID);
}

dataShim.prototype.getIslandThreatGraph = function(islandID) {
	return this.getThreatsGraph(-1,islandID);
}

dataShim.prototype.getFeatureGraph = function(featureID, islandID) {
	featureID = featureID || -1;
	islandID = islandID || -1;

	//console.log(featureID + " " + islandID);

	var featureGraph = {};

	for (year=0; year < this.featuresRelevant.length; year++) {
		for (i in this.featuresRelevant[year]) {

			//if feature id matches or is undefined
			if (this.featuresRelevant[year][i].feature == featureID || featureID == -1) {
				
				//if island id matches or is undefined
				if (this.featuresRelevant[year][i].island == islandID || islandID == -1) {
					if (featureGraph[year]) {
						featureGraph[year][1] += this.featuresRelevant[year][i].value;
					} else {
						featureGraph[year] = [year, this.featuresRelevant[year][i].value];
					}
				}

			}

		}
	}

	return featureGraph;
};

dataShim.prototype.getRealFeatureGraph = function(featureID, islandID) {
	var featureGraph = this.getFeatureGraph(featureID, islandID);

	var featureArray = Object.keys(featureGraph).map(function (key) {return featureGraph[key]});

	return featureArray;
};

dataShim.prototype.getThreatsGraph = function(featureID, islandID) {
	featureID = featureID || -1;
	islandID = islandID || -1;

	//console.log(featureID + " " + islandID);

	var featureGraph = {};

	for (year=0; year < this.threatsRelevant.length; year++) {
		for (i in this.threatsRelevant[year]) {

			//if feature id matches or is undefined
			if (this.threatsRelevant[year][i].feature == featureID || featureID == -1) {
				
				//if island id matches or is undefined
				if (this.threatsRelevant[year][i].island == islandID || islandID == -1) {
					if (featureGraph[year]) {
						featureGraph[year][1] += this.threatsRelevant[year][i].value;
					} else {
						featureGraph[year] = [year, this.threatsRelevant[year][i].value];
					}
				}

			}

		}
	}

	return featureGraph;
}

dataShim.prototype.getRealThreatGraph = function(threatID, islandID) {
	var threatGraph = this.getThreatsGraph(threatID, islandID);

	var threatArray = Object.keys(threatGraph).map(function (key) {return threatGraph[key]});

	return threatArray;
};

dataShim.prototype.getFullFeatureGraph = function(featureID, islandID) {
	var feature = this.data.species[featureID];
	var predators = this.data["invasive-species"];

	

	var data = {
		"series": [],
		"yAxis": [],
		"title": feature.name + " Abundance"
	};

	//build species series
	data.series[0] = {
		"name": 'Population',
		"data": this.getRealFeatureGraph(featureID, islandID),
		"lineWidth":6,
		"color": this.speciesColor
	};

	//build species yAxis
	data.yAxis = [{
        "title": {
            "text": 'Feature Population',
            "style": {
                "color": this.speciesColor,
                "fontWeight": 'bold'
            }
        }
    },{
        "title": {
            "text": 'Threat Presence'
        },
        "opposite": true,            
        "plotLines": [],
        "min": 0,
        "max":1
    }];

	//build threat series
	var threatSeriesCount = 0;
	for (i in feature.predators) {
		//lookup the predator
		var predator = predators[feature.predators[i]];

		//if it's on the island
		if (predator.location.indexOf(islandID) >= 0) {
			//build a series for it
			//console.log(predators[feature.predators[i]]);
			var newSeries = {
				"name": predator.name,
				"data": this.getRealThreatGraph(predator.id, islandID),
				"yAxis": 1,
				"color": this.predatorColours[threatSeriesCount],
				"dashStyle":"LongDash"
			};
			data.series.push(newSeries);

			//build thresholds
			var threshold = {
	            "dashStyle": 'ShortDash',
	            "value": this._getThresholds(featureID,islandID,predator.id),
	            "width": 2,
	            "color": this.predatorColours[threatSeriesCount]
        	};

			data.yAxis[1].plotLines.push(threshold);

			threatSeriesCount++;
		}
	}

	return data;
}

dataShim.prototype.getFullFeatureChart = function(featureID, islandID) {
	data = this.getFullFeatureGraph(featureID, islandID);
	chart = {
        title: {
            text: data.title,
            x: -20 //center
        },
        credits: {
            enabled: false
        },
        xAxis: {
            title: {
                text: 'Year'
            }
        },
        yAxis: data.yAxis,
        tooltip: {
            valueSuffix: '',
            crosshairs: true,
            shared: true
        },
        legend: {

            borderWidth: 0
        },
        series: data.series
    };

    return chart;

}

dataShim.prototype.getIslandActions = function() {
	//get island actions by feature

	var islands = {};

	for (i in this.data.action) {
		action = this.data.action[i];

		//setup threat object if unset
		islands[action.location] = islands[action.location] || {};
		//console.log(islands)

		//setup action array if unset
		islands[action.location][action.target] = islands[action.location][action.target] || {'threatName':this.lookupID(this.THREAT,action.target),'data': new Array(this.years+1).join('0').split('').map(parseFloat)};

		//set action
		islands[action.location][action.target].data[action.year] = 1;

		//console.log(islands[action.location][action.target]);

	}

	return islands;
}
