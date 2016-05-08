var request = require('request');
var _ = require('underscore');
var Product = require('../models/product');
var Client = require('../models/client');
var Address = require('../models/address');
var Q = require('q');
var async = require('async');
var vtexwriter = require('../lib/vtexwriter');
var vtexClientWriter = require('../lib/vtex-client-writer');

var baseUrl = 'http://api.lojaintegrada.com.br';
var productList = [];
var priceList = [];
var stockList = [];
var finalList = [];
var clientList = [];
var clientListDetailed = [];

var clearListData = function(){
  productList = [];
  priceList = [];
  stockList = [];
  finalList = [];
};

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
  clearListData();
  getDataFromLi('/api/v1/produto/', productList, onProductsDone);
};

var onProductsDone = function(list){
  async.mapLimit(list, 10, function(obj, callback) {
    var options = _.extend(requestOptions, { url: baseUrl + '/api/v1/produto/' + obj.id + '/?descricao_completa=1' });
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(null, JSON.parse(body));
      } else {
        callback(error || response.statusCode);
      }
    });
  }, function(err, results) {
    if (err) {
      throw new Error(err);
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
  getDataFromLi('/api/v1/produto_estoque/', stockList, onLogisticsDone);
};

var onLogisticsDone = function(list){
  mapLogisticsToProducts(list);
  vtexwriter.startVtexWrite(finalList);
};

var mapLogisticsToProducts = function(logisticsList){
  _.each(logisticsList, function(logisticInfo){
    var currentItem = _.find(finalList, function(prod){
      return prod.resource_uri == logisticInfo.produto
    });
    if (currentItem){
      currentItem.quantity = logisticInfo.quantidade;
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

var onClientsDone = function(list){
  async.mapLimit(list, 10, function(obj, callback) {
    var options = _.extend(requestOptions, { url: baseUrl + '/api/v1/cliente/' + obj.id });
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(null, JSON.parse(body));
      } else {
        callback(error || response.statusCode);
      }
    });
  }, function(err, results) {
    if (err) {
      throw new Error(err);
    } else {
      for (var i = 0; i < results.length; i++) {
        var client = new Client(results[i]);
        client.addresses = [];
        _.each(results[i].enderecos, function(add){
          client.addresses.push(new Address(add));
        });
        clientListDetailed.push(client);
      }
      console.log(clientListDetailed.length);
      console.log(clientListDetailed[57]);
      vtexClientWriter.createClients([clientListDetailed[57]])
    }
  });
};

var migrateClients = function(){
  clientList = [];
  getDataFromLi('/api/v1/cliente/', clientList, onClientsDone);
};

migrator = {
  startMigration: function(){
    getProducts();
  },
  migrateClients: function(){
    migrateClients();
  }
};

module.exports = migrator;
