<script>
    import { onMount } from 'svelte';
    import { loading } from '../stores';   
    import Chart from 'chart.js';
    import { api } from '../api';

    onMount(async() => {
        loading.set(true);
        await Promise.all([loadPercentYes(), loadOutcomes()]);
        loading.set(false)
    })

    async function loadPercentYes() {
        const results = await api('/dashboard/votes/yes');
        const ayeChart = document.getElementById('aye-chart');

        new Chart(ayeChart, {
            type: 'bar',
            data: {
                labels: results.map(r => r.year),
                datasets: [{data: results.map(r => r.percent_aye * 100)}]
            },
            options: {
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, data) => '% Aye Votes: ' + tooltipItem.yLabel.toFixed(1) + '%'
                    }
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Year of Vote'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: (value, index, values) => value + '%'
                        }
                    }]
                }
            }
        });
    }

    async function loadOutcomes() {
        const results = await api('/dashboard/legislation/outcomes');
        const outcomesChart = document.getElementById('outcomes-chart');

        new Chart(outcomesChart, {
            type: 'bar',
            data: {
                labels: results.map(r => r.year),
                datasets: [{data: results.map(r => r.percent_passed * 100)}],
            },
            options: {
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, data) => '% Passed: ' + tooltipItem.yLabel.toFixed(1) + '%'
                    }
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Year Introduced'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: (value, index, values) => value + '%'
                        }
                    }]
                }
            }
        });
    }

</script>

<div class="row">
    <div class="six columns">
        <label for="aye-chart">% Aye Votes</label>
        <canvas id="aye-chart" width="400" height="200"></canvas>
    </div>
    <div class="six columns">
        <label for="outcomes-chart">% of Legislation that is Passed or Filed</label>
        <canvas id="outcomes-chart" width="400" height="200"></canvas>
    </div>
</div>
