var request = require('request');
var _ = require('underscore');
var Product = require('../models/product');
var Q = require('q');

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
    if (data.meta.next){
      getDataFromLi(data.meta.next, list, callback);
    } else {
      console.log('fim data');
      callback(list);
    }
  });
  return defer.promise;
};

var getProducts = function(){
  getDataFromLi('/api/v1/produto/', productList, onProductsDone);
};

var onProductsDone = function(list){
  console.log('then');
  _.each(list, function(item){
    var prod = new Product(item);
    finalList.push(prod);
  });
  getDataFromLi('/api/v1/produto_preco/', priceList, onPricesDone);
};

var onPricesDone = function(list){
  mapPricesToProducts(list);
  console.log(finalList);
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
