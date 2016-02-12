var request = require('request');
var _ = require('underscore');

var baseUrl = 'http://api.lojaintegrada.com.br';
var productList = [];

var requestOptions = {
  headers: {
    'Authorization': 'chave_api ' +
    process.env.CHAVE_API +
    ' aplicacao ' +
    process.env.CHAVE_APPLICATION
  }
};

var getOrders = function(_opt){
  var options = _.extend(requestOptions, _opt);
  request(options, function(err, response, body){
    data = JSON.parse(body);
    productList = productList.concat(data.objects);
    console.log(data.meta);
    if (data.meta.next){
      getOrders({
        url: baseUrl + data.meta.next
      });
    } else {
      console.log("All products done!");
      console.log(productList);
    }
  });
};

migrator = {
  startMigration: function(){
    getOrders({
      url: baseUrl + '/api/v1/produto/'
    })
  }
};

module.exports = migrator;
