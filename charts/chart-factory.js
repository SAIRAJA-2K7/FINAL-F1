const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true,
            backgroundColor: 'rgba(10,10,10,0.9)',
            titleFont: { family: 'Inter, sans-serif', size: 12, weight: '700' },
            bodyFont: { family: 'Inter, sans-serif', size: 11 },
            padding: 12,
            cornerRadius: 4
        }
    },
    scales: {
        x: {
            display: true,
            grid: { display: false },
            ticks: { color: 'rgba(74, 68, 56, 0.85)', font: { family: 'Inter, sans-serif', size: 11 } }
        },
        y: {
            display: true,
            grid: { color: 'rgba(10, 10, 10, 0.06)' },
            ticks: { color: 'rgba(74, 68, 56, 0.85)', font: { family: 'Inter, sans-serif', size: 11 } }
        }
    }
};

export function createLineChart(canvas, config = {}) {
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: config.labels || [],
            datasets: config.datasets || []
        },
        options: {
            ...baseOptions,
            ...config.options,
            interaction: { mode: 'index', intersect: false }
        }
    });
}

export function createSteppedChart(canvas, config = {}) {
    const chart = createLineChart(canvas, config);
    chart.data.datasets.forEach(ds => ds.step = 'middle');
    return chart;
}

export function updateChart(chart, labels, datasetUpdates) {
    chart.data.labels = labels;
    datasetUpdates.forEach(update => {
        const dataset = chart.data.datasets[update.index];
        if (!dataset) return;
        dataset.data = update.data;
        Object.assign(dataset, update.options || {});
    });
    chart.update('none');
}
