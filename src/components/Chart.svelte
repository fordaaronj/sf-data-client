<script>
    import { onMount } from 'svelte';
    export let config;

    onMount(() => {
        new Chart(document.getElementById('chart-' + config.id), {
            type: 'bar',
            data: {
                labels: config.xLabels,
                datasets: config.datasets,
            },
            options: {
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, data) => config.title + ': ' + tooltipItem.yLabel.toFixed(1) + '%'
                    }
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: config.xAxisLabel
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
    });
</script>

<label for="chart">{config.title}</label>
<canvas id="chart-{config.id}" width="400" height="200"></canvas>