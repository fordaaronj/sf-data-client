<script>
    import Chart from './Chart.svelte';
    import Callout from './Callout.svelte';
    import { api } from '../api';

    let chartBudget = 'annual-budget';
    let chartOutcomes = '311-homeless';
    let chartGovernance = 'votes-yes';
    let callouts = {}

    const getGrowth = (series, yearField, valueField) => {
        const earliestYear = series[0][yearField]
        const referenceFigure = series[0][valueField];
        const latestFigure = series[series.length - 1][valueField];

        return {
            earliestYear,
            growth: Math.round(((latestFigure / referenceFigure) - 1) * 100).toLocaleString() + '%'
        }
    }
    
    const chartConfigs = {
        '311-homeless': async () => {
            const results = await api('/311/summary?categories=Encampments,Homeless%20Concerns');

            const latest = results.rows[results.rows.length - 1];

            callouts.outcomes = `In ${latest.year}, an average of ${Math.round(latest.cases / 365)} cases related to homeless issues were filed with 311 each day`;

            return {
                id: '311-homeless',
                title: '311: Homeless Related Issues',
                xLabels: results.rows.map(r => r.year),
                datasets: [{data: results.rows.map(r => r.cases)}],
                sources: results.sources,
                xAxisLabel: 'Year Opened'
            }
        },
        'annual-budget': async () => {
            const results = await api('/budget/summary');

            const earliestYear = results.rows[0].fiscal_year;
            const totalSpend = Math.round(results.rows.reduce((p, c) => {
                p += c.budget_millions / 1000;
                return p;
            }, 0)).toLocaleString();

            callouts.budget = `Since ${earliestYear}, San Francisco has spent a combined $${totalSpend}B`;

            return {
                id: 'annual-budget',
                title: 'Annual Budget',
                xLabels: results.rows.map(r => r.fiscal_year),
                datasets: [{data: results.rows.map(r => r.budget_millions)}],
                subtitle: 'Excludes expenditures related to SFO, the MTA, and the Port of San Francisco',
                xAxisLabel: 'Fiscal Year',
                prefix: '$',
                suffix: 'M',
                sources: results.sources
            }
        },
        'budget-business-taxes': async () => {
            const results = await api('/budget/revenue', {category: 'Business Taxes'});

            const growth = getGrowth(results.rows, 'fiscal_year', 'revenue_millions');

            callouts.budget = `Since ${growth.earliestYear}, SF's revenue from business taxes has grown by ${growth.growth}`;

            return {
                id: 'budget-business-taxes',
                title: 'Revenue from Business Taxes ($M)',
                xLabels: results.rows.map(r => r.fiscal_year),
                datasets: [{data: results.rows.map(r => r.revenue_millions)}],
                xAxisLabel: 'Year',
                sources: results.sources,
                prefix: '$',
                suffix: 'M'
            }
        },
        'homeless-budget': async () => {
            const results = await api('/budget/homeless');

            const growth = getGrowth(results.rows, 'year', 'budget_millions')

            callouts.budget = `Since ${growth.earliestYear}, SF's homelessness budget has grown by ${growth.growth}`

            return {
                id: 'budget-homeless',
                title: 'Budget ($M) For Departments Dedicated to Homelessness',
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

            const latest = results.rows[results.rows.length - 1].value

            callouts.outcomes = `
                Only ${latest}% of SF households can afford a median priced home, 
                lagging peer cities in CA such as LA (30%+), Sacramento (40%+), and Fresno (50%+).
            `;

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

            callouts.governance = `Since 2000, over 90% of proposed legislation has passed each year`;

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
        'police-larceny-theft': async () => {
            const results = (await api('/incidents/annual-summary?categories=Larceny%20Theft'))
            results.rows = results.rows.filter(r => r.incident_year >= 2010);

            const growth = getGrowth(results.rows, 'incident_year', 'incidents');

            callouts.outcomes = `
                Since ${growth.earliestYear}, larceny theft has risen ${growth.growth},
                while citations or arrests have fallen 
                from ${Math.round(results.rows[0].percent_cited_or_arrested)}% 
                to ${Math.round(results.rows[results.rows.length - 1].percent_cited_or_arrested)}%
            ` 

            return {
                id: 'police-larceny-theft',
                title: 'Larceny Theft: # of Incidents and % Cited or Arrested',
                xLabels: results.rows.map(r => r.incident_year),
                datasets: [
                    {data: results.rows.map(r => Math.round(r.percent_cited_or_arrested * 10) / 10), label: '% Cited or Arrested', yAxisID: 'left', type:'line', fill: false},
                    {data: results.rows.map(r => r.incidents), label: '# of Incidents', yAxisID: 'right'}
                ],
                xAxisLabel: 'Incident Year',
                yAxisLabel: ['% Cited or Arrested', '# of Incidents'],
                suffix: ['%', null],
                sources: results.sources
            }
        },
        'test-results-math': async () => {
            const results = await api('/education/test-results?subject=Math');

            const years = []
            const sets = {}

            callouts.outcomes = `
                White and Asian students consistently pass standardized math tests 3x as often as 
                Hispanic and African American students
            `

            for (const r of results.rows) {
                if (!years.includes(r.year)) years.push(r.year);
                if (!sets[r.race]) sets[r.race] = {data: [], fill: false, label: r.race}
                sets[r.race].data.push(r.percent_met_or_exceeded)
            }

            return {
                id: 'test-results-math',
                type: 'bar',
                title: '% of Standard Met or Exceeded, CA Smarter Balanced Test Results',
                xLabels: years,
                datasets: [
                    sets['African American'],
                    sets['Hispanic'],
                    sets['White'],
                    sets['Asian']
                ],
                xAxisLabel: 'Year',
                suffix: '%',
                sources: results.sources
            }
        },
        'transportation-share': async () => {
            const results = await api('/transportation/share');

            const sustainableByYear = results.rows.reduce((p, c) => {
                if (!p[c.fiscal_year]) p[c.fiscal_year] = 0;
                if (['Bicycle', 'Transit', 'Walk'].includes(c.mode)) p[c.fiscal_year] += c.percent_share;
                return p;
            }, {});

            callouts.outcomes = `
                Since ${Object.keys(sustainableByYear)[0]}, the share of trips that are sustainable (biking, walking, or transit)
                has fallen from ${Object.values(sustainableByYear)[0]}% to 
                ${Object.values(sustainableByYear)[Object.values(sustainableByYear).length - 1]}%
            `

            const datasets = results.rows.reduce((p, c) => {
                if (!p[c.mode]) p[c.mode] = {data: [], label: c.mode}
                p[c.mode].data.push(c.percent_share);
                return p
            }, {})

            return {
                id: 'transportation-share',
                title: 'Transportation: Share of Trips',
                xLabels: Object.keys(sustainableByYear),
                datasets: Object.values(datasets),
                xAxisLabel:  'Fiscal Year',
                suffix: '%',
                sources: results.sources
            }
        },
        'votes-yes': async () => {
            const results = await api('/legislation/votes/yes');

            const earliestYear = results.rows[0];
            const latestYear = results.rows[results.rows.length - 1];

            callouts.governance = `
                Yes votes from the Board and its Committees 
                have increased from ${Math.round(earliestYear.percent_aye  * 100)}% in ${earliestYear.year}
                to ${Math.round(latestYear.percent_aye  * 100)}% in ${latestYear.year}    
            `

            return {
                id: 'yes',
                title: '% Yes Votes',
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
        <h4>Budget</h4>
        <p>
            San Francisco has incredible financial resources at its disposal.
        </p>

        <Callout callout={callouts.budget}/>

    </div>
    <div class="nine columns">
        <button class:button-primary={chartBudget == 'annual-budget'} class="chart" on:click={() => chartBudget = 'annual-budget'}>
            Annual Budget
        </button>
        <button class:button-primary={chartBudget == 'budget-business-taxes'} class="chart" on:click={() => chartBudget = 'budget-business-taxes'}>
            Business Taxes
        </button>
        <button class:button-primary={chartBudget == 'homeless-budget'} class="chart" on:click={() => chartBudget = 'homeless-budget'}>
            Homelessness Budget
        </button>
        {#await getChart(chartBudget) then c}
            <Chart config={c}/>
        {/await}
    </div>
</div>

<hr>

<div class="row">
    <div class="three columns">
        <h4>Outcomes</h4>
        <p>
            Despite SF's massive and growing budget, key measures of livability continue to stagnate or deteriorate. 
        </p>

        <Callout callout={callouts.outcomes}/>

    </div>
    <div class="nine columns">
        <button class:button-primary={chartOutcomes == '311-homeless'} class="chart" on:click={() => chartOutcomes = '311-homeless'}>
            311: Homeless
        </button>
        <button class:button-primary={chartOutcomes == 'housing-affordability'} class="chart" on:click={() => chartOutcomes = 'housing-affordability'}>
            Housing Affordability
        </button>
        <button class:button-primary={chartOutcomes == 'police-larceny-theft'} class="chart" on:click={() => chartOutcomes = 'police-larceny-theft'}>
            Police: Theft
        </button>
        <button class:button-primary={chartOutcomes == 'test-results-math'} class="chart" on:click={() => chartOutcomes = 'test-results-math'}>
            Test Results: Math
        </button>
        <button class:button-primary={chartOutcomes == 'transportation-share'} class="chart" on:click={() => chartOutcomes = 'transportation-share'}>
            Transportation Modes
        </button>
        {#await getChart(chartOutcomes) then c}
            <Chart config={c}/>
        {/await}
    </div>
</div>

<hr>

<div class="row">
    <div class="three columns">
        <h4>Governance</h4>
        <p>
            Meanwhile, the Board of Supervisors seems to be increasingly exhibiting <a href="https://en.wikipedia.org/wiki/Groupthink" target="_blank">groupthink</a>. 
        </p>

        <Callout callout={callouts.governance}/>

    </div>
    <div class="nine columns">
        <button class:button-primary={chartGovernance == 'votes-yes'} class="chart" on:click={() => chartGovernance = 'votes-yes'}>
            % of Yes Votes
        </button>
        <button class:button-primary={chartGovernance == 'outcomes'} class="chart" on:click={() => chartGovernance = 'outcomes'}>
            Legislative Outcomes
        </button>
        {#await getChart(chartGovernance) then c}
            <Chart config={c}/>
        {/await}
    </div>
</div>

<style>
    button.chart {
        text-transform: none;
        padding: 0 15px;
        font-weight: normal;
    }
</style>