import { PUBLIC_DOMAIN } from "$env/static/public";
import { ipStore } from "$lib/server/ip";
import { setIpGetter } from "$lib/utils";
import { text } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

setIpGetter(() => ipStore.getStore());

// Origens que podem enviar POST. Atras do Caddy o url.origin do SvelteKit vem
// com o esquema interno (http://ui:3000), entao a comparacao e feita contra o
// dominio configurado e nao contra url.origin - por isso o checkOrigin nativo
// fica desligado em svelte.config.js.
const allowedOrigins = new Set(
	[
		PUBLIC_DOMAIN && `https://${PUBLIC_DOMAIN}`,
		PUBLIC_DOMAIN && `http://${PUBLIC_DOMAIN}`,
	].filter(Boolean) as string[],
);

// Tipos de corpo que um <form> HTML consegue enviar entre origens sem preflight.
// Sao esses que precisam de protecao; requisicoes com application/json ja
// dependem de CORS.
const formContentTypes = [
	"application/x-www-form-urlencoded",
	"multipart/form-data",
	"text/plain",
];

const isCrossOriginFormPost = (request: Request): boolean => {
	if (request.method !== "POST") return false;

	const contentType = (request.headers.get("content-type") || "")
		.split(";")[0]
		.trim()
		.toLowerCase();
	if (!formContentTypes.includes(contentType)) return false;

	const origin = request.headers.get("origin");
	// Sem cabecalho Origin nao da para afirmar que a requisicao e da nossa pagina.
	if (!origin) return true;

	return !allowedOrigins.has(origin);
};

export const handle: Handle = async ({ event, resolve }) => {
	if (isCrossOriginFormPost(event.request))
		return text("Cross-site POST form submissions are forbidden", {
			status: 403,
		});

	const ip =
		event.request.headers.get("cf-connecting-ip") ||
		event.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		event.getClientAddress();

	return ipStore.run(ip, () => resolve(event));
};
