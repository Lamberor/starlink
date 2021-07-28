import React, { Component } from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import { feature } from 'topojson-client';

import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import { schemeCategory10 } from 'd3-scale-chromatic';
import * as d3Scale from 'd3-scale';
import { timeFormat as d3TimeFormat } from 'd3-time-format';

import {
  WORLD_MAP_URL,
  SAT_API_KEY,
  SATELLITE_POSITION_URL,
} from '../constants';

const width = 960;
const height = 600;

class WorldMap extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      isDrawing: false,
    };
    this.map = null;
    this.color = d3Scale.scaleOrdinal(schemeCategory10);
    this.refMap = React.createRef();
    this.refTrack = React.createRef();
  }

  componentDidMount() {
    // fetch worldmap data
    axios
      .get(WORLD_MAP_URL)
      .then((res) => {
        const { data } = res;
        //convert TopoJSON to geoJSON
        const land = feature(data, data.objects.countries).features;
        // generate the map
        this.generateMap(land);
      })
      .catch((e) => console.log('err in fecth world map data ', e));
  }

  componentDidUpdate(prevProps, prevState, snapShot) {
    if (prevProps.satData !== this.props.satData) {
      // step1: get duration and lat, long... from the setting
      const { latitude, longitude, elevation, duration } =
        this.props.observerData;
      const endTime = duration * 60;
      this.setState({
        isLoading: true,
      });

      // step2: fetch selected sat data
      // -> Configurations -> url
      const urls = this.props.satData.map((sat) => {
        const { satid } = sat;
        const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;
        return axios.get(url);
      });

      Promise.all(urls)
        .then((res) => {
          const arr = res.map((sat) => sat.data);
          this.setState({
            isLoading: false,
            isDrawing: true,
          });

          if (!prevState.isDrawing) {
            this.track(arr);
          } else {
            const oHint = document.getElementsByClassName('hint')[0];
            oHint.innerHTML =
              'Please wait for these satellite animation to finish before selection new ones!';
          }
        })
        .catch((e) => {
          console.log('err in fetch satellite position -> ', e.message);
        });
    }
  }

  track = (data) => {
    if (!data[0].hasOwnProperty('positions')) {
      throw new Error('no position data');
    }

    // draw
    const len = data[0].positions.length;
    // const { duration } = this.props.observerData;
    const { context2 } = this.map;

    let now = new Date();
    let i = 0;

    let timer = setInterval(() => {
      let ct = new Date();
      let timePassed = i === 0 ? 0 : ct - now;

      let time = new Date(now.getTime() + 60 * timePassed);

      // clear last track path
      context2.clearRect(0, 0, width, height);

      // display time
      context2.font = 'bold 14px sans-serif';
      context2.fillStyle = '#333';
      context2.textAlign = 'center';
      context2.fillText(d3TimeFormat(time), width / 2, 10);

      // case1: tracking is done
      if (i >= len) {
        clearInterval(timer);
        this.setState({ isDrawing: false });
        const oHint = document.getElementsByClassName('hint')[0];
        oHint.innerHTML = '';
        return;
      }

      // case2: tracking
      data.forEach((sat) => {
        const { info, positions } = sat;
        this.drawSat(info, positions[i]);
      });

      i += 60;
    }, 1000);
  };

  drawSat = (sat, pos) => {
    const { satlongitude, satlatitude } = pos;
    if (!satlongitude || !satlatitude) {
      return;
    }
    const { satname } = sat;
    const nameWithNumber = satname.match(/\d+/g).join('');

    const { projection, context2 } = this.map;
    const xy = projection([satlongitude, satlatitude]);

    context2.fillStyle = this.color(nameWithNumber);
    context2.beginPath();
    context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
    context2.fill();

    context2.font = 'bold 11px sans-serif';
    context2.textAlign = 'center';
    context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
  };

  generateMap = (land) => {
    const projection = geoKavrayskiy7()
      .scale(170)
      .translate([width / 2, height / 2])
      .precision(0.1);

    const graticule = geoGraticule();

    const canvas = d3Select(this.refMap.current)
      .attr('width', width)
      .attr('height', height);

    const canvas2 = d3Select(this.refTrack.current)
      .attr('width', width)
      .attr('height', height);

    let context = canvas.node().getContext('2d');
    let context2 = canvas2.node().getContext('2d');

    let path = geoPath().projection(projection).context(context);

    land.forEach((ele) => {
      context.fillStyle = '#B3DDEF';
      context.strokeStyle = '#000';
      context.globalAlpha = 0.7;
      context.beginPath();
      path(ele);
      context.fill();
      context.stroke();

      context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
      context.beginPath();
      path(graticule());
      context.lineWidth = 0.1;
      context.stroke();

      context.beginPath();
      context.lineWidth = 0.5;
      path(graticule.outline());
      context.stroke();
    });

    this.map = {
      projection: projection,
      graticule: graticule,
      context: context,
      context2: context2,
    };
  };

  render() {
    const { isLoading } = this.state;
    return (
      <div className='map-box'>
        {isLoading ? (
          <div className='spinner'>
            <Spin tip='Loading...' size='large' />
          </div>
        ) : null}
        <canvas className='map' ref={this.refMap} />
        <canvas className='track' ref={this.refTrack} />
        <div className='hint'></div>
      </div>
    );
  }
}

export default WorldMap;
