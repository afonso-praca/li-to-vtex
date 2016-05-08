var getFirstName = function(name){
  return name.split(" ")[0];
};

var getLastName = function(name){
  var lastName = name.split(" ");
  lastName.splice(0,1);
  return lastName.join(" ");
};

var Client = function(data){
  var client;
  data = data || {};
  client = {
    //id: data.id,
    firstName: getFirstName(data.nome),
    lastName: getLastName(data.nome),
    gender: data.sexo,
    birthDate: data.data_nascimento,
    businessPhone: data.telefone_comercial,
    corporateDocument: data.cnpj,
    corporateName: data.razao_social,
    document: data.cpf,
    documentType: "cpf",
    email: data.email,
    homePhone: data.telefone_principal,
    isCorporate: data.tipo != "PF",
    isNewsletterOptIn: data.aceita_newsletter,
    phone: data.telefone_celular,
    stateRegistration: data.ie,
    tradeName: data.razao_social
    //userId: data.id
  };
  return client;
};

module.exports = Client;