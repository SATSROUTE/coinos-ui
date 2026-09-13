import getRates from "$lib/rates";
import { auth, fd, get, post, sats } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";

// Resolve o valor a autorizar a partir dos parametros da URL. Nao escreve nada:
// e usado tanto pelo load() (que so exibe a confirmacao) quanto pela action.
const resolveAmount = async (params, user) => {
	let [amount, currency] = params.amount.split("/");
	let fiat;

	if (!currency) currency = user?.currency;
	if (currency) currency = currency.toUpperCase();

	const rates = await getRates();
	const rate = rates[currency || "USD"];
	if (currency && !rate) error(500, "Invalid currency symbol");

	if (!amount) {
		const balance = await get(`/fund/${params.id}`);
		amount = balance.amount;
	} else if (currency) {
		fiat = amount;
		amount = Math.round((fiat * sats) / rate);
	}

	return { amount, currency, fiat, rate, rates };
};

// Antes o load() chamava /authorize direto, ou seja, autorizava fundos num GET:
// bastava induzir a vitima a abrir o link. Agora o load so monta a tela de
// confirmacao e quem autoriza e a action POST, protegida pela verificacao de
// origem em hooks.server.ts.
export async function load({ params, parent }) {
	const { user } = await parent();
	const { id } = params;
	const { amount, currency, rate, rates } = await resolveAmount(params, user);

	if (!amount) redirect(307, `/fund/${id}`);

	return { amount, currency, id, rate, rates };
}

export const actions = {
	default: async ({ cookies, params, parent, request }) => {
		const { user } = await parent();
		const { id } = params;
		await fd(request);

		const { amount, currency, fiat } = await resolveAmount(params, user);
		if (!amount) redirect(307, `/fund/${id}`);

		try {
			await post("/authorize", { amount, currency, fiat, id }, auth(cookies));
		} catch (e) {
			const { message } = e as Error;
			return fail(400, { message });
		}

		return { authorized: true };
	},
};
