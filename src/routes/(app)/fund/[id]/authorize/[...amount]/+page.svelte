<script>
  import Amount from "$comp/Amount.svelte";
  import Success from "$comp/Success.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import { loc } from "$lib/utils";

  let { data, form } = $props();

  let { amount, currency, id, user, rate, rates } = data;
  let locale = $derived(loc(user));
  let submitting = $state(false);

  let submit = () => {
    submitting = true;
    return async ({ update }) => {
      await update();
      submitting = false;
    };
  };
</script>

{#if form?.authorized}
  <div class="container px-4 text-center mx-auto">
    <Success {amount} {rate} {currency} {locale} title="Authorized" />
  </div>

  <a href={`/fund/${id}`} aria-label="Continue">
    <div class="opacity-0 w-screen h-screen fixed top-24 left-0 z-50"></div>
  </a>

  <div class="flex justify-center mt-4">
    {$t("payments.tapAnywhere")}
  </div>
{:else}
  <div class="container px-4 mx-auto max-w-md text-center space-y-6">
    <h1 class="text-2xl font-semibold">{$t("payments.authorize")}</h1>

    <Amount {amount} {rate} {currency} {locale} />

    {#if form?.message}
      <div class="text-error">{form.message}</div>
    {/if}

    <form method="POST" use:enhance={submit} class="space-y-2">
      <button type="submit" class="btn btn-primary" disabled={submitting}>
        {#if submitting}
          <Spinner />
        {:else}
          {$t("payments.authorize")}
        {/if}
      </button>
    </form>

    <a href={`/fund/${id}`} class="btn">{$t("payments.cancel")}</a>
  </div>
{/if}
