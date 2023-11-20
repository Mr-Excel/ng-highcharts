import { Chart } from 'angular-highcharts';
import { Component } from '@angular/core';
import DATA from 'src/services/api.services';
import { APIData } from 'src/types/index.dto';
import * as Highcharts from 'highcharts';
import {
  convertStringDateToUTC,
  defaultDataSet,
  monthWiseData,
  quarterWiseData,
  randomColorGenerator,
} from 'src/utils/helpers';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // VARIABLE DECLERATIONS
  chartOptions = {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Linechart',
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      valueDecimals: 2,
    },
    yAxis: [
      {
        title: {
          text: 'Quantity Sold',
          style: {
            color: 'red',
            fontWeight: '800',
          },
        },
      },
    ],
    series: [],
  };
  chart = new Chart();
  allData: APIData[] = [];
  filteredData: APIData[] = [];
  selectedOptions: string[] = [];
  options: string[] = [];
  start_date: number = 0;
  end_date: number = 99999999999999;
  dataset: string = 'default';
  quarters: number[] = [1, 2, 3, 4];
  months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // On Load Event Will trigger Once Loaded
  async ngOnInit() {
    // Await Used if data take some times than load data first after that do filteration and chart configuration
    await this.generateData('Companies');
  }

  // Data Generator there are three type of data sources attached but statically we have loaded only "Companies" Data
  generateData(key: string) {
    const data = DATA[key || 'Companies'];

    // GETTING Unique Metric Names from selected data source, to use for filtering data
    const unique: Set<string> = new Set(data.map((i) => i.name));
    this.options = [...unique];

    // Source of truth data will be stored in allData so that no filtering or manipulations will effect the originol data in case of any issue we can retrive it.
    this.allData = data;
    // For first load filtered data will be equal to All Data
    this.filteredData = data;
    this.refreshData();
  }

  // Filteration will be done in below method
  filterData() {
    // checking if filtering is applied if no it will take all unique options
    const source = this.selectedOptions.length
      ? this.selectedOptions
      : this.options;
    const data = this.allData.filter((i) => source.indexOf(i.name) >= 0);

    // Date Filter is working below
    this.filteredData = data.filter(
      (item) =>
        convertStringDateToUTC(item.date) >= this.start_date &&
        convertStringDateToUTC(item.date) <= this.end_date
    );
  }

  // Loading Chart in HTML DOM
  loadChart() {
    let array: Highcharts.SeriesOptionsType[] = [];
    this.options.forEach((option) => {
      const data =
        this.dataset === 'default'
          ? defaultDataSet(this.filteredData, option)
          : this.dataset === 'months'
          ? quarterWiseData(this.filteredData, option)
          : monthWiseData(this.filteredData, option);

      array.push({
        name: option,
        type: 'line',
        lineWidth: 2,
        data,
        color: randomColorGenerator(),
      });
    });

    this.chart = new Chart({
      ...this.chartOptions,
      xAxis: {
        type: this.dataset === 'default' ? 'datetime' : 'category',
      },
      series: array,
    });
  }

  onSelectAllChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedOptions = this.options;
    } else {
      this.selectedOptions = [];
    }
    this.refreshData();
  }

  onProductChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const idx = this.selectedOptions.indexOf(target.value);
    if (idx >= 0) {
      this.selectedOptions.splice(idx, 1);
    } else {
      this.selectedOptions.push(target.value);
    }
    this.refreshData();
  }

  onDateFilterChange(type: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const m = target.value;
    const date = Date.UTC(+m.split('-')[0], +m.split('-')[1], +m.split('-')[2]);
    if (type === 0) {
      this.start_date = date;
    } else {
      this.end_date = date;
    }
    this.refreshData();
  }

  refreshData() {
    this.filterData();
    this.loadChart();
  }

  applySelectedFilter(option: string) {
    this.dataset = option;
    this.generateData('Companies');
  }
}
