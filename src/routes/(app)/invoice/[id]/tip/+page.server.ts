import getRates from "$lib/rates";
import { auth, fd, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ parent }) {
	const rates = await getRates();
	const { invoice, subject } = await parent();
	if (!invoice.amount) redirect(307, `/invoice/${invoice.id}`);

	// Mesma correcao de send/invoice/[id]: nenhum pagamento sai do load(). A tela
	// de gorjeta confirma o valor e o pagamento segue pela action POST.

	const rate = rates[subject?.currency];
	const invoiceRate = rates[invoice.currency];
	return { rate, invoiceRate };
}

export const actions = {
	default: async ({ cookies, request }) => {
		const form = await fd(request);
		const invoice = {
			tip: form.tip ?? null,
		};

		const { id } = await post(
			`/invoice/${form.id}`,
			{ invoice },
			auth(cookies),
		);

		redirect(307, `/invoice/${id}`);
	},
};
