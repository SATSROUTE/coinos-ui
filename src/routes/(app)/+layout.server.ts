import { auth, get, isInvalidTokenError, sleep } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export async function load({ cookies, request, url, params }) {
	const { pathname } = url;
	const { id, username } = params;
	const token = cookies.get("token");

	let user;
	if (token) {
		try {
			user = await get("/me", auth(cookies));
		} catch (e) {
			const { message } = e as Error;
			if (message.startsWith("Rate")) {
				await sleep(3000);
				try {
					user = await get("/me", auth(cookies));
				} catch (retryError) {
					if (isInvalidTokenError(retryError) && pathname !== "/logout") {
						redirect(307, "/logout");
					}
					throw retryError;
				}
			} else if (isInvalidTokenError(e) && pathname !== "/logout") {
				redirect(307, "/logout");
			} else {
				throw e;
			}
		}
	}

	let subject;

	if (url.pathname.includes("/invoice") && id) {
		try {
			({ user: subject } = await get(`/invoice/${id}`));
		} catch (e) {
			console.log("unable to fetch invoice", id, e);
		}
	} else if (username) {
		try {
			subject = await get(`/users/${username}`);
		} catch (e) {
			error(500, "Unable to retrieve user account data");
		}
	}


	if (
		user &&
		["/login", "/register"].includes(pathname) &&
		request.method === "GET"
	) {
		redirect(307, `/${user.username}`);
	}

	const theme = cookies.get("theme") || "light";

	// O token NAO vai para os dados da pagina: tudo que chega em load() fica
	// acessivel ao JavaScript, o que anularia o httpOnly do cookie e entregaria a
	// sessao a qualquer XSS. O WebSocket autentica pelo proprio cookie no
	// handshake, e o upload usa cookie na mesma origem.
	return { user, subject, theme };
}
