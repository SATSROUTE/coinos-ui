import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, parent, url }) {
	const { user } = await parent();
	if (!user) redirect(307, `/register?redirect=${url.pathname}`);
	const tab = url.pathname.split("/").filter(Boolean).pop();
	if (tab === "settings") redirect(307, `${url.pathname}/account`);
	const subscriptions = await get("/subscriptions", auth(cookies));
	// Nao devolver cookies: dados de load() ficam acessiveis ao JavaScript da
	// pagina, entao isso entregava a sessao inteira ao navegador. Ninguem
	// consumia o valor.
	return { subscriptions, tab };
}
