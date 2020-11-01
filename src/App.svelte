<script>
	import { onMount } from 'svelte';
	import { loading } from './stores';
	import Loader from './components/Loader.svelte';
	import Transcripts from './components/Transcripts.svelte';
	import Legislation from './components/Legislation.svelte';

	let searchTerm;
	let tab = 'legislation'

	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('q')) {
			searchTerm = searchParams.get('q');
			document.querySelector('input[name="query"]').value = searchTerm
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
		<div class="row">
			<h1>San Francisco Transcript Search</h1>
			<small>
				Search all transcripts from the <a href="https://sfgov.legistar.com/Calendar.aspx">San Francisco Board of Supervisors and Committee Meetings</a>
			</small>
		
			<form on:submit|preventDefault={newSearch}>
				<input type="text" name="query" required>
				<button>Submit</button>
			</form>
		</div>

		{#if searchTerm}
		<button class:button-primary={tab == 'transcripts'} on:click={e => tab = 'transcripts'}>Transcripts</button>
		<button class:button-primary={tab == 'legislation'} on:click={e => tab = 'legislation'}>Legislation</button>
			{#if tab == 'transcripts'}
				<Transcripts query={searchTerm}/>
			{:else if tab == 'legislation'}
				<Legislation query={searchTerm}/>
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