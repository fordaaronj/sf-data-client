<script>
    import { loading } from '../stores';   
	import { searchTranscripts, searchTranscriptsAggSpeakers, searchTranscriptsAggYears } from '../api';
	import dayjs from 'dayjs';
	import lodash from 'lodash';
	import Chart from 'chart.js';

	Chart.defaults.global.legend.display = false;

    export let query;

    let searchResults;
    
    let page = 1;
	let totalResults;
	const searchLimit = 20;

    // $ makes this reactive - re-runs the search whenever query changes
    $: search(query);

    async function search (query, changePage) {
		loading.set(true);
		if (changePage) {
			page += changePage;
			searchResults.transcripts = await searchTranscripts(query, searchLimit, searchLimit * (page - 1));
		} else {
            searchResults = null;
			page = 1;
			searchResults = lodash.zipObject(['transcripts', 'speakers', 'years'], await Promise.all([
				searchTranscripts(query, searchLimit, 0), 
				searchTranscriptsAggSpeakers(query),
				searchTranscriptsAggYears(query)
			]));
	
			totalResults = searchResults.years.map(r => r.count).reduce((a, b) => a + b, 0);
		}
		
		searchResults.transcripts = searchResults.transcripts.map(r => {
			r.meeting.time_display = dayjs(r.meeting.time).format('MMM D, YYYY');
			return r;
		});

		loading.set(false);

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

</script>

<div class="row">
    {#if searchResults && searchResults.transcripts}
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
                {#each searchResults.transcripts as r, i}
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
            Results {searchLimit * (page - 1) + 1} to {searchLimit * (page - 1) + searchResults.transcripts.length} of {totalResults}<br>
            {#if page > 1}
                <button on:click={() => search(query, -1)}>Previous</button>
            {/if}
            {#if searchLimit * (page - 1) + searchResults.transcripts.length < totalResults}
                <button on:click={() => search(query, 1)}>Next</button>
            {/if}
        </div>
    {/if}
</div>
