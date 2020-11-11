<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js';
    import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes';
    import { Median6 } from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.office';
    export let config;

    onMount(() => {
        new Chart(document.getElementById('chart-' + config.id), {
            type: config.type || 'bar',
            data: {
                labels: config.xLabels,
                datasets: config.datasets,
            },
            options: {
                plugins: {
                    colorschemes: {
                        scheme: Median6
                    }
                },
                legend: {
                    display: config.datasets.length > 1
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    position: 'nearest',
                    callbacks: {
                        label: (tooltipItem, data) => {
                            let label = ''
                            if (config.datasets.length > 1) label += config.datasets[tooltipItem.datasetIndex].label + ': ';
                            label += (config.prefix || '') + tooltipItem.yLabel.toLocaleString() + (config.suffix || '');
                            return label;
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: config.xAxisLabel ? true : false,
                            labelString: config.xAxisLabel || null
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: (value, index, values) => {
                                return (config.prefix || '') + value.toLocaleString() + (config.suffix || '')
                            }
                        }
                    }]
                }
            }
        });
    });
</script>

{#if config.title}
    <label for="chart">{config.title}</label>
{/if}
<canvas id="chart-{config.id}" width="400" height="180"></canvas>
{#if config.sources}
    <small>Source{#if config.sources.length > 1}s{/if}:</small>
    {#each config.sources as s, i}
        <a href={s} target="_blank"><button class="source-button">{i + 1}</button></a>
    {/each}
{/if}

<style>
    .source-button {
        line-height: 25px;
        height: 25px;
        padding: 0 10px;
    }
</style>