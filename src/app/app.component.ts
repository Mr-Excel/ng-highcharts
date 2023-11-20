import { Chart } from 'angular-highcharts';
import { Component } from '@angular/core';
import DATA from 'src/services/api.services';
import { APIData } from 'src/types/index.dto';
import * as Highcharts from 'highcharts';

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
    this.filterData();
    this.loadChart();
  }

  // Data Generator there are three type of data sources attached but statically we have loaded only "Companies" Data
  generateData(key: string) {
    const data = DATA[key || 'Companies'];

    // GETTING Unique Metric Names from selected data source, to use for filtering data
    const unique: Set<string> = new Set(data.map((i) => i.name));
    this.options = Array.from(unique);

    // Source of truth data will be stored in allData so that no filtering or manipulations will effect the originol data in case of any issue we can retrive it.
    this.allData = data;
    // For first load filtered data will be equal to All Data
    this.filteredData = data;
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
        this.convertStringDateToUTC(item.date) >= this.start_date &&
        this.convertStringDateToUTC(item.date) <= this.end_date
    );
  }

  // Loading Chart in HTML DOM
  loadChart() {
    let array: Highcharts.SeriesOptionsType[] = [];
    this.options.forEach((option) => {
      const data =
        this.dataset === 'default'
          ? this.defaultDataSet(this.filteredData, option)
          : this.dataset === 'months'
          ? this.quarterWiseData(this.filteredData, option)
          : this.monthWiseData(this.filteredData, option);

      array.push({
        name: option,
        type: 'line',
        lineWidth: 2,
        data,
        color: this.randomColorGenerator(),
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
    this.filterData();
    this.loadChart();
  }

  onProductChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const idx = this.selectedOptions.indexOf(target.value);
    if (idx >= 0) {
      this.selectedOptions.splice(idx, 1);
    } else {
      this.selectedOptions.push(target.value);
    }
    this.filterData();
    this.loadChart();
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
    this.filterData();
    this.loadChart();
  }

  // Function to get the quarter from a given timestamp
  getQuarterFromDate(timestamp: number): number {
    const date = new Date(timestamp);
    return Math.floor(date.getUTCMonth() / 3) + 1;
  }

  getMonthFromDate(timestamp: number): number {
    const date = new Date(timestamp);
    return Math.floor(date.getUTCMonth()) + 1;
  }

  applySelectedFilter(option: string) {
    this.dataset = option;

    this.generateData('Companies');
    this.filterData();
    this.loadChart();
  }

  randomColorGenerator() {
    return '#' + Math.random().toString(16).substr(2, 6);
  }

  // COnverstion String date to UTC
  convertStringDateToUTC(date: string) {
    const [year, month, day] = date.split('-');
    return Date.UTC(+year, +month, +day);
  }

  defaultDataSet(data: APIData[], filterValue: string) {
    return data
      .filter((d) => d.name === filterValue)
      .map((m) => [this.convertStringDateToUTC(m.date), m.quantity]);
  }

  quarterWiseData(data: APIData[], filterValue: string) {
    const defaultData = this.defaultDataSet(data, filterValue);
    return this.quarters.map((q) => [
      `QTR-${q}`,
      defaultData
        .map((i) => [this.getQuarterFromDate(i[0]).toString(), i[1]])
        .filter((i) => +i[0] === q)
        .map((j) => +j[1])
        .reduce((acc, curr) => acc + curr, 0),
    ]);
  }

  monthWiseData(data: APIData[], filterValue: string) {
    const defaultData = this.defaultDataSet(data, filterValue);
    return this.months.map((q) => [
      q,
      defaultData
        .map((i) => [this.getMonthFromDate(i[0]), i[1]])
        .filter((i) => i[0] === q)
        .map((j) => j[1])
        .reduce((acc, curr) => acc + curr, 0),
    ]);
  }
}
