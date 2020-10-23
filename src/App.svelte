<script>
	import Loader from './Loader.svelte';
	import { searchTranscripts, searchTranscriptsAggSpeakers, searchTranscriptsAggYears } from './api';
	import dayjs from 'dayjs';
	import lodash from 'lodash';
	import Chart from 'chart.js';

	Chart.defaults.global.legend.display = false;

	let searchResults;
	let searchTerm;
	let loading = false;
	let page = 1;
	let totalResults;
	const searchLimit = 20;

	const search = async (changePage) => {
		loading = true;
		if (changePage) {
			page += changePage;
			searchResults.results = await searchTranscripts(searchTerm, searchLimit, searchLimit * (page - 1));
		} else {
			page = 1;
			searchResults = lodash.zipObject(['results', 'speakers', 'years'], await Promise.all([
				searchTranscripts(searchTerm, searchLimit, 0), 
				searchTranscriptsAggSpeakers(searchTerm),
				searchTranscriptsAggYears(searchTerm)
			]));
	
			totalResults = searchResults.years.map(r => r.count).reduce((a, b) => a + b, 0);
		}
		
		searchResults.results = searchResults.results.map(r => {
			r.meeting.time_display = dayjs(r.meeting.time).format('MMM D, YYYY');
			return r;
		});

		loading = false;

		if (changePage) return;

		const intervalId = setInterval(() => {
			const speakerChart = document.getElementById('speakers-chart');
			const yearsChart = document.getElementById('years-chart');
			if (!(speakerChart && yearsChart)) return;

			new Chart(speakerChart, {
				type: 'bar',
				data: {
					labels: searchResults.speakers.map(r => r.category),
					datasets: [{data: searchResults.speakers.map(r => r.count)}]
				}
			});
	
			new Chart(yearsChart, {
				type: 'bar',
				data: {
					labels: searchResults.years.map(r => r.category),
					datasets: [{data: searchResults.years.map(r => r.count)}]
				}
			});

			clearInterval(intervalId);
		});
	}

	const newSearch = async (e) => {
		searchResults = null;
		searchTerm = e.currentTarget[0].value;
		search();
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css">
</svelte:head>

<main>
	{#if loading}
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
			</form>
		</div>
		<div class="row">
			{#if searchResults}
				<div class="row">
					<div class="six columns">
						<label for="speakers-chart">Mentions by Speaker</label>
						<canvas id="speakers-chart" width="400" height="200"></canvas>
					</div>
					<div class="six columns">
						<label for="years-chart">Mentions by Year</label>
						<canvas id="years-chart" width="400" height="200"></canvas>
					</div>
				</div>
				<table>
					<thead>
						<tr>
							<th>Meeting</th>
							<th>Speaker</th>
							<th>Text</th>
						</tr>
					</thead>
					<tbody>
						{#each searchResults.results as r, i}
						<tr>
							<td>
								{r.meeting.committee}<br>
								<small>{r.meeting.time_display}</small>
							</td>
							<td>
								{#if r.speaker_name}
									{r.speaker_name}
								{:else}
									<em>Unknown</em>
								{/if}
							</td>
							<td>
								{r.text}<br>
								<small><a href="{r.meeting.transcript_url}#{r.start_time}" target="_blank">{r.start_time}</a></small>
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
				<div style="text-align: right">
					Results {searchLimit * (page - 1) + 1} to {searchLimit * (page - 1) + searchResults.results.length} of {totalResults}<br>
					{#if page > 1}
						<button on:click={() => search(-1)}>Previous</button>
					{/if}
					{#if searchLimit * (page - 1) + searchResults.results.length < totalResults}
						<button on:click={() => search(1)}>Next</button>
					{/if}
				</div>
			{/if}

			<hr>

			<a href="https://github.com/fordaaronj/sf-data-client" target="_blank">
				<img class="icon" src="svg/github.svg" alt="github">
			</a>

			<a href="mailto:fordaaronj@gmail.com" target="_blank">
				<img class="icon" src="svg/email.svg" alt="email">	
			</a>
			
		</div>
	</div>
</main>

<style>
	h1 {
		margin-top: 50px;
	}
	input {
		width: 100%;
	}
	.icon {
		height: 25px;
		margin-right: 15px;
	}
</style>