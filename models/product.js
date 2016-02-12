var Product = function(data){
  var product;
  data = data || {};
  product = {
    name: data.nome || ""
  };
  return product
};

module.exports = Product;
