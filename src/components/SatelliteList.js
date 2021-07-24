import React, { Component } from 'react';
import { Button, Spin, List, Avatar, Checkbox } from 'antd';

import satellite from '../assets/images/satellite.svg';

class SatelliteList extends Component {
  constructor() {
    super();
    this.state = {
      selected: [],
    };
  }

  onShowSatMap = () => {
    this.props.onShowMap(this.state.selected);
  };

  onChange = (e) => {
    // get sat info and check status
    const { dataInfo, checked } = e.target;
    const { selected } = this.state;

    // add or remove the sat to selected sateList
    const list = this.addOrRemove(dataInfo, checked, selected);

    // setState -> selected
    this.setState({ selected: list });
  };

  addOrRemove = (item, status, list) => {
    const found = list.some((entry) => entry.satid === item.satid);

    // Case1: checked
    // item not in list -> add
    // item in list -> do nothing
    if (status && !found) {
      list = [...list, item];
    }

    // Case2: unchecked
    // item not in list -> do nothing
    // item in list -> remove
    if (!status && found) {
      list = list.filter((entry) => entry.satid !== item.satid);
    }
    return list;
  };

  render() {
    const satList = this.props.satInfo ? this.props.satInfo.above : [];
    const { isLoad } = this.props;

    return (
      <div className='sat-list-box'>
        <div className='btn-container'>
          <Button
            className='sat-list-btn'
            type='primary'
            onClick={this.onShowSatMap}
          >
            Track on the map
          </Button>
        </div>
        <hr />
        {isLoad ? (
          <div className='spin-box'>
            <Spin tip='Loading...' size='large' />
          </div>
        ) : (
          <List
            className='sat-list'
            itemLayout='horizontal'
            dataSource={satList}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Checkbox dataInfo={item} onChange={this.onChange} />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={satellite} size='large' />}
                  title={<p>{item.satname}</p>}
                  description={`Launch date: ${item.launchDate}`}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    );
  }
}

export default SatelliteList;
