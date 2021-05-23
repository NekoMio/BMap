import logo from './logo.svg';
import React from "react"
import './App.css';
import { Button, Layout } from "antd"
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const { Header, Content, Sider, Footer } = Layout;
class MyMap extends React.Component {
  componentDidMount(){
      var map = new Map({
          view: new View({
            center: [12944596.171207758, 4888630.582496259],
            zoom: 17
          }),
          layers: [
            new TileLayer({
              source: new OSM()
            })
          ],
          target: 'map'
      });
  }

  render(){
      return <div id="map" className="map"></div>
  }

}
function App() {
  return (
    <div className="App">
      <Header>
        BMap
      </Header>
      <Sider className="control">

      </Sider>
      <Content className="mapbox">
        <MyMap/>
      </Content>
    </div>
  );
}

export default App;
