import { ChartConfiguration } from 'chart.js';
import autocolors from 'chartjs-plugin-autocolors';
import datalabels from 'chartjs-plugin-datalabels';
import { ChartCallback, ChartJSNodeCanvas } from 'chartjs-node-canvas';

const chartCallback: ChartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = false;
    ChartJS.defaults.maintainAspectRatio = false;
    ChartJS.defaults.layout.padding = 50;
};
const mediumChartJSNodeCanvas = new ChartJSNodeCanvas({ width: 1600, height: 900, backgroundColour: 'white', chartCallback, 
    plugins: {
        modern: [autocolors, datalabels]
    } 
});

async function createMediumChartBuffer(config: ChartConfiguration) {
    return await mediumChartJSNodeCanvas.renderToBuffer(config);
}

const largeChartJSNodeCanvas = new ChartJSNodeCanvas({ width: 1920, height: 1920, backgroundColour: 'white', chartCallback, 
    plugins: {
        modern: [autocolors, datalabels]
    } 
});

async function createLargeChartBuffer(config: ChartConfiguration) {
    return await largeChartJSNodeCanvas.renderToBuffer(config);
}

export { createMediumChartBuffer, createLargeChartBuffer };