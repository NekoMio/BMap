import React from "react"
import axios from "axios"
import './App.less';
import { Select, Switch, Layout, message, Radio, Button, InputNumber, Modal, List, Input, Dropdown, Menu } from "antd"
import { SwapOutlined, UserOutlined, WindowsFilled } from "@ant-design/icons"
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
import { getKeyThenIncreaseKey } from "antd/lib/message";
const { Option } = Select;


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

  addpointmode = 0;
  pointdata = [];
  pathdata = [];

  addpathstart = -1;
  addpathend = -1;
  navstart = -1;
  navend = -1;
  addpathcap = 1.5;
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
  dynamicpause = false;
  linestringfeature;
  pointFeatures;
  selffeature;
  selflayer;
  endtagLayer;
  bikemode = 0;
  gobymode = 0;
  gobyaddmode = 1;
  gobydeletemode = 0;
  gobylist = [];
  startpos = undefined;
  addbuildingmode = 0;
  addbuildinglist = [];
  bikeeditmode = 0;
  navtype;
  searchbuildselect;
  noworder;
  campusview = [
    new View({
      center: [12944600, 4888600],
      zoom: 16.6
    }),
    new View({
      center: [12952250, 4860150],
      zoom: 16.61
    })
  ]
  // addpathmodechecked = false;
  // deletepathmodechecked = false;
  constructor(props) {
    super(props);
    this.state = {
      pointlist: [],
      vposlist: [],
      vnavmode: 0,
      editmode: 0,
      buildingdata: [],
      addbuildinginfo: "添加一个建筑物",
      getnavmodalvisable: false,
      buildinfovisible: false,
      addbuildingvisible: false,
      navdynamicstart: false,
      navdynamicend: true,
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
      view: this.campusview[0],
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
        return;
      }
      if (this.addbuildingmode === 1) {
        console.log(coordinate);
        this.addbuildinglist.push(coordinate);
        this.setState({
          addbuildinginfo: "确定"
        })
        return;
      }
      if (this.choosenavstartmode === 1) {
        axios.post("/api/getnearestpoint", {
          point: coordinate
        }).then((response) => {
          this.navstart = response.data;
          this.navpartstartbutton = response.data.toString();
          this.chooseNavStartModeOff();
          this.showpoint(response.data);
        })
        return;
      }
      if (this.choosenavendmode === 1) {
        axios.post("/api/getnearestpoint", {
          point: coordinate
        }).then((response) => {
          this.navend = response.data;
          this.navpartendbutton = response.data.toString();
          this.chooseNavEndModeOff();
          this.showpoint(response.data);
        })
        return;
      }
      if (this.gobymode === 1) {
        if (this.gobyaddmode === 1) {
          axios.post("/api/getnearestpoint", {
            point: coordinate
          }).then((response) => {
            this.gobylist.push(response.data);
            // console.log(this.gobylist);
            // this.navpartendbutton = response.data.toString();
            // this.chooseNavEndModeOff();
            this.showpoint(response.data);
          })
        }
      }
      if (this.searchbuildselect === 1) {
        axios.post("/api/getbuildings", {
          point: coordinate // 这个是[x,y]的数组
        }).then((response) => {
          this.setState({
            buildingdata: response.data
          })
          this.searchbuildselect = 0;
        }).catch(error => {
          message.error(error);
        })
        this.setState({
          buildinfovisible: true
        })
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
        if (this.gobydeletemode === 1) {
          let id = parseInt(e.target.getFeatures().item(0).get("name"));
          let pos = this.gobylist.findIndex((element, index, array) => {
            // console.log(element, index)
            return element === id
          });
          // console.log(pos);
          this.gobylist.splice(pos, 1);
          // console.log(this.gobylist);
          this.PointLayer.getSource().removeFeature(e.target.getFeatures().item(0));
        }
      }
    })
  }
  showpoint = (id) => {
    if (this.pointFeatures === undefined) this.pointFeatures = new sourceVector()
    let i = this.pointdata.findIndex(x => x.id === id);
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
    // 
    this.pointFeatures.addFeatures([feature]);
    if (this.PointLayer === undefined) {
      this.PointLayer = new LayerVector({
        source: this.pointFeatures
      })
    }
    // else {
    //   // this.PointLayer.getSource().addFeatures([])
    // }
  }
  switchSelectPathMode = (checked) => {
    this.lineselect = checked;
  }
  showData = () => {
    axios.get("/api/getpointlist").then((response) => {
      this.pointdata = response.data;
      // console.log(pointdata);
      this.pointFeatures = new sourceVector()
      // for (let i in this.pointdata) {
      //   let feature = new Feature({
      //     geometry: new Point(this.pointdata[i].coord),
      //     name: this.pointdata[i].id
      //   });
      //   feature.setStyle(new Style({
      //     image: new Circle({
      //       radius: 6,
      //       fill: new Fill({ color: '#ff0000' }),
      //       stroke: new Stroke({ color: 'rgba(0,0,0,1)' })
      //     }),
      //   }));
      //   this.pointFeatures.addFeatures([feature]);
      // }
      this.PointLayer = new LayerVector({
        source: this.pointFeatures
      })
      this.setState({
        pointlist: this.pointdata
      })
      this.map.addLayer(this.PointLayer)
    }).then(() => {
      axios.get("/api/getpathbike").then((response) => {
        this.bikepathdata = response.data;
        // console.log(this.bikepathdata);
        // for (let i in this.bikepathdata) {
        //   let start = this.pointdata.find(x => x.id === this.bikepathdata[i][0]);
        //   if (start === undefined) continue;
        //   let end = this.pointdata.find(x => x.id === this.bikepathdata[i][1]);
        //   if (end === undefined) continue;
        //   let line = new LineString([start.coord, end.coord]);
        //   let BikePathLayer = new LayerVector({
        //     source: new sourceVector({
        //       features: [
        //         new Feature({
        //           geometry: line,
        //           start: this.bikepathdata[i][0],
        //           end: this.bikepathdata[i][1]
        //         })
        //       ]
        //     }),
        //     style: new Style({
        //       stroke: new Stroke({
        //         width: 5,
        //         color: "#a800ff",
        //         lineDash: [0.1, 15]
        //       })
        //     })
        //   });
        //   this.map.addLayer(BikePathLayer);
        // }
      }).catch((error) => {
        message.error(error)
      })
    }).then(() => {
      // axios.get("/api/getpath").then((response) => {
      //   this.pathdata = response.data;
      //   console.log(this.pathdata);
      //   for (let i in this.pathdata) {
      //     let start = this.pointdata.find(x => x.id === this.pathdata[i][0]);
      //     if (start === undefined) continue;
      //     let end = this.pointdata.find(x => x.id === this.pathdata[i][1]);
      //     if (end === undefined) continue;
      //     let line = new LineString([start.coord, end.coord]);
      //     let PathLayer = new LayerVector({
      //       source: new sourceVector({
      //         features: [
      //           new Feature({
      //             geometry: line,
      //             start: this.pathdata[i][0],
      //             end: this.pathdata[i][1]
      //           })
      //         ]
      //       }),
      //       style: new Style({
      //         stroke: new Stroke({
      //           width: 6,
      //           color: "#00ccff",
      //           lineDash: [0.1, 10]
      //         })
      //       })
      //     });
      //     this.map.addLayer(PathLayer);
      //   }
      // }).catch((error) => {
      //   message.error(error);
      // })
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
  switchEditMode = (checked) => {
    if (checked)
      this.setState({
        editmode: 1
      })
    else
      this.setState({
        editmode: 0
      })
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
      axios.post("/api/addpath" + (this.bikeeditmode ? "bike" : ""), {
        start: start,
        end: end,
        // len: len,
        cap: parseInt(this.addpathcap)
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
    axios.post("/api/delpath" + (this.bikeeditmode ? "bike" : ""), {
      start: delpathstart,
      end: delpathend
    }).then((response) => {
      message.success("删除成功")
    }).catch((error) => {
      message.error(error)
    })
  }
  // vnavmode = 0;
  switchNavStartMode = (checked) => {
    if (checked) {
      axios.get("/api/getvlist").then((response) => {
        this.setState({
          vposlist: response.data
        })
      })
      this.setState({
        vnavmode: 1
      })
    } else {
      this.setState({
        vnavmode: 0
      })
    }
  }
  navVStart = (val) => {
    this.navstart = val
    axios.get("/api/getvlist").then((response) => {
      this.setState({
        vposlist: response.data
      })
    })
  }
  navVEnd = (val) => {
    this.navend = val;
    axios.get("/api/getvlist").then((response) => {
      this.setState({
        vposlist: response.data
      })
    })
  }
  chooseNavStartModeOn = () => {
    if (this.choosenavendmode === 1)
      this.chooseNavEndModeOff();
    message.info("请在地图上选择起点")
    // this.setState({
    //   startbuttonmodalvisable: true,
    // })
    this.choosenavstartmode = 1;
    this.setState({
      navstartbuttontype: "default",
      navstartbuttondisabled: true,
      navpartstartbutton: "选择中",
    });
  }
  // startButtonModalOk = () => {
  //   this.setState({
  //     startbuttonmodalvisable: false
  //   })
  // }
  // handlestartMenuClick = () => {

  // }
  // handleendMenuClick = () => {

  // }
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
  useCap = (value) => {
    if (value <= 2) {
      this.navusecap = value - 1;
      this.bikemode = 0;
    }
    else {
      this.navusecap = 1;
      this.bikemode = 1;
    }
    // this.navusecap = 0;
  }
  renderSelf = () => {
    this.selffeature = new Feature({
      geometry: new Point(this.startpos)
    })
    // this.selffeature.setStyle();
    this.selflayer.getSource().clear();
    this.selflayer.getSource().addFeatures([this.selffeature]);
    this.map.setView(new View({
      center: this.startpos,
      zoom: 18.3
    }))
    // this.selflayer.setStyle()
  }
  ReRender = () => {
    // if (dynamicpause === true) {
    //   return;
    // }
    // this.linepoint = [this.startpos];
    if (this.noworder === this.navdata.length) {
      this.endDynamicNav();
      // clearInterval(this.timerID);
      this.endtagLayer.getSource().clear();
      this.selflayer.getSource().clear();
      this.pointFeatures.clear()
      this.startpos = undefined
      message.success("导航完成");
      return;
    }
    // this.noworder++;
    // console.log(this.noworder);
    // for (let i in this.navdata) {
    //   if (i >= this.noworder) {
    //     this.linepoint.push(this.pointdata.find(x => x.id === this.navdata[i]).coord);
    //   }
    // }
    let sta = this.pointdata.find((x) => x.id === this.navdata[this.noworder][0]).coord;
    let end = this.pointdata.find((x) => x.id === this.navdata[this.noworder][1]).coord;
    console.log(sta, end);
    if ((end[0] - this.startpos[0]) * (end[0] - this.startpos[0]) + (end[1] - this.startpos[1]) * (end[1] - this.startpos[1]) > 0.25) {
      this.startpos[0] += (end[0] - sta[0]) / (this.navdata[this.noworder][2] * this.navdata[this.noworder][3]) * 0.5;
      this.startpos[1] += (end[1] - sta[1]) / (this.navdata[this.noworder][2] * this.navdata[this.noworder][3]) * 0.5;
    } else {
      if (this.navdata[this.noworder][1] === 324 || this.navdata[this.noworder][1] === 337) {
        this.noworder++;
        end = this.pointdata.find((x) => x.id === this.navdata[this.noworder][1]).coord;
      }
      this.startpos = [...end];
      this.noworder++;
    }
    this.renderSelf();
    let linepointtmp = [this.startpos];
    for (let i in this.linepoint) {
      if (i > this.noworder)
        linepointtmp.push(this.linepoint[i]);
    }
    this.linestring = new LineString(linepointtmp);
    this.linestringfeature = new Feature({
      geometry: this.linestring,
    });
    this.navLayer.getSource().clear();
    this.navLayer.getSource().addFeatures([this.linestringfeature]);
  }
  startDynamicNav = () => {
    // this.noworder = 0;
    this.timerID = setInterval(
      () => this.ReRender(),
      50
    );
    this.setState({
      navdynamicstart: true,
      navdynamicend: false
    })
  }
  endDynamicNav = () => {
    clearInterval(this.timerID);
    this.setState({
      navdynamicstart: false,
      navdynamicend: true
    })
  }
  renderPath = (data) => {
    this.navdata = data.path;
    console.log(this.navdata);
    this.navtype = undefined;
    if (this.navLayer !== undefined)
      this.navLayer.getSource().clear();
    if (this.endtagLayer !== undefined)
      this.endtagLayer.getSource().clear();
    if (this.selflayer !== undefined)
      this.selflayer.getSource().clear();
    this.linepoint = [this.pointdata.find(x => x.id === this.navdata[0][0]).coord];
    this.startpos = [...this.linepoint[0]];
    this.noworder = 0
    for (let i in this.navdata) {
      this.linepoint.push(this.pointdata.find(x => x.id === this.navdata[i][1]).coord);
    }
    console.log(this.linepoint);
    this.linestring = new LineString(this.linepoint);
    this.linestringfeature = new Feature({
      geometry: this.linestring,
    });
    let endmakerfeature = new Feature({
      geometry: new Point(this.linepoint[this.linepoint.length - 1]),
    });
    // this.noworder = 0;
    this.selffeature = new Feature({
      geometry: new Point(this.startpos)
    })
    this.selflayer = new LayerVector({
      source: new sourceVector({
        features: [this.selffeature]
      }),
      style: new Style({
        image: new Icon({
          opacity: 1,
          rotateWithView: false,
          rotation: 0,
          imgsize: [50, 50],
          anchor: [0.5, 0.5],
          src: 'https://cdn.jsdelivr.net/gh/NekoMio/BMap@master/static/mine.png',
        })
        // zIndex: Infinity
      })
    });
    this.map.addLayer(this.selflayer);
    // this.renderSelf();
    this.navLayer = new LayerVector({
      source: new sourceVector({
        features: [this.linestringfeature]
      }),
      style: new Style({
        stroke: new Stroke({
          width: 10,
          color: "#00ccff"
        }),
      })
    });
    this.map.addLayer(this.navLayer);
    this.endtagLayer = new LayerVector({
      source: new sourceVector({
        features: [endmakerfeature]
      }),
      style: new Style({
        image: new Icon({
          src: "https://cdn.jsdelivr.net/gh/NekoMio/BMap@master/static/marker.png",
          anchor: [0.5, 1],
          opacity: 0.7,
          rotateWithView: false
        })
      })
    });
    this.map.addLayer(this.endtagLayer);
  }
  getlen = (a, b) => {
    let coord1 = this.pointdata.find(x => x.id === a).coord;
    let coord2 = this.pointdata.find(x => x.id === b).coord;
    return Math.sqrt((coord1[0] - coord2[0]) * (coord1[0] - coord2[0]) + (coord1[1] - coord2[1]) * (coord1[1] - coord2[1]))
  }
  getNavPath = () => {
    // console.log(navstart, navend);
    // return;
    // if (this.gobymode === 1) {
    //   if (this.startpos === undefined) {
    //     // message.error("不予许在途经点模式")
    //   }
    // }
    if (this.navend === -1) {
      message.error("请选择终点");
      return;
    }
    let url;
    if (this.gobymode === 1) {
      url = "/api/gettsppath" + (this.navtype === undefined ? "" : "cross") + (this.bikemode ? "bike" : "");
    } else {
      url = "/api/getnavpath" + (this.navtype === undefined ? "" : "cross") + (this.bikemode ? "bike" : "");
    }
    if (this.startpos === undefined) {
      if (this.navstart === -1) {
        message.error("请选择起点");
        return;
      }
      if (this.navtype === undefined && this.getlen(this.navstart, this.navend) > 15000) {
        this.setState({
          getnavmodalvisable: true
        })
        return;
      }
      console.log(this.gobylist);
      axios.post(url, {
        start: this.navstart,
        end: this.navend,
        option: this.navusecap,
        gobylist: this.gobylist,
        type: this.navtype
      }).then((response) => {
        this.renderPath(response.data);
      }).catch((error) => {
        message.error(error);
      })
    } else {
      // if (this.navend === -1) {
      //   message.error("请选择终点")
      //   return
      // }
      if (this.navtype === undefined && (this.getlen(this.navdata[this.noworder][0], this.navend) > 15000 || this.getlen(this.navdata[this.noworder][1], this.navend) > 15000)) {
        this.setState({
          getnavmodalvisable: true
        })
        return;
      }
      axios.post(url, {
        start: this.navdata[this.noworder][0],
        end: this.navend,
        option: this.navusecap,
        gobylist: [],
        type: this.navtype
      }).then((res1) => {
        axios.post(url, {
          start: this.navdata[this.noworder][1],
          end: this.navend,
          option: this.navusecap,
          gobylist: [],
          type: this.navtype
        }).then((res2) => {
          if (res1.data.len > res2.data.len) {
            this.renderPath(res2.data);
          } else {
            this.renderPath(res1.data);
          }
        })
      })
    }
  }
  printEdit = () => {
    message.info(this.editmode);
  }
  useMid = (checked) => {
    if (checked) {
      this.gobymode = 1;
    } else {
      this.gobymode = 0;
    }
  }
  changeGoByEditMode = (e) => {
    if (e.target.value === 1) {
      this.gobyaddmode = 1;
      this.gobydeletemode = 0;
    } else {
      this.gobyaddmode = 0;
      this.gobydeletemode = 1;
    }
  }
  // buildinfovisible = false
  searchBuildings = () => {
    if (this.startpos === undefined) {
      this.searchbuildselect = 1;
      message.warning("请在地图上选择一个点");
    } else {
      axios.post("/api/getbuildings", {
        point: this.startpos // 这个是[x,y]的数组
      }).then((response) => {
        this.setState({
          buildingdata: response.data
        })
      }).catch(error => {
        message.error(error);
      })
      this.setState({
        buildinfovisible: true
      })
    }
    // buildinfovisible = true;
  }
  switchBikeEditMode = (checked) => {
    if (checked) {
      this.bikeeditmode = 1;
    } else {
      this.bikeeditmode = 0;
    }
  }
  buildInfoClose = () => {
    this.setState({
      buildinfovisible: false
    })
    // this.buildinfovisible = false;
  }
  buildname;
  addBuilding = () => {
    console.log(this.addbuildinglist.length);
    if (this.addbuildingmode === 0 || this.addbuildinglist.length === 0) {
      this.addbuildingmode = 1;
      this.setState({
        addbuildingvisible: true,
        // addbuildinginfo: "确定"
      })
    }
    else {
      this.addbuildingmode = 0;
      console.log(this.buildname, this.addbuildinglist);
      this.setState({
        addbuildinginfo: "添加一个建筑物"
      });
      // return;
      axios.post("/api/addbuilding", {
        name: this.buildname,
        points: this.addbuildinglist
      }).then((response) => {
        this.addbuildinglist = [];
        message.info(`添加建筑物 ${this.buildname} 成功`);
      }).catch((error) => {
        message.error(error);
      })
    }
  }
  tmpbuildname;
  addBuildingInputChange = (e) => {
    this.tmpbuildname = e.target.value;
  }
  addBuildingModalOk = () => {
    this.buildname = this.tmpbuildname;
    this.setState({
      addbuildingvisible: false,
    })
  }
  addBuildingModalCancel = () => {
    this.setState({
      addbuildingvisible: false,
    })
  }
  switchCamp = (x) => {
    this.map.setView(this.campusview[x - 1]);
  }
  changeCampView = (e) => {
    // if (e.target.value === 1) {
    this.switchCamp(e.target.value);
    // } else {
    // }
  }
  navModalClose = () => {
    this.setState({
      getnavmodalvisable: false
    })
  }
  useNavCrossBus = () => {
    this.navtype = 0;
    this.setState({
      getnavmodalvisable: false
    })
    this.getNavPath();
  }
  downloadLog = () => {
    window.open("api/log");
  }
  useNavCrossSub = () => {
    this.navtype = 1;
    this.setState({
      getnavmodalvisable: false
    })
    this.getNavPath();
  }
  render() {
    const { getnavmodalvisable, editmode, vposlist, vnavmode, addbuildingvisible, addbuildinginfo, buildinfovisible, buildingdata, navdynamicstart, navdynamicend, navpartstartbutton, navpartendbutton, navstartbuttontype, navendbuttontype, navstartbuttondisabled, navendbuttondisabled } = this.state;
    // console.log(pointlist);
    const editPart1 = (<div className="edit" style={{ marginLeft: "30px" }}>

      <p>启动加点模式 <Switch onChange={this.switchAddPointMode} /></p>
      <p>启动删点模式 <Switch onChange={this.switchDeletePointMode} /> </p>
      <p><Button onClick={this.addBuilding}> {addbuildinginfo} </Button>
        <Modal title="请输入建筑名字" visible={addbuildingvisible} onOk={this.addBuildingModalOk} onCancel={this.addBuildingModalCancel} destroyOnClose={true}>
          <Input onChange={this.addBuildingInputChange} />
        </Modal>
      </p>
      <p>自行车路径模式<Switch onChange={this.switchBikeEditMode} /></p>
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
          defaultValue="1.5"
          min="0.5"
          max="10"
          step="0.1"
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
    const navpart1 = (<p>
      {/* <Switch onChange={this.switchNavStartMode} /> */}
      {/* <Dropdown overlay={startdropdown}> */}
      <Button type={navstartbuttontype} disabled={navstartbuttondisabled} onClick={this.chooseNavStartModeOn}>{navpartstartbutton}</Button>
      {/* </Dropdown> */}
      &nbsp;&nbsp;<Button type="primary" shape="circle" icon={<SwapOutlined />} onClick={this.switchNavStartAndEnd}></Button>&nbsp;&nbsp;
      {/* <Dropdown overlay={enddropdown}> */}
      <Button type={navendbuttontype} disabled={navendbuttondisabled} onClick={this.chooseNavEndModeOn}>{navpartendbutton}</Button>&nbsp;&nbsp;&nbsp;&nbsp;
      {/* </Dropdown> */}
    </p>);
    const navpart2 = (<p>
      <Select
        id="navstartpos"
        showSearch
        style={{ width: 200 }}
        placeholder="选择起点"
        optionFilterProp="children"
        // onSearch={this.getVList}
        onChange={this.navVStart}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {
          vposlist.map((item, index) => {
            return <Option key={item.id} value={item.id}> {item.name} </Option>
          })
        }
      </Select>
      <Select
        id="navendpos"
        showSearch
        style={{ width: 200 }}
        placeholder="选择终点"
        optionFilterProp="children"
        // onSearch={this.getPointList}
        onChange={this.navVEnd}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {
          vposlist.map((item, index) => {
            return <Option key={item.id} value={item.id}> {item.name} </Option>
          })
        }
      </Select>
    </p>)
    return (
      <div className="App">
        <Header>
          BMap
        </Header>
        <Sider className="control">
          <h1 style={{ marginLeft: "30px" }}>编辑模块<Switch onChange={this.switchEditMode} /></h1>
          {
            editmode === 1 ? editPart1 : null
          }
          {/* <Radio.Group
          options={optionsWithDisabled}
          onChange={this.onChange4}
          value={value4}
          optionType="button"
          buttonStyle="solid"
          /> */}
          <div className="navPart" style={{ marginLeft: "30px" }}>
            <p>
              <Radio.Group defaultValue={1} onChange={this.changeCampView} buttonStyle="solid">
                <Radio.Button value={1}>沙河校区</Radio.Button>
                <Radio.Button value={2}>西土城校区</Radio.Button>
              </Radio.Group>
            </p>
            <p>切换导航选点方式<Switch onChange={this.switchNavStartMode} checkedChildren="虚拟" unCheckedChildren="点击" /></p>
            {
              vnavmode === 0 ? navpart1 : navpart2
            }

            <p>是否有途径点<Switch onClick={this.useMid} /></p>
            <p>
              <Radio.Group defaultValue={1} onChange={this.changeGoByEditMode} buttonStyle="solid">
                <Radio.Button value={1}>添加途径点</Radio.Button>
                <Radio.Button value={2}>删除途径点</Radio.Button>
              </Radio.Group>
            </p>
            <p>
              <Select defaultValue="1" style={{ width: 160 }} onChange={this.useCap}>
                <Option value="1">最短路径模式</Option>
                <Option value="2">最短时间模式</Option>
                <Option value="3">自行车模式</Option>
              </Select>
              {/* 考虑拥堵<Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked onClick={this.useCap} /> */}
              <Button onClick={this.getNavPath}>开始导航</Button>
              <Modal
                visible={getnavmodalvisable}
                title="选择模式"
                footer={[
                  <Button key="back" onClick={this.navModalClose}>
                    取消
                  </Button>
                ]}
              >
                <p>监测到你所选的点不住同一个校区请选择移动方式</p>
                <p>
                <Button onClick={this.useNavCrossBus}>乘坐班车</Button>
                <Button onClick={this.useNavCrossSub}>乘坐地铁</Button>
                </p>
              </Modal>
            </p>
            <p>
              <Button onClick={this.startDynamicNav} disabled={navdynamicstart}>动态导航开始</Button> &nbsp;&nbsp;&nbsp;&nbsp;
              <Button onClick={this.endDynamicNav} disabled={navdynamicend}>动态导航暂停</Button>
            </p>
          </div>
          <div className="nearby" style={{ marginLeft: "30px" }}>
            <p><Button onClick={this.searchBuildings}>查询周围建筑物</Button>
              <Modal
                visible={buildinfovisible}
                title="周围建筑"
                footer={[
                  <Button key="submit" type="primary" onClick={this.buildInfoClose}>
                    关闭
                  </Button>
                ]}>
                {/* <p>Hello</p> */}
                <List
                  size="small"
                  bordered
                  dataSource={buildingdata}
                  renderItem={item => <List.Item>{item}</List.Item>}
                />
              </Modal>
            </p>
            <p><Button onClick={this.downloadLog}>下载日志</Button></p>
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