<script>
    import { onMount } from 'svelte';
    import { push } from 'svelte-spa-router'

    import Transcripts from './Transcripts.svelte';
    import Legislation from './Legislation.svelte';

    export let params = {}

    const examples = [
        {'q': '3333 California', tab: 'legislation'},
        {'q': 'Gentrification', tab: 'transcripts'}
    ]
    
	let searchTab = 'legislation';

	onMount(() => {
		if (params.q) {
			const searchBar = document.querySelector('input[name="query"]')
			if (searchBar) searchBar.value = params.q;
		}
	})

	async function newSearch (e) {
		push('/search/' + e.currentTarget[0].value);
    }

    async function runExample (example) {
        document.querySelector('input[name="query"]').value = example.q;
        document.querySelector('#submit').click()
        params.q = example.q;
        searchTab = example.tab;
    }
    
</script>

<form on:submit|preventDefault={newSearch}>
    <input type="text" name="query" required>
    <button id="submit">Submit</button>
    
    <br>
</form>
<div class="row">
    <em>
        Examples: 
        {#each examples as e, i}
            {#if i > 0}<span class="separator">//</span>{/if}<a class="example" on:click={() => runExample(e)}>{e.q}</a>
        {/each}
    </em>
</div>

{#if params.q}
<div class="row category-tabs">
    <button class:button-primary={searchTab == 'legislation'} on:click={e => searchTab = 'legislation'}>Legislation</button>
    <button class:button-primary={searchTab == 'transcripts'} on:click={e => searchTab = 'transcripts'}>Transcripts</button>
    {#if searchTab == 'transcripts'}
        <Transcripts query={params.q}/>
    {:else if searchTab == 'legislation'}
        <Legislation query={params.q}/>
    {/if}
</div>
{/if}

<style>
    form {
		display: flex;
		flex-direction: row;
        margin-bottom: 0;
	}
	form input {
		flex-grow: 2;
	}

    a.example {
        cursor: pointer;
    }

    .category-tabs {
        margin-top: 20px;
    }

    .separator {
        margin-left: 5px;
        margin-right: 5px;
    }
</style>