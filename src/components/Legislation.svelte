<script>
    import { loading } from '../stores';   
    import { searchLegislation } from '../api';
    
    import lodash from 'lodash';
    
    import dayjs from 'dayjs';
    import duration from 'dayjs/plugin/duration';
    
    dayjs.extend(duration)

    export let query;

    let searchResults = [];

    // $ makes this reactive - re-runs the search whenever query changes
    $: search(query);

    const maxTitleLength = 300;

    async function search (query) {
        loading.set(true);
        searchResults = (await searchLegislation(query)).map(l => {
            l.showFullTitle = l.title.length <= maxTitleLength;
            if (!l.showFullTitle) l.titleShort = l.title.substr(0, maxTitleLength).trim();

            for (const col in l) {
                if (l[col] && (col.endsWith('_on') || col.endsWith('_date'))) l[col] = dayjs(l[col]).format('MMMM D, YYYY');
            }

            if (l.legislation_histories.length > 1) { 
                const duration = dayjs.duration(dayjs(l.legislation_histories[0].date).diff(dayjs(l.legislation_histories[l.legislation_histories.length - 1].date)))
                l.days = Math.round(duration.asDays());
            }

            l.legislation_sponsors = lodash.sortBy(l.legislation_sponsors, [(s) => s.person.name]);

            l.legislation_histories = l.legislation_histories.map(h => {
                h.date = dayjs(h.date).format('MMMM D, YYYY');
                if (h.votes) h.votes = lodash.sortBy(h.votes, [(v) => v.person.name]);
                return h
            });

            l.numVotes = l.legislation_histories.reduce((p, c) => {
                if (c.votes) p += c.votes.length;
                return p;
            }, 0)

            return l;
        });
        loading.set(false);
        console.log(searchResults);
	}

</script>

{#each searchResults as r, i}
    <h5>
        <a href={r.details_url} target="_blank">{r.name}</a>
    </h5>
    <span title="Introduced On"><em>{r.introduced_on}</em></span>
    
    <div class="row">
        <div class="two columns">
            <div class="subtitle">
                <div class="row">
                    <div class="tag">{r.type}: <strong>{r.status}</strong></div>
                </div>
                {#if r.legislation_histories.length}{r.legislation_histories.length} Steps<br>{/if}
                {#if r.days}{r.days} Days<br>{/if}
                {#if r.numVotes}{r.numVotes} Votes<br>{/if}

                {#if r.legislation_histories.length}
                    <span class="action" on:click={e => r.showDetail = !r.showDetail}>Show {#if r.showDetail}Text{:else}Detail{/if}</span>
                {/if}
            </div>
        </div>
        <div class="ten columns">
            {#if r.showDetail}
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>By</th>
                            <th>Action</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each r.legislation_histories as h, i}
                            <tr>
                                <td>{h.date}</td>
                                <td>{h.action_by || ''}</td>
                                <td>{h.action || ''}</td>
                                <td>
                                    {h.result || ''}
                                    {#if h.votes.length}<br><span class="action" on:click={e => h.showVotes = !h.showVotes}>Votes</span>{/if}
                                </td>
                            </tr>
                            {#if h.showVotes}
                                <tr>
                                    <td colspan="4" class="votes-row">
                                        {#each h.votes as v, i}
                                            <strong>{v.person.name}</strong>: {v.vote}<br>
                                        {/each}
                                    </td>
                                </tr>
                            {/if}
                        {/each}
                    </tbody>
                </table>
            {:else}
                {#if r.legislation_sponsors.length}
                    <div class="row">
                        {#each r.legislation_sponsors as s} 
                            <div class="tag black">{s.person.name}</div>
                        {/each}
                    </div>
                {/if}
                {#if r.showFullTitle}
                    {r.title}
                {:else}
                    {r.titleShort}...<br><span class="action" on:click={e => r.showFullTitle = true}>Show More</span>
                {/if}
            {/if}
        </div>
    </div>
{/each}

<style>
    h5 {
        margin-top: 25px;
        margin-bottom: 0;
    }

    .votes-row {
        column-span: all;
        text-align: center;
    }

    .tag {
        font-size: 12px;
        vertical-align: middle;
        padding: 3px;
        margin-right: 5px;
        border-radius: 4px;
        border: 1px solid black;
        width: fit-content;
        float: left;
    }

    .action {
        cursor: pointer;
        text-decoration: underline;
    }

    .tag.black {
        background-color: black;
        color: white;
    }

    .subtitle {
        color: gray;
    }
</style>
