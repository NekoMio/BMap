import logo from './logo.svg';
import React from "react"
import axios from "axios"
import './App.less';
import { Switch, Layout, message, Select, Button } from "antd"
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from 'ol/layer/Tile';
import { transform } from "ol/proj";
import OSM from 'ol/source/OSM';

const { Option } = Select;

const { Header, Content, Sider } = Layout;
class MyMap extends React.Component {
  editmode = 1;
  lastcoord;
  addpointmode = 0;
  addpathmode = 0;
  pointdata = [];
  pathdata = [];
  addpathstart = -1;
  addpathend = -1;
  delpathstart = -1;
  delpathend = -1;
  
  constructor(props) {
    super(props);
    this.state = {pointlist: []};
  }
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
      coord: coordinate
      // id: this.pointdata.length() + 1
    }).then((response) => {
      message.success(`成功添加 ${coordinate}`);
      this.pointdata = response.data;
    }).catch((error) => {
      message.error(error)
    })
  }
  deleteLastOne() {
    axios.post("/api/deletepoint", {
      id: this.pointdata.length()
    }).then((response) => {
      message.success(`成果删除 id ${this.pointdata.length()}`);
      this.pointdata.pop();
    }).catch((error) => {
      message.error(error);
    })
  }
  getPointList() {
    if (this.pointdata.length() === 0) {
      axios.get("/api/getpointlist").then((response) => {
        this.pointdata = response.data
      })
    }
    this.setState({
      pointlist: this.pointdata
    })
  }
  getpathstart(val) {
    this.addpathstart = val.key;
  }
  getpathend(val) {
    this.addpathend = val.key
  }
  
  addPath() {
    if (this.addpathstart === -1 || this.addpathend === -1) {
      return
    }
    else {
      axios.post("/apt/addpath", {
        start: this.addpathstart,
        end: this.addpathend
      })
    }
  }
  getdelpathstart(val) {
    this.delpathstart = val.key;
  }
  getdelpathend(val) {
    this.delpathend = val.key
  }
  deletePath() {
    if (this.delpathstart === -1 || this.delpathend === -1) {
      return
    }
    else {
      axios.post("/apt/delpath", {
        start: this.delpathstart,
        end: this.delpathend
      })
    }
  }

  render(){
    const { pointlist } = this.state;
    let editPart1 = (<div className="edit" style={{marginLeft:"30px"}}>
                      <h1>编辑模块</h1>
                      <p>启动加点模式 <Switch disabled onChange={this.switchAddPointMode} /></p>
                      {/* <p>启动加路径模式 <Switch disabled onChange={this.switchAddPathMode} /></p> */}
                      <br/>
                      <h2>添加路径</h2>
                      <Select
                        id="addpathstart"
                        showSearch
                        style={{ width: 200 }}
                        placeholder="选择路径起点"
                        optionFilterProp="children"
                        onSearch={this.getPointList}
                        onChange={this.getpathstart}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      ></Select>
                      {
                        pointlist.map((item, index) => {
                          <Option key = {index} value = {item}> {item} </Option>
                        })
                      }
                      <Select
                        id="addpathend"
                        showSearch
                        style={{ width: 200 }}
                        placeholder="选择路径终点"
                        optionFilterProp="children"
                        onSearch={this.getPointList}
                        onChange={this.getpathend}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      ></Select>
                      {
                        pointlist.map((item, index) => {
                          <Option key = {index} value = {item}> {item} </Option>
                        })
                      }
                      <Button type="primary" onClick={this.addPath} disabled>添加路径</Button>

                      <br/>
                      <h2>删除路径</h2>
                      <Select
                        id="addpathstart"
                        showSearch
                        style={{ width: 200 }}
                        placeholder="选择路径起点"
                        optionFilterProp="children"
                        onSearch={this.getPointList}
                        onChange={this.getdelpathstart}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      ></Select>
                      {
                        pointlist.map((item, index) => {
                          <Option key = {index} value = {item}> {item} </Option>
                        })
                      }
                      <Select
                        id="addpathend"
                        showSearch
                        style={{ width: 200 }}
                        placeholder="选择路径终点"
                        optionFilterProp="children"
                        onSearch={this.getPointList}
                        onChange={this.getdelpathend}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      ></Select>
                      {
                        pointlist.map((item, index) => {
                          <Option key = {index} value = {item}> {item} </Option>
                        })
                      }
                      <Button type="primary" onClick={this.deletePath} disabled>添加路径</Button>
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
