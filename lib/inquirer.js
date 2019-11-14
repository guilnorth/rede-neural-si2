const inquirer = require("inquirer");

module.exports = {
  askOnEndTraining: () => {
    const questions = [
      {
        name: "saveTraining",
        type: "list",
        message:
          "Deseja salvar este trainamento para continuar depois? (O último salvo será sobrescrito)",
        choices: [
          { name: "Salvar treinamento", value: true },
          {
            name: "Não salvar treinamento",
            value: false
          }
        ]
      }
    ];
    return inquirer.prompt(questions);
  },
  askInitialTraining: () => {
    const questions = [
      {
        name: "iterations",
        type: "input",
        message: "Quantas iterações deseja executar?:",
        validate: function(value) {
          let num = parseInt(value);
          return num && num > 0
            ? true
            : "Por favor, insira um valor maior que 0.";
        }
      },
      {
        name: "newTraining",
        type: "list",
        message:
          "Deseja continuar o treinamento a partir do anterior ou começar um novo treinamento?",
        choices: [
          { name: "Começar um novo treinamento", value: true },
          {
            name: "Continuar a partir do último treinamento salvo",
            value: false
          }
        ]
      }
    ];
    return inquirer.prompt(questions);
  }
};
