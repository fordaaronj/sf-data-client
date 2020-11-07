<script>
	import { onMount } from 'svelte';
	import { loading } from './stores';
	import Loader from './components/Loader.svelte';
	import Transcripts from './components/Transcripts.svelte';
	import Legislation from './components/Legislation.svelte';
	import Stats from './components/Stats.svelte';
	import Chart from 'chart.js';

	Chart.defaults.global.legend.display = false;

	let searchTerm;
	let pageTab = 'stats';
	let searchTab = 'transcripts';

	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('q')) {
			searchTerm = searchParams.get('q');
			const searchBar = document.querySelector('input[name="query"]')
			if (searchBar) searchBar.value = searchTerm;
			else window.history.pushState({}, document.title, "/");
		}
	})

	async function newSearch (e) {
		searchTerm = e.currentTarget[0].value
		const searchParams = new URLSearchParams();
		searchParams.set('q', searchTerm);
		history.pushState(null, '', window.location.pathname + '?' + searchParams.toString());
	}

</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css">
</svelte:head>

<main>
	{#if $loading}
		<Loader/>
	{/if}

	<div class="container">
		<h1>San Francisco Data</h1>

		<button class:button-primary={pageTab == 'stats'} on:click={e => pageTab = 'stats'}>Stats</button>
		<button class:button-primary={pageTab == 'search'} on:click={e => pageTab = 'search'}>Search</button>

		{#if pageTab == 'stats'}
			<Stats/>
		{:else if pageTab == 'search'}
			<form on:submit|preventDefault={newSearch}>
				<input type="text" name="query" required>
				<button>Submit</button>
			</form>

			{#if searchTerm}
				<button class:button-primary={searchTab == 'transcripts'} on:click={e => searchTab = 'transcripts'}>Transcripts</button>
				<button class:button-primary={searchTab == 'legislation'} on:click={e => searchTab = 'legislation'}>Legislation</button>
				{#if searchTab == 'transcripts'}
					<Transcripts query={searchTerm}/>
				{:else if searchTab == 'legislation'}
					<Legislation query={searchTerm}/>
				{/if}
			{/if}
		{/if}
	
		<hr>
	
		<a href="https://github.com/fordaaronj/sf-data-client" target="_blank">
			<img class="icon" src="svg/github.svg" alt="github">
		</a>
	
		<a href="mailto:fordaaronj@gmail.com" target="_blank">
			<img class="icon" src="svg/email.svg" alt="email">	
		</a>
	</div>

</main>

<style>
	h1 {
		margin-top: 50px;
	}
	form {
		display: flex;
		flex-direction: row;
	}
	form input {
		flex-grow: 2;
	}
	.icon {
		height: 25px;
		margin-right: 15px;
	}
</style>