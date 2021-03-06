var Q = require('q');
var _ = require('underscore');
var request = require('request');
var async = require('async');


var vtexPricingWriter = {
  setPrices: function(products){
    var defer = Q.defer();
    Q.all([
      savePrices(products),
      saveOldPrices(products)
    ]).then(function(){
      defer.resolve();
    });
    return defer.promise;
  }
};

var savePrices = function(products){
  var defer = Q.defer();
  var pricesBody = _.chain(products).map(function(product){
    return {
      "sellerId": "1",
      "itemId": String(product.id),
      "costPrice": Number(product.costPrice),
      "basePrice": Number(product.price),
      "listPrice": Number(product.listPrice)
    }
  }).filter(function(price){
    return price.basePrice && price.costPrice;
  }).value();
  var options = {
    url: "https://api.vtex.com/" + process.env.VTEX_ACCOUNT_NAME + "/pricing/prices/",
    method: "POST",
    headers: {
      'Accept': 'application/vnd.vtex.pricing.v3+json',
      'Content-Type': 'application/json',
      'x-vtex-workspace': 'master',
      'X-VTEX-API-AppKey': process.env.VTEX_APP_KEY,
      'X-VTEX-API-AppToken': process.env.VTEX_APP_TOKEN
    },
    json: pricesBody
  };
  request(options, function(err, response){
    defer.resolve(response);
  });
  return defer.promise;
};

var saveOldPrices = function(products){
  var defer = Q.defer();
  var pricesBody = _.chain(products).filter(function(product){
    return (product.type == 'normal' || product.type == 'atributo_opcao')
      && product.price;
  }).map(function(product){
    return {
      "itemId": product.id,
      "salesChannel": 1,
      "price": Number(product.price),
      "listPrice": Number(product.price),
      "validFrom": "2013-12-05T17:00:03.103",
      "validTo": "2113-12-05T17:00:03.103"
    }
  }).value();

  async.mapLimit(pricesBody, 1, function(item, callback) {
    var options = {
      url: "https://" + process.env.VTEX_ACCOUNT_NAME + ".vtexcommercestable.com.br/api/pricing/pvt/price-sheet",
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': process.env.VTEX_APP_KEY,
        'X-VTEX-API-AppToken': process.env.VTEX_APP_TOKEN
      },
      json: [item]
    };
    request(options, function(err, response){
      callback(null, response);
    });
  }, function(err) {
    defer.resolve(true);
  });
  return defer.promise;
};

module.exports = vtexPricingWriter;
