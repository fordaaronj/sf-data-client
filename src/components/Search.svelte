<script>
    import { onMount } from 'svelte';
    import { push } from 'svelte-spa-router'

    import Transcripts from './Transcripts.svelte';
    import Legislation from './Legislation.svelte';

    export let params = {}
    
	let searchTab = 'transcripts';

	onMount(() => {
		if (params.q) {
			const searchBar = document.querySelector('input[name="query"]')
			if (searchBar) searchBar.value = params.q;
		}
	})

	async function newSearch (e) {
		push('/search/' + e.currentTarget[0].value);
    }
    
</script>

<form on:submit|preventDefault={newSearch}>
    <input type="text" name="query" required>
    <button>Submit</button>
</form>

{#if params.q}
    <button class:button-primary={searchTab == 'transcripts'} on:click={e => searchTab = 'transcripts'}>Transcripts</button>
    <button class:button-primary={searchTab == 'legislation'} on:click={e => searchTab = 'legislation'}>Legislation</button>
    {#if searchTab == 'transcripts'}
        <Transcripts query={params.q}/>
    {:else if searchTab == 'legislation'}
        <Legislation query={params.q}/>
    {/if}
{/if}

<style>
    form {
		display: flex;
		flex-direction: row;
	}
	form input {
		flex-grow: 2;
	}
</style>