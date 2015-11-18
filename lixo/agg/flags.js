//Ficheiro de configuração automatica
// Wait until connection is established

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/pfc';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db,callback) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

	configuracaoAuto(db, function() {
         db.close();
	});
	
}); 
  
  var configuracaoAuto =function(db) {
	
  var collection = db.collection('logs');
  var collection2 = db.collection('flags');

		collection.aggregate([{  

				$group :{
						"_id": {first: '$vid'},

                        "vid":{$first : "$vid"},

						"criado": { $min: "$tmx" },

						"ecoaux" : {$first : "$exd.eco"},

						"tmpaux":{$first : "$exd.tmp"},

						"tmpDados":{$first : "$exd.tmp"},

						"cas": {$first:"$cas"}
				}
		}

            ,{

                $project: {
					"vid":1,
                    "criado": 1,
					"ecoFlag" :{

									"$cond": { 

										"if": { "$eq": [ "$ecoaux", null ] }, 

										"then": 2,

										"else": 1

									}

					},
					"tmpFlag" :{

									"$cond": { 

										"if": { "$eq": [ "$tmpaux", null ] }, 

										"then": 2,

										"else": 1

									}

					},
					"tmpDados":1,
					"cas":1
				}

                

            },
			{
				$sort : {
							"_id" : 1, 
							
							"tmx" : 1
				}
			}
           // ,{ $out: "flags" }
        ]).forEach( function(myDoc) {  	
				collection2.update({'vid': myDoc.vid},
									{$set:{
											'criado': myDoc.criado,
											'cas': myDoc.cas,
											'tmpFlag': myDoc.tmpFlag,
											'tmpDados': myDoc.tmpDados,
											'ecoFlag': myDoc.ecoFlag,
											'criado': myDoc.criado						
											}
									},
   { upsert: true});
			
  } );	
    collection2.find('vid', function(err, docs) {
	console.log("flags: "+docs.length);
	
	});
  };
