import { StatusBar } from 'expo-status-bar';
import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button , PermissionsAndroid, Alert, Image} from 'react-native';
import Carpet from "./components/Carpet"
import { BleManager } from 'react-native-ble-plx';
import { render } from 'react-dom';

const manager = new BleManager();
class DeviceListItem extends Component {
  render() {
    return (
      <Text style={styles.device}>{this.props.name}</Text>
    )
  }
}

class DeviceList extends Component {
	constructor(props) {
    	super(props);
    	this.state = {
    		devices: [],
			btnText: "Scan devices"
    	}
		this.manager = new BleManager();
		
	}
	async scanDevices(moduleName = null) {
		this.setState({devices: []});
		this.manager.startDeviceScan(null, null, (error, device) => {
			if(device != null && device.name != null) {
				if(this.state.devices.indexOf(device.name) == -1) {
					console.log("Device: " + device.name)
					this.state.devices.push(device.name);
					this.setState({devices: this.state.devices});
				}
			}
		})
	}
	componentDidMount() {
		this.scanDevices();
	}
	render() {
    	return (
      		<View style={styles.container}>
        		<Text style={styles.header}>Muistijooga</Text>
				<Text style={styles.text}>Vapaat laitteet</Text>
				
				{
					this.state.devices.length == 0 &&
					<Image style={styles.loader} source={require('./assets/loader.gif')} />
				}

				{this.state.devices.map((deviceName, index) => {
        			return (<DeviceListItem key={deviceName} name={deviceName}/>);
      			})}
      		</View>
    	)
	}
}

export default function App() {
  return (
    <DeviceList />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 65
  },
  header: {
    fontSize: 35,
    paddingBottom: 40,
    color: "#009BFF"
  },
  device: {
    borderStyle: "solid",
    borderColor: "#E2E2E2",
    fontSize: 18,
    borderWidth: 1,
    width: "70%",
    textAlign: "center",
    padding: 20,
    color: "#464646",
    marginTop: 15,
    marginBottom: 15
  },
  text: {
	paddingBottom: 25
  },
  loader: {
	width: 40,
	height: 40,
  }
});
