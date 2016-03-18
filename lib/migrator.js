var request = require('request');
var _ = require('underscore');
var Product = require('../models/product');
var Q = require('q');
var async = require('async');
var vtexwriter = require('../lib/vtexwriter');

var baseUrl = 'http://api.lojaintegrada.com.br';
var productList = [];
var priceList = [];
var finalList = [];

var requestOptions = {
  headers: {
    'Authorization': 'chave_api ' + process.env.CHAVE_API + ' aplicacao ' + process.env.CHAVE_APLICACAO
  }
};

var getDataFromLi = function(apiEndpoint, list, callback){
  var defer = Q.defer();
  var options = _.extend(requestOptions, { url: baseUrl + apiEndpoint });
  request(options, function(err, response, body){
    data = JSON.parse(body);
    list = list.concat(data.objects);
    return (data.meta.next) ? getDataFromLi(data.meta.next, list, callback) : callback(list);
  });
  return defer.promise;
};

var getProducts = function(){
  getDataFromLi('/api/v1/produto/', productList, onProductsDone);
};

var onProductsDone = function(list){
  async.map(list, function(obj, callback) {
    // iterator function
    var options = _.extend(requestOptions, { url: baseUrl + '/api/v1/produto/' + obj.id + '/?descricao_completa=1' });
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(null, JSON.parse(body));
      } else {
        callback(error || response.statusCode);
      }
    });
  }, function(err, results) {
    // all requests have been made
    if (err) {
      console.log(err);
      throw new Error(err);
      // handle your error
    } else {
      for (var i = 0; i < results.length; i++) {
        var prod = new Product(results[i]);
        finalList.push(prod);
      }
      getDataFromLi('/api/v1/produto_preco/', priceList, onPricesDone);
    }
  });
};

var onPricesDone = function(list){
  mapPricesToProducts(list);
  vtexwriter.startVtexWrite(finalList);
};

var mapPricesToProducts = function(priceList){
  _.each(priceList, function(price){
    var currentItem = _.find(finalList, function(prod){
      return prod.resource_uri == price.produto
    });
    if (currentItem){
      currentItem.price = price.promocional;
      currentItem.listPrice = price.cheio;
      currentItem.costPrice = price.custo;
    }
  });
};

migrator = {
  startMigration: function(){
    getProducts();
  }
};

module.exports = migrator;
