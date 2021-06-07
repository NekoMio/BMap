import logo from './logo.svg';
import React from "react"
import axios from "axios"
import './App.less';
import { Switch, Layout, message, Select, Button } from "antd"
import { SwapOutlined } from "@ant-design/icons"
import "ol/ol.css";
import { Map, View, Feature } from "ol";
import TileLayer from 'ol/layer/Tile';
import { transform } from "ol/proj";
import { Circle, Point, LineString } from "ol/geom";
import "ol/style";
import OSM from 'ol/source/OSM';
import { Vector as sourceVector } from 'ol/source'
import { Vector as LayerVector } from 'ol/layer'
import { Fill, Icon, Stroke, Style } from 'ol/style';
import { Select as olSelect } from "ol/interaction";
import { pointerMove } from 'ol/events/condition';
const { Option } = Select;


const { Header, Content, Sider } = Layout;

let editmode = 1;
let addpointmode = 0;
let pointdata = [];
let pathdata = [];
let addpathstart = -1;
let addpathend = -1;
let delpathstart = -1;
let delpathend = -1;
let navstart = -1;
let navend = -1;
let navpartstartbutton = "请选择起点";
let navpartendbutton = "请选择终点";
let choosenavstartmode = 0;
let choosenavendmode = 0;
let map;

class MyMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pointlist: [],
      navpartstartbutton: navpartstartbutton,
      navpartendbutton: navpartendbutton,
      navstartbuttontype: "primary", 
      navendbuttontype: "default", 
      navstartbuttondisabled: false, 
      navendbuttondisabled: false
    };

  }
  componentDidMount() {
    map = new Map({
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
    // this.showData();
    map.on('singleclick', (evt) => {
      let coordinate = evt.coordinate;
      if (addpointmode) {
        this.addPoint(coordinate)
      }
      console.log(coordinate);
    })
    let hoverselect = new olSelect({ condition: pointerMove });
    let clickselect = new olSelect();
    map.addInteraction(hoverselect);
    map.addInteraction(clickselect);
    hoverselect.on("select", (e) => {

    })
    clickselect.on("select", (e) => {
      console.log(e.target.getFeatures())
    })
  }

  showData = () => {
    axios.get("/api/getpointlist").then((response) => {
      pointdata = response.data;
      let sourceFeatures = new sourceVector()
      for (let i in pointdata) {
        let feature = new Feature({
          geometry: new Point(pointdata[i].coord),
          name: pointdata[i].id
        });
        feature.setStyle(new Style({
          image: new Circle({
            radius: 6,
            fill: Fill({ color: "rgba(255,0,0,1)" }),
            stroke: Stroke({ color: "rgba(0,0,0,1)" })
          }),
        }));
        sourceFeatures.addFeatures([feature]);
      }
      let layerVector = new LayerVector({
        source: sourceFeatures
      })
      map.addLayer(layerVector)
    }).then(() => {
      axios.get("/api/getpath").then((response) => {
        pathdata = response.data;
        for (let i in pathdata) {
          let start = pointdata.find(x => x.id === pathdata[i].start).coord;
          let end = pointdata.find(x => x.id === pathdata[i].end).coord;
          let line = new LineString([start, end]);
          let PathLayer = new LayerVector({
            source: new sourceVector({
              features: [
                new Feature({ geometry: line })
              ]
            }),
            style: [
              new Stroke({
                width: 3,
                color: "#cc0000",
                lineDash: [0.1, 5]
              })
            ]
          });
          map.addLayer(PathLayer);
        }
      }).catch((error) => {
        message.error(error)
      })
    }).catch((error) => {
      message.error(error)
    })
  }

  switchAddPointMode = (checked) => {
    // showPointForm();
    if (checked) {
      addpointmode = true;
    } else {
      addpointmode = false;
    }
  }
  addPoint = (coordinate) => {
    axios.post("/api/addpoint", {
      coord: coordinate
      // id: pointdata.length() + 1
    }).then((response) => {
      message.success(`成功添加 ${coordinate}`);
      pointdata = response.data;
    }).catch((error) => {
      message.error(error)
    })
  }
  deleteLastOne = () => {
    axios.post("/api/deletepoint", {
      id: pointdata.length()
    }).then((response) => {
      message.success(`成果删除 id ${pointdata.length()}`);
      pointdata.pop();
    }).catch((error) => {
      message.error(error);
    })
  }
  getPointList = () => {
    if (pointdata.length() === 0) {
      axios.get("/api/getpointlist").then((response) => {
        pointdata = response.data
      })
    }
    this.setState({
      pointlist: pointdata
    })
  }
  getpathstart = (val) => {
    addpathstart = val.key;
  }
  getpathend = (val) => {
    addpathend = val.key
  }

  addPath = () => {
    if (addpathstart === -1 || addpathend === -1) {
      return
    }
    else {
      axios.post("/api/addpath", {
        start: addpathstart,
        end: addpathend
      })
    }
  }
  getdelpathstart = (val) => {
    delpathstart = val.key;
  }
  getdelpathend = (val) => {
    delpathend = val.key
  }
  deletePath = () => {
    if (delpathstart === -1 || delpathend === -1) {
      return
    }
    else {
      axios.post("/api/delpath", {
        start: delpathstart,
        end: delpathend
      }).then((response) => {
        message.success("删除成功")
      }).catch((error) => {
        message.error(error)
      })
    }
  }

  chooseNavStartModeOn = () => {
    if (choosenavendmode === 1)
      this.chooseNavEndModeOff();
    message.info("请在地图上选择起点")
    choosenavstartmode = 1;
    this.setState({
      navstartbuttontype: "default",
      navstartbuttondisabled: true,
      navpartstartbutton: "选择中",
    });
  }
  chooseNavStartModeOff = () => {
    choosenavstartmode = 0;
    this.setState({
      navstartbuttontype: "default",
      navstartbuttondisabled: false,
      navpartstartbutton: navpartstartbutton,
    });
  }
  chooseNavEndModeOn = () => {
    if (choosenavstartmode === 1)
      this.chooseNavStartModeOff();
    message.info("请在地图上选择终点")
    choosenavendmode = 1;
    this.setState({
      navendbuttontype: "default",
      navendbuttondisabled: true,
      navpartendbutton: "选择中",
    });
  }
  chooseNavEndModeOff = () => {
    choosenavendmode = 0;
    this.setState({
      navendbuttontype: "default",
      navendbuttondisabled: false,
      navpartendbutton: navpartendbutton,
    });
  }
  switchNavStartAndEnd = () => {
    // console.log(map)
    if (navstart === navend) {
      return
    }
    [navstart, navend] = [navend, navstart];
    let navpartstartbutton = this.state.navpartendbutton;
    let navpartendbutton = this.state.navpartstartbutton;
    this.setState({
      navpartstartbutton: navpartstartbutton,
      navpartendbutton: navpartendbutton,
    })
  }


  getNavPath = () => {
    // console.log(navstart, navend);
    // return;
    if (navstart === -1) {
      message.error("请选择起点");
      return;
    }
    if (navend === -1) {
      message.error("请选择终点");
      return;
    }
    axios.post("/api/getnavpath", {
      start: navstart,
      end: navend
    }).then((response) => {
      let navdata = response.data;
      let linepoint = [];
      for (let i in navdata) {
        linepoint.push(pointdata.find(x => x.id === navdata[i]).coord);
      }
      let linestring = new LineString(linepoint);
      let linestringfeature = new Feature({
        geometry: linestring,
        style: new Style({
          stroke: new Stroke({
            width: 5,
            color: "#00ccff"
          })
        })
      });
      let endmakerfeature = new Feature({
        geometry: new Point(linepoint[linepoint.length - 1]),
        style: new Style({
          image: new Icon({
            src: "https://cdn.jsdelivr.net/gh/jonataswalker/map-utils@master/images/marker.png",
            anchor: [0.5, 1],
            opacity: 0.7,
            rotateWithView: false
          })
        })
      });
      let navLayer = new LayerVector({
        source: new sourceVector({
          features: [linestringfeature, endmakerfeature]
        })
      });
      map.addLayer(navLayer);
    }).catch((error) => {
      message.error(error);
    })
  }
  render() {
    const { pointlist, navpartstartbutton, navpartendbutton, navstartbuttontype, navendbuttontype, navstartbuttondisabled, navendbuttondisabled } = this.state;
    let editPart1 = (<div className="edit" style={{ marginLeft: "30px" }}>
      <h1>编辑模块</h1>
      <p>启动加点模式 <Switch disabled onChange={this.switchAddPointMode} /></p>
      {/* <p>启动加路径模式 <Switch disabled onChange={this.switchAddPathMode} /></p> */}
      {/* <br /> */}
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
          <Option key={item.id} value={item.id}> {item.id} </Option>
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
          <Option key={index} value={item}> {item} </Option>
        })
      }
      <Button type="primary" onClick={this.addPath} disabled>添加路径</Button>

      <br />
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
          <Option key={index} value={item}> {item} </Option>
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
          <Option key={item.id} value={item.id}> {item.id} </Option>
        })
      }
      <Button type="primary" onClick={this.deletePath} disabled>添加路径</Button>
    </div>);
    // let navPart = (
    //   <div className="navPart" style={{ marginLeft: "30px" }}>
    //     <h2>导航模块</h2>
    //     { navpartstartbutton }
    //     &nbsp;&nbsp;<Button type="primary" shape="circle" icon={<SwapOutlined />} onClick={this.switchNavStartAndEnd}></Button>&nbsp;&nbsp;
    //     { navpartendbutton }&nbsp;&nbsp;&nbsp;&nbsp;
    //     { navpartpathbutton }
    //   </div>
    // )
    return (
      <div className="App">
        <Header>
          BMap
        </Header>
        <Sider className="control">
          {
            editmode === 1 ? editPart1 : null
          }
          <div className="navPart" style={{ marginLeft: "30px" }}>
            <Button type={navstartbuttontype} disabled={navstartbuttondisabled} onClick={this.chooseNavStartModeOn}>{navpartstartbutton}</Button>
            &nbsp;&nbsp;<Button type="primary" shape="circle" icon={<SwapOutlined />} onClick={this.switchNavStartAndEnd}></Button>&nbsp;&nbsp;
            <Button type={navendbuttontype} disabled={navendbuttondisabled} onClick={this.chooseNavEndModeOn}>{navpartendbutton}</Button>&nbsp;&nbsp;&nbsp;&nbsp;
            <Button onClick={this.getNavPath}>开始导航</Button>
          </div>
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
