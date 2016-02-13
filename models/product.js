var Product = function(data){
  var product;
  data = data || {};
  product = {
    id: data.id,
    skuId: data.sku || "",
    name: data.nome || "",
    slug: data.apelido || "",
    description: data.descricao_completa || "",
    resource_uri: data.resource_uri,
    brand: "",
    categories: [],
    images: [],
    weight: "",
    height: "",
    width: "",
    depth: "",
    listPrice: "",
    price: "",
    costPrice: ""
  };
  return product
};

module.exports = Product;
