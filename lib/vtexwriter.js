var soap = require('soap');
var url = 'https://webservice-pilateslovers.vtexcommerce.com.br/Service.svc?wsdl';
var soapClient = null;
var baseProducts = null;
var _ = require('underscore');

var regularProducts = [];

var slugify = function(text){
  return text.toString().toLowerCase()
    .replace(/ç/g, "c")             // Replaces ç with c
    .replace(/á/g, "a")             // Replaces ç with c
    .replace(/ã/g, "a")             // Replaces ç with c
    .replace(/é/g, "e")             // Replaces ç with c
    .replace(/í/g, "i")             // Replaces ç with c
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

var options = {
  'wsdl_headers': {
    'Authorization': 'Basic ' + new Buffer(process.env.VTEX_USER + ':' + process.env.VTEX_PWD).toString('base64')
  }
};

var writeProducts = function(products){
  console.log('vtex writer started');
  soap.createClient(url, options, function(err, client) {
    baseProducts = JSON.parse(JSON.stringify(products));
    soapClient = client;
    soapClient.setSecurity(new soap.BasicAuthSecurity(process.env.VTEX_USER, process.env.VTEX_PWD));
    regularProducts = _.filter(baseProducts, function(prod){
      return (prod.type == 'normal') && prod.categoryId;
    });
    createProducts();
  });
};

var createProducts = function(){
  if (regularProducts.length){
    var product = regularProducts.splice(0, 1)[0];
    createProduct(product);
  } else {
    return true;
  }
};

var createProduct = function(product){
  var prodToVTEX = {
    'tem:productVO': {
      'vtex:BrandId': product.brand,
      'vtex:CategoryId': Number(product.categoryId),
      'vtex:DepartmentId': Number(product.categoryId),
      'vtex:Description': product.description,
      'vtex:Id': product.id,
      'vtex:IsActive': product.active,
      'vtex:IsVisible': true,
      'vtex:KeyWords': '',
      'vtex:ListStoreId': [1],
      'vtex:LinkId': slugify(product.name),
      'vtex:MetaTagDescription': '',
      'vtex:Name': product.name,
      'vtex:ShowWithoutStock': true,
      'vtex:Title': product.name
    }
  };
  soapClient.ProductInsertUpdate(prodToVTEX, function(err, result) {
    if (err){
      throw new Error(err);
    } else {
      console.log("Product created -> " + result.ProductInsertUpdateResult.Id)
      createSku(product, result.ProductInsertUpdateResult.Id);
    }
  });
};

var createSku = function(data, productId){
  var skuToVTEX = {
    'tem:stockKeepingUnitVO': {
      'vtex:CubicWeight': data.weight,
      'vtex:Height': data.height,
      'vtex:Id': data.id,
      'vtex:IsActive': data.active,
      'vtex:IsVisible': true,
      'vtex:IsKit': false,
      'vtex:Length': data.depth,
      'vtex:ModalId': 1,
      'vtex:Name': data.name,
      'vtex:ProductId': productId,
      'vtex:RefId': data.skuId,
      'vtex:UnitMultiplier': 1,
      'vtex:WeightKg': data.weight,
      'vtex:Width': data.width
    }
  };
  soapClient.StockKeepingUnitInsertUpdate(skuToVTEX, function(err, result){
    if (err){
      throw new Error("error on create sku " + err);
    } else {
      console.log("sku created -> " + result.StockKeepingUnitInsertUpdateResult.Id);
      createSkuImage(data.images, result.StockKeepingUnitInsertUpdateResult.Id);
      createProducts();
    }
  });
};

var createSkuImage = function(images, skuId){
  if (images.length) {
    var image = images.splice(0, 1)[0];
    var imageToVTEX = {
      'tem:urlImage': image.url,
      'tem:stockKeepingUnitId': skuId
    };
    soapClient.ImageServiceInsertUpdate(imageToVTEX, function (err) {
      if (err){
        throw new Error("error on create sku image " + err);
      } else {
        if (images.length){
          createSkuImage(images, skuId);
        } else {
          return true;
        }
      }
    });
  } else {
    return true;
  }
};

vtexwriter = {
  startVtexWrite: function(products){
    writeProducts(products);
  }
};

module.exports = vtexwriter;
