<script>
	import { loading } from './stores';
	import Loader from './components/Loader.svelte';
	import Home from './components/Home.svelte';
	import Search from './components/Search.svelte';

	import Stats from './components/Stats.svelte';
	import Chart from 'chart.js';
	import Router from 'svelte-spa-router';
	import { location } from 'svelte-spa-router';

	Chart.defaults.global.legend.display = false;

	const routes = {
		'/': Home,
		'/search/:q?': Search,
		'/stats': Stats
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

		<a href="/#/"><button class:button-primary={$location == '/'}>Home</button></a>
		<a href="/#/stats"><button class:button-primary={$location == '/stats'}>Stats</button></a>
		<a href="/#/search"><button class:button-primary={$location == '/search'}>Search</button></a>

		<Router {routes}/>
	
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
	.icon {
		height: 25px;
		margin-right: 15px;
	}
</style>