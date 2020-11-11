<script>
    import Chart from './Chart.svelte';
    import { api } from '../api';

    let chartBudget;
    let chartOutcomes;
    let chartGovernance;
    
    const chartConfigs = {
        '311-homeless': async () => {
            const results = await api('/311/summary?categories=Encampments,Homeless%20Concerns');

            return {
                id: '311-homeless',
                title: '311: Homeless Related Issues',
                xLabels: results.rows.map(r => r.year),
                datasets: [{data: results.rows.map(r => r.cases)}],
                sources: results.sources,
                xAxisLabel: 'Year Opened'
            }
        },
        'budget-per-resident': async () => {
            const results = await api('/budget/per-person');

            return {
                id: 'budget-per-person',
                title: 'Budget Per Resident',
                xLabels: results.rows.map(r => r.year),
                datasets: [{data: results.rows.map(r => Math.round(r.budget_per_person))}],
                xAxisLabel: 'Year',
                prefix: '$',
                sources: results.sources
            }
        },
        'homeless-budget': async () => {
            const results = await api('/budget/homeless');

            return {
                id: 'budget-homeless',
                title: 'Budget ($ Millions) For Departments Dedicated to Homelessness',
                xLabels: results.rows.map(r => r.year),
                datasets: [{data: results.rows.map(r => r.budget_millions)}],
                xAxisLabel: 'Year',
                prefix: '$',
                suffix: 'M',
                sources: results.sources
            }
        },
        'housing-affordability': async () => {
            const results = await api('/affordability/housing');

            return {
                id: 'housing-affordability',
                title: '% of Households That Can Afford a Median Priced Home',
                xLabels: results.rows.map(r => r.year),
                datasets: [{data: results.rows.map(r => r.value)}],
                xAxisLabel: 'Year',
                suffix: '%',
                sources: results.sources
            }
        },
        'outcomes': async () => {
            const results = await api('/legislation/outcomes');

            return {
                id: 'outcomes',
                title: '% of Legislation Passed or Filed',
                xLabels: results.rows.map(r => r.year),
                datasets: [{data: results.rows.map(r => Math.round(r.percent_passed * 1000) / 10)}],
                xAxisLabel: 'Year Introduced',
                suffix: '%',
                sources: results.sources
            }
        },
        'test-results-math': async () => {
            const results = await api('/education/test-results?subject=Math');

            const years = []
            const sets = {}

            for (const r of results.rows) {
                if (!years.includes(r.year)) years.push(r.year);
                if (!sets[r.race]) sets[r.race] = {data: [], fill: false, label: r.race}
                sets[r.race].data.push(r.percent_met_or_exceeded)
            }

            return {
                id: 'test-results-math',
                type: 'line',
                title: '% of Standard Met or Exceeded, CA Smarter Balanced Test Results',
                xLabels: years,
                datasets: Object.values(sets),
                xAxisLabel: 'Year',
                suffix: '%',
                sources: results.sources
            }
        },
        'votes-yes': async () => {
            const results = await api('/legislation/votes/yes');

            return {
                id: 'yes',
                title: '% Aye Votes',
                xLabels: results.rows.map(r => r.year),
                datasets: [{data: results.rows.map(r => Math.round(r.percent_aye * 1000) / 10)}],
                xAxisLabel: 'Year of Vote',
                suffix: '%',
                sources: results.sources
            }
        }
    }

    async function getChart(chart) {
        if (!chart) return;
        return chartConfigs[chart]()
    }

</script>

<div class="row">
    <div class="three columns">
        <h5>Budget</h5>
        <p>
            San Francisco has the largest per capita budget of any city in the United States.
        </p>
    </div>
    <div class="nine columns">
        <select bind:value={chartBudget}>
            <option value="budget-per-resident" selected>Budget Per Resident</option>
            <option value="homeless-budget">Homelessness Budget</option>
        </select>
        {#await getChart(chartBudget) then c}
            <Chart config={c}/>
        {/await}
    </div>
</div>

<hr>

<div class="row">
    <div class="three columns">
        <h5>Outcomes</h5>
        <p>
            Despite the city's massive and rapidly growing budget, many qualify of life measures continue to trend in the wrong direction.
        </p>
    </div>
    <div class="nine columns">
        <select bind:value={chartOutcomes}>
            <option value="311-homeless" selected>311: Homeless Cases</option>
            <option value="housing-affordability">Housing Affordability</option>
            <option value="test-results-math">Test Results: Math</option>
        </select>
        {#await getChart(chartOutcomes) then c}
            <Chart config={c}/>
        {/await}
    </div>
</div>

<hr>

<div class="row">
    <div class="three columns">
        <h5>Governance</h5>
        <p>
            Meanwhile, the progressive Board of Supervisors has exhibited minimal diversity of thought, continuing to approve nearly every piece of legislation it has evaluated over the past 10 years.  
        </p>
    </div>
    <div class="nine columns">
        <select bind:value={chartGovernance}>
            <option value="votes-yes" selected>% of Yes Votes</option>
            <option value="outcomes">Legislative Outcomes</option>
        </select>
        {#await getChart(chartGovernance) then c}
            <Chart config={c}/>
        {/await}
    </div>
</div>