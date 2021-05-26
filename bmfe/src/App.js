import logo from './logo.svg';
import React from "react"
import axios from "axios"
import './App.less';
import { Switch, Layout, message } from "antd"
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from 'ol/layer/Tile';
import { transform } from "ol/proj";
import OSM from 'ol/source/OSM';

const { Header, Content, Sider } = Layout;
class MyMap extends React.Component {
  editmode = 1;
  lastcoord;
  addpointmode = 0;
  addpathmode = 0;
  pointdata = [];
  pathdata = [];
  componentDidMount(){
      var map = new Map({
          view: new View({
            // center: transform([116.28218, 40.15623],'EPSG:4326', 'EPSG:3857'),
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
      map.on('singleclick', (evt) => {
        let coordinate = evt.coordinate;
        if (this.addpointmode) {
          this.addPoint(coordinate)
        }
        if (this.addpathmode) {
          this.addPath(coordinate)
        }
        console.log(coordinate);
      })
  }
  
  switchAddPointMode(checked) {
    // showPointForm();
    if (checked) {
      this.addpointmode = true;
    } else {
      this.addpointmode = false;
    }
  }
  addPoint(coordinate) {
    axios.post("/api/addpoint", {
      coord: coordinate,
      id: this.pointdata.length() + 1
    }).then((response)=> {
      message.success(`成功添加 id: ${this.pointdata.length() + 1} ${coordinate}`);
    }).catch((error) => {
      message.error(error)
    })
  }
  deletePoint() {

  }

  switchAddPathMode(checked) {
    if (checked) {
      this.addpathmode = true;
    } else {
      this.addpathmode = false;
    }
  }
  addPath() {

  }
  deletePath() {

  }

  render(){
    let editPart1 = (<div className="edit" style={{marginLeft:"30px"}}>
                      <h1>编辑模块</h1>
                      <p>启动加点模式 <Switch disabled onChange={this.switchAddPointMode} /></p>
                      <p>启动加路径模式 <Switch disabled onChange={this.switchAddPathMode} /></p>
                    </div>)
    return (
      <div className="App">
        <Header>
          BMap
        </Header>
        <Sider className="control">
          {
            this.editmode === 1 ? editPart1 : null
          }
        </Sider>
        <Content className="mapbox">
          <div id="map" className="map"></div>
        </Content>
      </div>
    )
  }

}
function App() {
  return (
    <MyMap />
    
  );
}

export default App;
