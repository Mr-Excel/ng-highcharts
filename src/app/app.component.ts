

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
  dataset: string = "Companies"
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
      array.push(
        {
          name: i,
          type: "line",
          lineWidth: 2,
          data: this.filteredData.filter(d => d.name === i).map(m => [Date.UTC(+m.date.split("-")[0],+m.date.split("-")[1],+m.date.split("-")[2]),m.quantity]),
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
        type: 'datetime',
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
  applySelectedFilter(option: string) {
    this.dataset = option
    this.generateData(this.dataset)
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
