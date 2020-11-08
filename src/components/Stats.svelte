<script>
    import { onMount } from 'svelte';
    import { loading } from '../stores';   
    import Chart from './Chart.svelte';
    import { api } from '../api';

    const chartConfigs = {}

    onMount(async() => {
        loading.set(true);
        await Promise.all([loadPercentYes(), loadOutcomes()]);
        loading.set(false)
    });

    async function loadPercentYes() {
        const results = await api('/dashboard/votes/yes');

        chartConfigs.yes = {
            id: 'yes',
            title: '% Aye Votes',
            xLabels: results.map(r => r.year),
            datasets: [{data: results.map(r => r.percent_aye * 100)}],
            xAxisLabel: 'Year of Vote'
        }
    }

    async function loadOutcomes() {
        const results = await api('/dashboard/legislation/outcomes');

        chartConfigs.outcomes = {
            id: 'outcomes',
            title: '% of Legislation Passed or Filed',
            xLabels: results.map(r => r.year),
            datasets: [{data: results.map(r => r.percent_passed * 100)}],
            xAxisLabel: 'Year Introduced'
        }

    }

</script>

<div class="row">
    <div class="six columns">
        {#if chartConfigs.yes}
            <Chart config={chartConfigs.yes}/>
        {/if}
    </div>
    <div class="six columns">
        {#if chartConfigs.outcomes}
            <Chart config={chartConfigs.outcomes}/>
        {/if}
    </div>
</div>
