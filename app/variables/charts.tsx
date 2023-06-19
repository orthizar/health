import { ApexOptions } from "apexcharts";

export const lineChartOptionsGCM: ApexOptions = {
  "chart": {
      "animations": {
          "enabled": false,
          "easing": "swing"
      },
      "background": "#343E59",
      "dropShadow": {
          "enabled": true
      },
      "foreColor": "#fff",
      "fontFamily": "Roboto",
      "id": "tDe7P",
      "toolbar": {
          "show": false,
          "tools": {
              "selection": false,
              "zoom": false,
              "zoomin": false,
              "zoomout": false,
              "pan": false,
              "reset": false
          }
      },
  },
  "plotOptions": {
      "bar": {
          "borderRadius": 10
      },
      "radialBar": {
          "hollow": {
              "background": "#fff"
          },
          "dataLabels": {
              "name": {},
              "value": {},
              "total": {}
          }
      },
      "pie": {
          "donut": {
              "labels": {
                  "name": {},
                  "value": {},
                  "total": {}
              }
          }
      }
  },
  "dataLabels": {
      "enabled": false,
      "style": {
          "fontSize": 8,
          "fontWeight": 700
      }
  },
  "grid": {
      "borderColor": "#6e7eaa",
      "padding": {
          "right": 25,
          "left": 15
      }
  },
  "legend": {
      "fontSize": 14,
      "offsetY": 0,
      "itemMargin": {
          "vertical": 0
      }
  },
  "markers": {
      "hover": {
          "size": 0,
          "sizeOffset": 6
      }
  },
  "series": [
      {
          "name": "Likes",
          "data": [
              {
                  "x": "2023-05-21T22:55:35Z",
                  "y": 10
              },
              {
                  "x": "2023-06-21T22:55:35Z",
                  "y": "11"
              }
          ]
      }
  ],
  "tooltip": {},
  "xaxis": {
      "labels": {
          "trim": true,
          "style": {}
      },
      "tickAmount": 2,
      "title": {
          "style": {
              "fontWeight": 700
          }
      }
  },
  "yaxis": {
      "tickAmount": 5,
      "max": 20,
      "min": 0,
      "labels": {
          "style": {}
      },
      "title": {
          "text": "mmol/mol",
          "style": {
              "fontWeight": 700
          }
      }
  },
  "theme": {
      "mode": "dark",
      "palette": "palette4"
  }
};