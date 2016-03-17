var soap = require('soap');
var url = 'https://webservice-pilateslovers.vtexcommerce.com.br/Service.svc?wsdl';
var soapClient = null;
var baseProducts = null;
var _ = require('underscore');

var options = {
  'wsdl_headers': {
    'Authorization': 'Basic ' + new Buffer(process.env.VTEX_USER + ':' + process.env.VTEX_PWD).toString('base64')
  }
};

var writeProducts = function(products){
  soap.createClient(url, options, function(err, client) {
    baseProducts = JSON.parse(JSON.stringify(products));
    soapClient = client;
    soapClient.setSecurity(new soap.BasicAuthSecurity(process.env.VTEX_USER, process.env.VTEX_PWD));
    var regularProducts = _.filter(baseProducts, function(prod){
      return prod.type == 'normal';
    });
    createProducts(regularProducts);
  });
};

var createProducts = function(products){
  var product = products[0];
  var prodToVTEX = {
    'tem:productVO': {
      'vtex:BrandId': product.brand,
      'vtex:CategoryId': Number(product.categoryId),
      'vtex:Description': product.description,
      'vtex:Id': product.id,
      'vtex:IsActive': product.active,
      'vtex:IsVisible': true,
      'vtex:ListStoreId': [
        {
          'arr:int': 1
        }
      ],
      'vtex:MetaTagDescription': '',
      'vtex:Name': product.name,
      'vtex:ShowWithoutStock': true,
      'vtex:Title': product.name
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
