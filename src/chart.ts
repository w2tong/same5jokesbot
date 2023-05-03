import { ChartConfiguration } from 'chart.js';
import autocolors from 'chartjs-plugin-autocolors';
import datalabels from 'chartjs-plugin-datalabels';
import { ChartCallback, ChartJSNodeCanvas } from 'chartjs-node-canvas';

const chartCallback: ChartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = false;
    ChartJS.defaults.maintainAspectRatio = false;
    ChartJS.defaults.font.size = 16;
    ChartJS.defaults.layout.padding = 25;
};
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 1600, height: 900, backgroundColour: 'white', chartCallback, 
    plugins: {
        modern: [autocolors, datalabels]
    } 
});

async function createChartBuffer(config: ChartConfiguration) {
    return await chartJSNodeCanvas.renderToBuffer(config);
}

export { createChartBuffer };