import { ChartConfiguration } from 'chart.js';
import autocolors from 'chartjs-plugin-autocolors';
import { ChartCallback, ChartJSNodeCanvas } from 'chartjs-node-canvas';

async function createChartBuffer(config: ChartConfiguration, width = 1280, height = 720) {
    const chartCallback: ChartCallback = (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
        ChartJS.defaults.font.size = 16;
        ChartJS.register(autocolors);
    };
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white', chartCallback });
    return await chartJSNodeCanvas.renderToBuffer(config);
}

export { createChartBuffer };