import React, { Component } from 'react';
import { Row, Col } from 'antd';
import axios from 'axios';

import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';

import { SAT_API_KEY, STARLINK_CATEGORY, NEARBY_SATELLITE } from '../constants';

class Main extends Component {
  constructor() {
    super();
    this.state = {
      settings: null,
      satInfo: null,
      isLoadingList: false
    };
  }

  showNearbySatellite = setting => {
    this.setState({ settings: setting });
    this.fetchSatellite(setting);
  }

  fetchSatellite = setting => {
    // step1: abstract api paras from the setting
    const { latitude, longitude, elevation, altitude } = setting;
    // step2: send request to fetch data
    const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
    // step3: add spin
    this.setState({ isLoadingList: true });

    axios.get(url)
      .then(response => {
        console.log(response);
        // step4: remove spin
        this.setState(
          {
            satInfo: response.data,
            isLoadingList: false
          });
      })
      .catch(error => {
        console.log('err in fetch satellite -> ', error);
        // step4: remove spin
        this.setState({ isLoadingList: false });
      })
  }

  render() {
    const { satInfo, isLoadingList } = this.state;
    return (
      <Row className='main'>
        <Col span={8} className='left-side'>
          <SatSetting onShow={this.showNearbySatellite} />
          <SatelliteList satInfo={satInfo} isLoad={isLoadingList} />
        </Col>
        <Col span={16} className='right-side'>
          right
        </Col>
      </Row>
    );
  }
}

export default Main;
