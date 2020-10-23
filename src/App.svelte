<script>
	import Loader from './Loader.svelte';
	import { searchTranscripts } from './api';
	import dayjs from 'dayjs';

	let searchResults;
	let loading = false;

	const search = async (e) => {
		searchResults = null;
		loading = true;
		searchResults = (await searchTranscripts(e.currentTarget[0].value)).map(r => {
			r.meeting.time_display = dayjs(r.meeting.time).format('MMM D, YYYY	');
			return r;
		})
		loading = false;
		console.log(searchResults);
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
		
			<form on:submit|preventDefault={search}>
				<input type="text" name="query" required>
			</form>

			{#if searchResults}
				<table>
					<thead>
						<tr>
							<th>Meeting</th>
							<th>Speaker</th>
							<th>Text</th>
						</tr>
					</thead>
					<tbody>
						{#each searchResults as r, i}
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
			{/if}

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