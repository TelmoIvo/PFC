var flags = require('./flags');
var async = require('async');

//Configuracao automatica
	flags; 
//estrutura arvore
function arvore(){
async.parallel([

// Ramo Causa
	function(){
			console.log("funcao 1");
    },
//Ramo Temperatura
    function(){
			console.log("funcao 2");
    },
//Ramo Eco
	 function(){
			console.log("funcao 3");
    }
])  

};