var soap = require('soap');
var url = 'https://webservice-pilateslovers.vtexcommerce.com.br/Service.svc?wsdl';
var args = {name: 'value'};
var soapClient = null;
var baseProducts = null;
var _ = require('underscore');

var options = {
  'wsdl_headers': {
    'Authorization': 'Basic ' + new Buffer('afonso' + ':' + process.env.VTEX_PWD).toString('base64')
  }
  //"overrideRootElement": {
  //  "namespace": "xmlns:tem",
  //  "xmlnsAttributes": [{
  //    "name": "xmlns:soapenv",
  //    "value": "http://schemas.xmlsoap.org/soap/envelope/"
  //  }, {
  //    "name": "xmlns:tem",
  //    "value": "http://tempuri.org/"
  //  }, {
  //    "name": "xmlns:vtex",
  //    "value": "http://schemas.datacontract.org/2004/07/Vtex.Commerce.WebApps.AdminWcfService.Contracts"
  //  }, {
  //    "name": "xmlns:arr",
  //    "value": "http://schemas.microsoft.com/2003/10/Serialization/Arrays"
  //  }]
  //}
};

var writeProducts = function(products){
  soap.createClient(url, options, function(err, client) {
    baseProducts = JSON.parse(JSON.stringify(products));
    soapClient = client;
    soapClient.setSecurity(new soap.BasicAuthSecurity('afonso', process.env.VTEX_PWD));
    var regularProducts = _.filter(baseProducts, function(prod){
      return prod.type == 'normal';
    });
    createProducts(regularProducts);
  });
};

var createProducts = function(products){
  var product = products.pop();
  var prodToVTEX = {
    'productVO': {
      'Name': product.name,
      'BrandId': product.brand,
      'CategoryId': Number(product.categoryId),
      'DepartmentId': Number(product.categoryId),
      'Description': product.description,
      'Id': product.id,
      'IsActive': product.active,
      'IsVisible': true,
      //'vtex:ListStoreId': ["1"],
      'ShowWithoutStock': true
    }
  };
  soapClient.ProductInsertUpdate(prodToVTEX, function(err, result) {
    console.log(err);
    console.log(result);
  });
};

vtexwriter = {
  startVtexWrite: function(products){
    writeProducts(products);
  }
};

module.exports = vtexwriter;
