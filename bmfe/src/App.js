import React from "react"
import axios from "axios"
import './App.less';
import { Switch, Layout, message, Select, Button, InputNumber } from "antd"
import { SwapOutlined } from "@ant-design/icons"
import "ol/ol.css";
import { Map, View, Feature } from "ol";
import TileLayer from 'ol/layer/Tile';
// import { transform } from "ol/proj";
import { Point, LineString } from "ol/geom";
import "ol/style";
import OSM from 'ol/source/OSM';
import { Vector as sourceVector } from 'ol/source'
import { Vector as LayerVector } from 'ol/layer'
import { Fill, Icon, Stroke, Style } from 'ol/style';
import { Circle } from 'ol/style';
import { Select as olSelect } from "ol/interaction";
import { pointerMove } from 'ol/events/condition';
// const { Option } = Select;


const { Header, Content, Sider } = Layout;

// let editmode = 1;
// let addpointmode = 0;
// let pointdata = [];
// let pathdata = [];
// let addpathstart = -1;
// let addpathend = -1;
// let navstart = -1;
// let navend = -1;
// let addpathcap = 1;
// let PointLayer;
// let deletepointmode = 0;
// let deletepathmode = 0;
// let navpartstartbutton = "请选择起点";
// let navpartendbutton = "请选择终点";
// let choosenavstartmode = 0;
// let choosenavendmode = 0;
// let map;
// let pointFeatures;

class MyMap extends React.Component {
  editmode = 1;
  addpointmode = 0;
  pointdata = [];
  pathdata = [];
  addpathstart = -1;
  addpathend = -1;
  navstart = -1;
  navend = -1;
  addpathcap = 1;
  PointLayer;
  lineselect = 0;
  deletepointmode = 0;
  deletepathmode = 0;
  navpartstartbutton = "请选择起点";
  navpartendbutton = "请选择终点";
  choosenavstartmode = 0;
  choosenavendmode = 0;
  map;
  navusecap = 1;
  pointFeatures;
  buptmaincampus = new View({
    center: [12952250, 4860150],
    zoom: 16.61
  });
  buptshahecampus = new View({
    center: [12944600, 4888600],
    zoom: 16.6
  });
  // addpathmodechecked = false;
  // deletepathmodechecked = false;
  optionsWithDisabled = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Pear', value: 'Pear' },
    { label: 'Orange', value: 'Orange', disabled: true },
  ];
  constructor(props) {
    super(props);
    this.state = {
      pointlist: [],
      navpartstartbutton: this.navpartstartbutton,
      navpartendbutton: this.navpartendbutton,
      navstartbuttontype: "primary",
      navendbuttontype: "default",
      navstartbuttondisabled: false,
      navendbuttondisabled: false
    };
  }
  componentDidMount = () => {
    this.map = new Map({
      view: this.buptmaincampus,
      // new View({
      //   // center: transform([116.28218, 40.15623],'EPSG:4326', 'EPSG:3857'),
      //   center: [12944596.171207758, 4888630.582496259],
      //   zoom: 17
      // }),
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      target: 'map'
    });
    this.showData();
    this.map.on('singleclick', (evt) => {
      let coordinate = evt.coordinate;
      if (this.addpointmode) {
        this.addPoint(coordinate)
      }
      // console.log(coordinate);
    })
    let hoverselect = new olSelect({
      condition: pointerMove,
      filter: (feature, layer) => {
        return this.lineselect ? true : layer === this.PointLayer;
      }
    });
    let clickselect = new olSelect({
      filter: (feature, layer) => {
        return this.lineselect ? true : layer === this.PointLayer;
      }
    });
    this.map.addInteraction(hoverselect);
    this.map.addInteraction(clickselect);
    hoverselect.on("select", (e) => {

    })
    clickselect.on("select", (e) => {
      // console.log(e.target.getFeatures().getLength());
      if (e.target.getFeatures().getLength() > 0) {
        console.log(e.target.getFeatures().item(0).get("name"))
        if (this.deletepointmode === 1) {
          this.deletePoint(e.target.getFeatures().item(0).get("name"));
          this.PointLayer.getSource().removeFeature(e.target.getFeatures().item(0));
          return;
        }
        if (this.addpathmode === 1) {
          if (this.addpathstart === -1) {
            this.addpathstart = e.target.getFeatures().item(0).get("name");
            return;
          }
          if (this.addpathend === -1) {
            this.addpathend = e.target.getFeatures().item(0).get("name");
            this.addPath(this.addpathstart, this.addpathend);
            this.addpathstart = this.addpathend = -1;
          }
        }
        if (this.deletepathmode === 1) {
          console.log(e.target.getFeatures().item(0).get("start"), e.target.getFeatures().item(0).get("end"))
          this.deletePath(e.target.getFeatures().item(0).get("start"), e.target.getFeatures().item(0).get("end"));
          return;
        }
        if (this.choosenavstartmode === 1) {
          this.navstart = e.target.getFeatures().item(0).get("name");
          this.navpartstartbutton = e.target.getFeatures().item(0).get("name").toString();
          this.chooseNavStartModeOff();
          return;
        }
        if (this.choosenavendmode === 1) {
          this.navend = e.target.getFeatures().item(0).get("name");
          this.navpartendbutton = e.target.getFeatures().item(0).get("name").toString();
          this.chooseNavEndModeOff();
          return;
        }
      }
    })
  }
  switchSelectPathMode = (checked) => {
    this.lineselect = checked;
  }
  showData = () => {
    axios.get("/api/getpointlist").then((response) => {
      this.pointdata = response.data;
      // console.log(pointdata);
      this.pointFeatures = new sourceVector()
      for (let i in this.pointdata) {
        let feature = new Feature({
          geometry: new Point(this.pointdata[i].coord),
          name: this.pointdata[i].id
        });
        feature.setStyle(new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({ color: '#ff0000' }),
            stroke: new Stroke({ color: 'rgba(0,0,0,1)' })
          }),
        }));
        this.pointFeatures.addFeatures([feature]);
      }
      this.PointLayer = new LayerVector({
        source: this.pointFeatures
      })
      this.setState({
        pointlist: this.pointdata
      })
      this.map.addLayer(this.PointLayer)
    }).then(() => {
      axios.get("/api/getpath").then((response) => {
        this.pathdata = response.data;
        console.log(this.pathdata);
        for (let i in this.pathdata) {
          let start = this.pointdata.find(x => x.id === this.pathdata[i][0]);
          if (start === undefined) continue;
          let end = this.pointdata.find(x => x.id === this.pathdata[i][1]);
          if (end === undefined) continue;
          let line = new LineString([start.coord, end.coord]);
          let PathLayer = new LayerVector({
            source: new sourceVector({
              features: [
                new Feature({ 
                  geometry: line, 
                  start: this.pathdata[i][0],
                  end: this.pathdata[i][1]
                })
              ]
            }),
            style: new Style({
              stroke: new Stroke({
                width: 6,
                color: "#00ccff",
                lineDash: [0.1, 10]
              })
            })
          });
          this.map.addLayer(PathLayer);
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
      this.addpointmode = true;
    } else {
      this.addpointmode = false;
    }
  }
  switchDeletePointMode = (checked) => {
    if (checked)
      this.deletepointmode = 1;
    else
      this.deletepointmode = 0;
  }
  addPoint = (coordinate) => {
    axios.post("/api/addpoint", {
      coord: coordinate
      // id: pointdata.length() + 1
    }).then((response) => {
      console.log(this.pointdata);
      message.success(`成功添加 ${coordinate}`);
      this.pointdata.push({
        coord: coordinate,
        id: response.data
      });
      let feature = new Feature({
        geometry: new Point(coordinate),
        name: response.data
      });
      feature.setStyle(new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: '#00ccff' }),
          stroke: new Stroke({ color: 'rgba(0,0,0,1)' })
        }),
      }));
      this.pointFeatures.addFeatures([feature]);
      // console.log(response.data);
      this.setState({
        pointlist: this.pointdata
      })
    }).catch((error) => {
      message.error(error)
    })
  }
  deletePoint = (id) => {
    axios.post("/api/deletepoint", {
      id: id
    }).then((response) => {
      message.success(`成功删除删除 id ${id}`);
      // this.pointdata = response.data;
      this.pointdata.splice(this.pointdata.findIndex(x => x.id === id), 1);
      // pointdata.pop();
    }).catch((error) => {
      message.error(error);
    })
  }
  // getPointList = () => {
  //   if (pointdata.length === 0) {
  //     axios.get("/api/getpointlist").then((response) => {
  //       pointdata = response.data
  //     })
  //   }
  //   this.setState({
  //     pointlist: pointdata
  //   })
  // }
  getpathstart = (val) => {
    // console.log(val);
    this.addpathstart = val;
  }
  getpathend = (val) => {
    this.addpathend = val
  }
  addpathcapchange = (val) => {
    this.addpathcap = val;
  }
  switchAddPathMode = (checked) => {
    if (checked)
      this.addpathmode = 1;
    else
      this.addpathmode = 0;
  }
  addPath = (start, end) => {
    if (start === -1 || end === -1) {
      return
    }
    else {
      console.log(start, end);
      // return
      // let coord1 = this.pointdata.find(x => x.id === start);
      // let coord2 = this.pointdata.find(x => x.id === end);
      // let len = (coord1[0] - coord2[0]) * (coord1[0] - coord2[0]) + (coord1[1] - coord2[1]) * (coord1[1] - coord2[1]);
      // console.log(coord1.x);
      axios.post("/api/addpath", {
        start: start,
        end: end,
        // len: len,
        cap: this.addpathcap
      }).then((response) => {
        message.success("添加成功")
      }).catch((error) => {
        message.error(error)
      })
      // let line = new LineString([coord1, coord2]);
      // let PathLayer = new LayerVector({
      //   source: new sourceVector({
      //     features: [
      //       new Feature({ 
      //         geometry: line, 
      //         start: start,
      //         end: end
      //       })
      //     ]
      //   }),
      //   style: new Style({
      //     stroke: new Stroke({
      //       width: 6,
      //       color: "#00ccff",
      //       lineDash: [0.1, 10]
      //     })
      //   })
      // });
      // this.map.addLayer(PathLayer);
    }
  }
  switchDeletePathMode = (checked) => {
    if (checked)
      this.deletepathmode = 1
    else
    this.deletepathmode = 0;
  }
  deletePath = (delpathstart, delpathend) => {
    axios.post("/api/delpath", {
      start: delpathstart,
      end: delpathend
    }).then((response) => {
      message.success("删除成功")
    }).catch((error) => {
      message.error(error)
    })
  }

  chooseNavStartModeOn = () => {
    if (this.choosenavendmode === 1)
      this.chooseNavEndModeOff();
    message.info("请在地图上选择起点")
    this.choosenavstartmode = 1;
    this.setState({
      navstartbuttontype: "default",
      navstartbuttondisabled: true,
      navpartstartbutton: "选择中",
    });
  }
  chooseNavStartModeOff = () => {
    this.choosenavstartmode = 0;
    this.setState({
      navstartbuttontype: "default",
      navstartbuttondisabled: false,
      navpartstartbutton: this.navpartstartbutton,
    });
  }
  chooseNavEndModeOn = () => {
    if (this.choosenavstartmode === 1)
      this.chooseNavStartModeOff();
    message.info("请在地图上选择终点")
    this.choosenavendmode = 1;
    this.setState({
      navendbuttontype: "default",
      navendbuttondisabled: true,
      navpartendbutton: "选择中",
    });
  }
  chooseNavEndModeOff = () => {
    this.choosenavendmode = 0;
    this.setState({
      navendbuttontype: "default",
      navendbuttondisabled: false,
      navpartendbutton: this.navpartendbutton,
    });
  }
  switchNavStartAndEnd = () => {
    // console.log(map)
    if (this.navstart === this.navend) {
      return
    }
    [this.navstart, this.navend] = [this.navend, this.navstart];
    let navpartstartbutton = this.state.navpartendbutton;
    let navpartendbutton = this.state.navpartstartbutton;
    this.setState({
      navpartstartbutton: navpartstartbutton,
      navpartendbutton: navpartendbutton,
    })
  }
  useCap = (checked) => {
    if (checked)
      this.navusecap = 1;
    else
      this.navusecap = 0;
  }
  ReRender = () => {

  }
  startDynamicNav = () => {
    this.starttime = 
    this.timerID = setInterval(
      () => this.ReRender(),
      100
    );
  }
  endDynamicNav = () => {
    clearInterval(this.timerID);
  }
  
  getNavPath = () => {
    // console.log(navstart, navend);
    // return;
    if (this.navstart === -1) {
      message.error("请选择起点");
      return;
    }
    if (this.navend === -1) {
      message.error("请选择终点");
      return;
    }
    axios.post("/api/getnavpath", {
      start: this.navstart,
      end: this.navend,
      option: this.navusecap
    }).then((response) => {
      let navdata = response.data;
      let linepoint = [];
      for (let i in navdata) {
        linepoint.push(this.pointdata.find(x => x.id === navdata[i]).coord);
      }
      this.linestring = new LineString(linepoint);
      let linestringfeature = new Feature({
        geometry: this.linestring,
      });
      let endmakerfeature = new Feature({
        geometry: new Point(linepoint[linepoint.length - 1]),
      });
      let navLayer = new LayerVector({
        source: new sourceVector({
          features: [linestringfeature]
        }),
        style: new Style({
          stroke: new Stroke({
            width: 20,
            color: "#00ccff"
          })
        })
      });
      let navLayer = new LayerVector({
        source: new sourceVector({
          features: [endmakerfeature]
        }),
        style: new Style({
          image: new Icon({
            src: "https://cdn.jsdelivr.net/gh/jonataswalker/map-utils@master/images/marker.png",
            anchor: [0.5, 1],
            opacity: 0.7,
            rotateWithView: false
          })
        })
      });
      this.map.addLayer(navLayer);
    }).catch((error) => {
      message.error(error);
    })
  }
  printEdit = () => {
    message.info(this.editmode);
  }
  render() {
    const { navpartstartbutton, navpartendbutton, navstartbuttontype, navendbuttontype, navstartbuttondisabled, navendbuttondisabled } = this.state;
    // console.log(pointlist);
    let editPart1 = (<div className="edit" style={{ marginLeft: "30px" }}>
      <h1>编辑模块</h1>
      <p>启动加点模式 <Switch onChange={this.switchAddPointMode} /></p>
      <p>启动删点模式 <Switch onChange={this.switchDeletePointMode} /> </p>
      {/* <p>启动加路径模式 <Switch disabled onChange={this.switchAddPathMode} /></p> */}
      {/* <br /> */}
      {/* <h2>添加路径</h2>
      <Select
        id="addpathstart"
        showSearch
        style={{ width: 200 }}
        placeholder="选择路径起点"
        optionFilterProp="children"
        // onSearch={this.getPointList}
        onChange={this.getpathstart}
        // filterOption={false}
        filterOption={(input, option) =>
          // console.log(option.props)
          option.props.children.toString().indexOf(input.toString()) >= 0
        }
      >
        {
          pointlist.map((item, index) => {
            return <Option key={item.id} value={item.id}>{item.id}</Option>
          })
        }
      </Select>

      <Select
        id="addpathend"
        showSearch
        style={{ width: 200 }}
        placeholder="选择路径终点"
        optionFilterProp="children"
        // onSearch={this.getPointList}
        onChange={this.getpathend}
        // filterOption={false}
        filterOption={(input, option) =>
          option.props.children.toString().indexOf(input.toString()) >= 0
        }
      >
        {
          // console.log(pointlist)
          pointlist.map((item, index) => {
            return <Option key={item.id} value={item.id}>{item.id}</Option>
          })
        }
      </Select>*/
      <InputNumber
        style={{
          width: 200,
        }}
        defaultValue="1"
        min="1"
        max="10"
        step="0.01"
        onChange={this.addpathcapchange}
        stringMode
      />
      /*<Button type="primary" onClick={this.addPath}>添加路径</Button> */}
      <p>启动添加路径模式 <Switch onChange={this.switchAddPathMode} /> </p>
      <br />
      <p>是否能选择边 <Switch onChange={this.switchSelectPathMode} /></p>
      <p>启动删路径模式 <Switch onChange={this.switchDeletePathMode} /> </p>
      {/* <h2>删除路径</h2>
      <Select
        id="addpathstart"
        showSearch
        style={{ width: 200 }}
        placeholder="选择路径起点"
        optionFilterProp="children"
        // onSearch={this.getPointList}
        onChange={this.getdelpathstart}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {
          pointlist.map((item, index) => {
            return <Option key={item.id} value={item.id}> {item.id} </Option>
          })
        }
      </Select>
      <Select
        id="addpathend"
        showSearch
        style={{ width: 200 }}
        placeholder="选择路径终点"
        optionFilterProp="children"
        // onSearch={this.getPointList}
        onChange={this.getdelpathend}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {
        pointlist.map((item, index) => {
          return <Option key={item.id} value={item.id}> {item.id} </Option>
        })
      }
      </Select>
      <Button type="primary" onClick={this.deletePath} disabled>添加路径</Button> */}
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
            this.editmode === 1 ? editPart1 : null
          }
          {/* <Radio.Group
          options={optionsWithDisabled}
          onChange={this.onChange4}
          value={value4}
          optionType="button"
          buttonStyle="solid"
          /> */}
          <div className="navPart" style={{ marginLeft: "30px" }}>
            <Button type={navstartbuttontype} disabled={navstartbuttondisabled} onClick={this.chooseNavStartModeOn}>{navpartstartbutton}</Button>
            &nbsp;&nbsp;<Button type="primary" shape="circle" icon={<SwapOutlined />} onClick={this.switchNavStartAndEnd}></Button>&nbsp;&nbsp;
            <Button type={navendbuttontype} disabled={navendbuttondisabled} onClick={this.chooseNavEndModeOn}>{navpartendbutton}</Button>&nbsp;&nbsp;&nbsp;&nbsp;
            考虑拥堵<Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked onClick={this.useCap}/>
            <Button onClick={this.getNavPath}>开始导航</Button>
          </div>
          <Button onClick={this.printEdit}>测试</Button>
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