import { ChartConfiguration } from 'chart.js';
import autocolors from 'chartjs-plugin-autocolors';
import { ChartCallback, ChartJSNodeCanvas } from 'chartjs-node-canvas';

const chartCallback: ChartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = false;
    ChartJS.defaults.maintainAspectRatio = false;
    ChartJS.defaults.font.size = 16;
    ChartJS.register(autocolors);
};
const width = 1280;
const height = 720;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white', chartCallback });

async function createChartBuffer(config: ChartConfiguration) {
    return await chartJSNodeCanvas.renderToBuffer(config);
}

export { createChartBuffer };