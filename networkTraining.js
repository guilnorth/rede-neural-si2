//Biblioteca com dados das imagens
const mnist = require("mnist");
//Biblioteca para a rede neural
const synaptic = require("synaptic");
//Ler e escrever arquivos
const fs = require("fs");
/** Arquivo com dados de treinamento realizados anteriormente **/
const dataTraining = require("./dataTraining.json");

/** Lib para entradas do usuário **/
const inquirer = require("./lib/inquirer");

/**
 * Conjunto de treinamento de 700 imagens e
 * Conjunto de teste com 20 elementos
 */
const set = mnist.set(700, 20);
const trainingSet = set.training;
const testSet = set.test;

/**
 * Configurações Synaptic
 */
const Layer = synaptic.Layer;
const Network = synaptic.Network;
const Trainer = synaptic.Trainer;

/**
 * Configurando as camadas da rede
 */
const inputLayer = new Layer(784);
const hiddenLayer = new Layer(100);
const outputLayer = new Layer(10);
inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

//const configEnviroment = () => {};
const runTraining = async ({ newTraining, iterations }) => {
  const myNetwork = newTraining
    ? new Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
      })
    : Network.fromJSON(dataTraining);

  console.log(`
  O       o O       o O       o
  | O   o | | O   o | | O   o |
  | | O | | | | O | | | | O | |
  | o   O | | o   O | | o   O |
  o       O o       O o       O
  `);
  console.log("Iniciando Treinamento...");
  /**
   * Parâmetros de treinamento
   * rate => taxa de aprendizado
   * iterations => número de iterações
   * error => valor de erro mínimo a ser alcançado
   * shuffle => ordenar conjunto de treinamento aleatoriamente
   * Demais configurações em https://github.com/cazala/synaptic/wiki/Trainer#options
   *
   */
  const trainer = new Trainer(myNetwork);
  trainer.train(trainingSet, {
    rate: 0.1,
    iterations: iterations,
    error: 0.1,
    shuffle: true,
    log: 1,
    cost: Trainer.cost.CROSS_ENTROPY
  });

  /**
   * Utilizando a função activate da rede para verificar
   * a classificação da rede neural
   */
  console.log("------------------------------------");

  console.log("myNetwork.activate(testSet[0].input)");

  console.log("------------------------------------");
  /**
   * Utilizando o conjunto de teste para verificar
   * se a classificação foi bem sucedida
   */
  var output = myNetwork.activate(testSet[0].input);
  const exported = myNetwork.toJSON();

  console.log(output);

  console.log("------------------------------------");

  var maximum = output.reduce(function(p, c) {
    return p > c ? p : c;
  });
  var nominators = output.map(function(e) {
    return Math.exp(e - maximum);
  });
  var denominator = nominators.reduce(function(p, c) {
    return p + c;
  });
  /**
   * A função softmax transforma as saídas para cada classe
   * para valores entre 0 e 1 e também divide pela soma das saídas.
   * Isso essencialmente dá a probabilidade de a entrada estar em uma
   * determinada classe.
   */
  var softmax = nominators.map(function(e) {
    return e / denominator;
  });

  var maxIndex = 0;
  softmax.reduce(function(p, c, i) {
    if (p < c) {
      maxIndex = i;
      return c;
    } else return p;
  });

  console.log("maxIndex :: ", maxIndex);
  console.log("Softmax (Rede Neural)[Classes 0 - 9]");

  console.log("------------------------------------");

  var result = [];

  for (var i = 0; i < output.length; i++) {
    if (i == maxIndex) result.push(1);
    else result.push(0);
  }
  // Valor 1 => Representa o valor que a rede pensa ser o real (número no indíce corresponde de 0 a 9)
  console.log(result);

  console.log("------------------------------------");

  console.log("Saídas do testSet[0].output [Valor real 0 - 9]");

  console.log("------------------------------------");

  // Valor 1 => Representa o valor real (número no indíce corresponde de 0 a 9)
  console.log(testSet[0].output);

  console.log("------------------------------------");

  var nnDigit = 0;

  for (let i = 0; i <= 9; i++) {
    if (result[i] == 1) {
      nnDigit = i;
      break;
    }
  }

  var testDigit = 0;

  for (let i = 0; i <= 9; i++) {
    if (testSet[0].output[i] == 1) {
      testDigit = i;
      break;
    }
  }

  console.log("Resultados:");

  console.log("------------------------------------");

  console.log(
    `A rede neural disse que o número escrito é ${nnDigit}.\nNa realidade o número escrito é ${testDigit}`
  );

  console.log("------------------------------------");

  /**
   * Atualizando arquivo contendo as informações da rede neural
   */
  const saveTrainingResponse = await inquirer.askOnEndTraining();
  if (saveTrainingResponse.saveTraining)
    fs.writeFile("dataTraining.json", JSON.stringify(exported), err => {
      if (err) throw err;
      console.log("Arquivo salvo com sucesso!");
    });
};

/**
 * Run App
 */
(async () => {
  const dataInit = await inquirer.askInitialTraining();
  await runTraining(dataInit);
})();
