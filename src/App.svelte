<script>
	import Loader from './Loader.svelte';
	import { searchTranscripts } from './api';
	import dayjs from 'dayjs';

	let searchResults;
	let loading = false;
	const contextCharLength = 100;

	const search = async (e) => {
		searchResults = null;
		loading = true;
		searchResults = (await searchTranscripts(e.currentTarget[0].value)).map(r => {
			r.meeting.time_display = dayjs(r.meeting.time).format('MMM D, YYYY	');
			if (r.speakers) r.speakers_display = [...new Set(r.speakers)].join(', ');

			const matchIndex = r.text_context.indexOf(r.text);
			r.text_context_display = r.text_context.substring(
				r.text_context.indexOf(' ', matchIndex - contextCharLength),
				r.text_context.lastIndexOf(' ', matchIndex + r.text.length + contextCharLength)
			);

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
							<th>Speakers</th>
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
								{#if r.speakers_display}
									{r.speakers_display}
								{:else}
									<em>Unknown</em>
								{/if}
							</td>
							<td>
								{r.text_context_display}<br>
								<small><a href="{r.meeting.transcript_url}#{r.time}" target="_blank">{r.time}</a></small>
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			{/if}

			<a href="https://github.com/fordaaronj/sf-data-client" target="_blank"><i class="fab fa-github"></i></a>
			<a href="mailto:fordaaronj@gmail.com" target="_blank"><i class="fas fa-at"></i></a>
			
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
	i {
		font-size: 30px;
		color: black;
		margin-right: 15px;
	}
</style>