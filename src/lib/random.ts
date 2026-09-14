import { animals } from "unique-names-generator";

// Alfabeto sem caracteres ambiguos (0/O, 1/l/I) para o usuario conseguir copiar
// ou transcrever a senha sem errar. Sao 31 simbolos, ~4,95 bits por caractere.
const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";

// crypto.getRandomValues existe no navegador e no runtime do servidor (Bun),
// que e onde o fluxo de resgate de fundos gera conta. Math.random NAO serve
// aqui: e previsivel a partir do estado do gerador.
const randomInt = (max: number) => {
	// Amostragem com rejeicao: descarta a cauda que nao completa um ciclo
	// inteiro de "max", senao o modulo enviesaria para os valores baixos. Usa
	// 32 bits para nao quebrar com dicionarios maiores que 256 entradas - o de
	// animais tem 355, e com um byte so o limite daria zero e o laco nunca
	// terminaria.
	const range = 2 ** 32;
	const limit = Math.floor(range / max) * max;
	const buf = new Uint32Array(1);
	let v: number;
	do {
		crypto.getRandomValues(buf);
		v = buf[0];
	} while (v >= limit);
	return v % max;
};

const randomString = (length: number) =>
	Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join("");

// Nome de usuario nao e segredo - so precisa ser unico e legivel. Mantem a forma
// "animal + numero", sorteando com o gerador criptografico. Sao 5 digitos, e
// nao 2: com 2 seriam 355 x 90 = 31.950 nomes possiveis, e o fluxo de resgate
// de fundos, que cria conta sozinho, comecaria a esbarrar em nome ja usado com
// poucos milhares de contas. Com 5 digitos sao ~32 milhoes.
export const randomName = () => {
	const animal = animals[randomInt(animals.length)];
	return `${animal}${10000 + randomInt(90000)}`;
};

// A senha anterior era uma cor + um numero de 100 a 999: 52 x 900 = 46.800
// combinacoes, cerca de 15,5 bits, sorteadas com Math.random. Para conta de
// carteira custodial isso e adivinhavel. Agora sao 26 caracteres de um alfabeto
// de 31 simbolos, ~128 bits, agrupados de 4 em 4 para dar para ler e copiar.
export const randomPassword = () => {
	const raw = randomString(26);
	return (raw.match(/.{1,4}/g) || []).join("-");
};
