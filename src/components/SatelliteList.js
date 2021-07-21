import React, { Component } from 'react';
import { Button, Spin, List, Avatar, Checkbox } from 'antd';

import satellite from '../assets/images/satellite.svg';

class SatelliteList extends Component {

  onChange = e => {
    console.log(e.target);
  }

  render() {
    const satList = this.props.satInfo ? this.props.satInfo.above : [];
    const { isLoad } = this.props;

    return (
      <div className="sat-list-box">
        <div className="btn-container">
          <Button
            className="sat-list-btn"
            type='primary'
          >Track on the map</Button>
        </div>
        <hr />
        {
          isLoad ?
            <div className='spin-box'>
              <Spin tip='Loading...' size='large' />
            </div>
            :
            <List
              className='sat-list'
              itemLayout='horizontal'
              dataSource={satList}
              renderItem={item => (
                <List.Item
                  actions={[<Checkbox dataInfo={item} onChange={this.onChange} />]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={satellite} size='large' />}
                    title={<p>{item.satname}</p>}
                    description={`Launch date: ${item.launchDate}`}
                  />
                </List.Item>
              )}
            />
        }
      </div>
    );
  }
}

export default SatelliteList;
