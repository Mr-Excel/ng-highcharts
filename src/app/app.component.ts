

import { Chart } from 'angular-highcharts';
import { Component } from '@angular/core';
import DATA from 'src/services/api.services';
import { APIData } from 'src/types/index.dto';
import * as Highcharts from 'highcharts';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})




export class AppComponent {
  chart = new Chart()
  allData: APIData[] = []
  filteredData: APIData[] = []
  selectedOptions: string[] = []
  options: string[] = []
  start: number = 0
  end: number = 99999999999999
  dataset: string = "default"
  colors: string[] = [
    "Teal",
    "Coral",
    "Lavender",
    "Maroon",
    "Turquoise",
    "Gold",
    "Indigo",
    "Crimson",
    "Slate",
    "Peach",
    "Orchid",
    "Azure",
    "Olive",
    "Mauve",
    "Cyan",
    "Amber",
    "Periwinkle",
    "Ruby",
    "Sage",
    "Rose"
]

  async ngOnInit() {
    await this.generateData("Companies")
    this.filterData()
    this.loadChart()
  }

  generateData(key: string) {
    const data = key === "Companies" ? DATA.Companies : key === "Icecream" ? DATA.Icecream : DATA.Mobile
    const unique = new Set(data.map(i => i.name))
    this.options = [...unique]
    this.allData = data
    this.filteredData = data
  }

  filterData() {
    const source = this.selectedOptions.length ? this.selectedOptions : this.options
    const data = this.allData.filter(i => source.indexOf(i.name) >= 0);
    this.filteredData = data.filter(m => Date.UTC(+m.date.split("-")[0],+m.date.split("-")[1],+m.date.split("-")[2]) >= this.start && Date.UTC(+m.date.split("-")[0],+m.date.split("-")[1],+m.date.split("-")[2]) <= this.end )
  }

  loadChart(){
    let array: Highcharts.SeriesOptionsType[] = []
    let idx: number = 0
    this.options.forEach((i) => {
      const defaultData = this.filteredData.filter(d => d.name === i).map(m => [Date.UTC(+m.date.split("-")[0], +m.date.split("-")[1], +m.date.split("-")[2]), m.quantity])

      const quartersData = [1, 2, 3, 4].map(q => [`QTR-${q}`,defaultData.map(i => [this.getQuarterFromDate(i[0]), i[1]]).filter(i => i[0] === q).map(j => j[1]).reduce((acc, curr) => acc + curr, 0)])

      const monthsData = [1, 2, 3, 4,5,6,7,8,9,10,11,12].map(q => [q,defaultData.map(i => [this.getMonthFromDate(i[0]), i[1]]).filter(i => i[0] === q).map(j => j[1]).reduce((acc, curr) => acc + curr, 0)])

      array.push(
        {
          name: i,
          type: "line",
          lineWidth: 2,
          data: this.dataset === "default" ? defaultData : this.dataset === "months" ?  monthsData : quartersData ,
          color: this.colors[idx]
        }
      )
      idx++
    })



    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: 'Linechart'
      },
      credits: {
        enabled: false
      },
      tooltip: {
        valueDecimals: 2
      },
      xAxis: {
        type: this.dataset === "default" ? 'datetime' : 'category',
      },
      yAxis: [{
        title: {
          text: 'Quantity Sold',
          style: {
            color: "red",
            fontWeight: "800"
          },
        },
      }],
      series: array
    })
  }

  getDataInQuarter() {

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
    this.dataset = option

    this.generateData("Companies")
    this.filterData()
    this.loadChart()
  }

  onSelectAllChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.checked) {
      this.selectedOptions = this.options
    } else {
      this.selectedOptions = []
    }
  }

  onProductChange(e: Event) {
    const target = e.target as HTMLInputElement
    const idx = this.selectedOptions.indexOf(target.value)
    if (idx >= 0) {
      this.selectedOptions.splice(idx, 1)
    } else {
      this.selectedOptions.push(target.value)
    }
    this.filterData()
    this.loadChart()
  }

  onDateFilterChange(type: number, e: Event) {
    const target = e.target as HTMLInputElement
    const m = target.value
    const date = Date.UTC(+m.split("-")[0],+m.split("-")[1],+m.split("-")[2])
    if (type === 0) {
      this.start = date
    } else {
      this.end = date
    }
    this.filterData()
    this.loadChart()
  }

}
