var getCountry = function(country){
  return country == "Brasil" ? "BRA" : country;
};

var Address = function(data){
  var address;
  data = data || {};
  address = {
    addressType: "residential",
    city: data.cidade,
    complement: data.complemento,
    country: getCountry(data.pais),
    neighborhood: data.bairro,
    number: data.numero,
    postalCode: data.cep,
    receiverName: data.nome,
    reference: data.referencia,
    state: data.estado,
    street: data.endereco,
    userId: data.userId
  };
  return address;
};

module.exports = Address;