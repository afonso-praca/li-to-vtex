var request = require('request');
var _ = require('underscore');
var Product = require('../models/product')

var baseUrl = 'http://api.lojaintegrada.com.br';
var productList = [];
var priceList = [];
var finalList = [];

var requestOptions = {
  headers: {
    'Authorization': 'chave_api ' + process.env.CHAVE_API + ' aplicacao ' + process.env.CHAVE_APLICACAO
  }
};

var getProducts = function(_opt){
  var options = _.extend(requestOptions, _opt);
  request(options, function(err, response, body){
    data = JSON.parse(body);
    productList = productList.concat(data.objects);
    console.log(data.meta);
    if (data.meta.next){
      getProducts({
        url: baseUrl + data.meta.next
      });
    } else {
      _.each(productList, function(item){
        var prod = new Product(item);
        finalList.push(prod);
      });
      console.log("All products done!");
      getPrices({
        url: baseUrl + '/api/v1/produto_preco/'
      });
    }
  });
};

var getPrices = function(_opt){
  var options = _.extend(requestOptions, _opt);
  request(options, function(err, response, body){
    data = JSON.parse(body);
    priceList = priceList.concat(data.objects);
    console.log(data.meta);
    if (data.meta.next){
      getPrices({
        url: baseUrl + data.meta.next
      });
    } else {
      mapPricesToProducts(priceList);
      console.log("All prices done!");
      console.log(finalList);
    }
  });
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
    getProducts({
      url: baseUrl + '/api/v1/produto/'
    });
  }
};

module.exports = migrator;
