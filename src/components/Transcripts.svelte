<script>
	import { api } from '../api';
	import dayjs from 'dayjs';
	import lodash from 'lodash';
	import Chart from './Chart.svelte'

    export let query;

    let searchResults;
    
    let page = 1;
	let totalResults;
    const searchLimit = 20;
    
    let speakerChartConfig = {}
    let mentionsChartConfig = {}

    // $ makes this reactive - re-runs the search whenever query changes
    $: search(query);

    async function search (query, changePage) {
		if (changePage) {
            page += changePage;
            searchResults.transcripts = (await api('/transcripts', {q: query, limit: searchLimit, offset: searchLimit * (page - 1)}));
		} else {
            searchResults = null;
            page = 1;
			searchResults = lodash.zipObject(['transcripts', 'speakers', 'years'], await Promise.all([
                api('/transcripts', {q: query, limit: searchLimit, offset: 0}),
                api('/transcripts/agg/speakers', {q: query}),
                api('/transcripts/agg/years', {q: query})
            ]));
	
			totalResults = searchResults.years.rows.map(r => r.num).reduce((a, b) => a + b, 0);
        }
		
		searchResults.transcripts.rows = searchResults.transcripts.rows.map(r => {
			r.meeting.time_display = dayjs(r.meeting.time).format('MMM D, YYYY');
			return r;
        });
        
        if (changePage) return;
        
        speakerChartConfig = {
            id: 'mentions-speakers',
            title: 'Mentions by Speaker',
            xLabels: searchResults.speakers.rows.map(r => r.speaker_name),
            datasets: [{data: searchResults.speakers.rows.map(r => r.num)}],
        }

        mentionsChartConfig = {
            id: 'mentions-year',
            title: 'Mentions by Year',
            xLabels: searchResults.years.rows.map(r => r.year),
            datasets: [{data: searchResults.years.rows.map(r => r.num)}]
        }
	}

</script>

<div class="row">
    {#if searchResults && searchResults.transcripts}
        <div class="row">
            <div class="six columns">
                {#if speakerChartConfig.datasets}
                    <Chart config={speakerChartConfig}/>
                {/if}
            </div>
            <div class="six columns">
                {#if mentionsChartConfig.datasets}
                    <Chart config={mentionsChartConfig}/>
                {/if}
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
                {#each searchResults.transcripts.rows as r, i}
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
            Results {searchLimit * (page - 1) + 1} to {searchLimit * (page - 1) + searchResults.transcripts.rows.length} of {totalResults}<br>
            {#if page > 1}
                <button on:click={() => search(query, -1)}>Previous</button>
            {/if}
            {#if searchLimit * (page - 1) + searchResults.transcripts.rows.length < totalResults}
                <button on:click={() => search(query, 1)}>Next</button>
            {/if}
        </div>
    {/if}
</div>
