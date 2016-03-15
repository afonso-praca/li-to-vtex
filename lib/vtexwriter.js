var soap = require('soap');
var url = 'https://webservice-pilateslovers.vtexcommerce.com.br/Service.svc?wsdl';
var args = {name: 'value'};

var options = {
  'wsdl_headers': {
    'Authorization': 'Basic ' + new Buffer('afonso' + ':' + process.env.VTEX_PWD).toString('base64'),
    'forceSoap12Headers': true
  }
};

var writeProducts = function(products){
  console.log(options);
  soap.createClient(url, options, function(err, client) {
    console.log(client);
    console.log(err);
    //client.MyFunction(args, function(err, result) {
    //  console.log(result);
    //});
  });
};

vtexwriter = {
  startVtexWrite: function(products){
    writeProducts(products);
  }
};

module.exports = vtexwriter;
