import React, { Component } from 'react';
import axios from 'axios';
import { feature } from 'topojson-client';

import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';

import { WORLD_MAP_URL } from '../constants';

const width = 960;
const height = 600;

class WorldMap extends Component {
  constructor() {
    super();
    this.refMap = React.createRef();
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

  generateMap = (land) => {
    const projection = geoKavrayskiy7()
      .scale(170)
      .translate([width / 2, height / 2])
      .precision(0.1);

    const graticule = geoGraticule();

    const canvas = d3Select(this.refMap.current)
      .attr('width', width)
      .attr('height', height);

    let context = canvas.node().getContext('2d');

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
  };

  render() {
    return (
      <div className='map-box'>
        <canvas className='map' ref={this.refMap} />
      </div>
    );
  }
}

export default WorldMap;
