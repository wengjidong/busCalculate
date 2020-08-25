<template>
  <div class="map-container" id="map">
    <dv-border-box-9 class="table-top-content">
      <el-button style="margin-top: 5px;margin-left: 10px" type="primary" @click="desSort()">站点最大距离</el-button>
      <el-button style="margin-top: 5px;margin-left: -5px" type="primary" @click="ascSort()">站点最小距离</el-button>
      <el-button v-show="isIn" style="margin-top: 5px;margin-left: -5px" type="primary" @click="inStore()">入库</el-button>
      <el-button v-show="isIn" style="margin-top: 5px;margin-left: -5px" type="primary" @click="allInStore()">全部入库</el-button>
    </dv-border-box-9>
    <dv-border-box-8  :dur="15" class="tableContent">
      <div class="header">
        <span style="line-height:30px;float:left;width: 10%;text-align: center;display:block;">序号</span>
        <span style="line-height:30px;float:left;width: 50%;text-align: center;display:block;">站点</span>
        <span style="line-height:30px;float:left;width: 40%;text-align: center;display:block;">站距</span>
      </div>
      <div class="station-content" >
        <ul class="ul-content">
          <li v-for="(item, index) in stationsArr" :class="{ liBack: index%2 === 0 }" @click="getStationLine(item)">
            <span style="line-height:30px;float:left;width: 10%;text-align: center;display:block;">{{ item.seq }}</span>
            <span style="line-height:30px;float:left;width: 50%;text-align: center;display:block;">{{ item.stationName }}</span>
            <span style="line-height:30px;float:left;width: 40%;text-align: center;display:block;">{{ item.stationDis }}</span>
            <!--<div style="width: 30%;float: left;">{{ item.address }}</div>-->
          </li>
        </ul>
      </div>
    </dv-border-box-8>
    <dv-border-box-1 class="table-content-left">
      <el-button style="margin-top: 15px;margin-left: 25px" type="primary" :class="[isClick?'click-btn':'el-button--primary']" @click="gdData()">高德数据</el-button>
      <el-button style="margin-left: -5px" type="primary" :class="[isClick2?'click-btn':'el-button--primary']" @click="fhData()">富煌数据</el-button>
      <el-select v-show="isClick" style="width:100px;margin-top: 10px;margin-left:25px" v-model="lineData" placeholder="请选择" @change="getBusLine">
        <el-option
          v-for="item in newLineArr"
          :key="item.line_name"
          :label="item.line_name+'路'"
          :value="item.line_name+'路'">
        </el-option>
      </el-select>
      <el-select v-show="isClick" style="width:90px;margin-top: 10px;margin-left:1px" v-model="updown" placeholder="请选择" @change="getBusLine">
        <el-option
          v-for="item in [{key:1,value:'上行'},{key:0,value:'下行'}]"
          :key="item.key"
          :label="item.value"
          :value="item.key">
        </el-option>
      </el-select>
      <el-select v-show="isClick2" style="width:100px;margin-top: 10px;margin-left:25px" v-model="fhlineData" placeholder="请选择" @change="getfhBusLine">
        <el-option
          v-for="item in [{key:1,value:'1路'},{key:2,value:'2路'}]"
          :key="item.key"
          :label="item.value"
          :value="item.key">
        </el-option>
      </el-select>
      <el-select v-show="isClick2" style="width:90px;margin-top: 10px;margin-left:1px" v-model="fhupdown" placeholder="请选择" @change="getfhBusLine">
        <el-option
          v-for="item in [{key:1,value:'上行'},{key:2,value:'下行'}]"
          :key="item.key"
          :label="item.value"
          :value="item.key">
        </el-option>
      </el-select>
    </dv-border-box-1>
  </div>
</template>

<script>
  import axios from 'axios'
  import { listBusStandAway,listBusStation,addStation,listStationForAdd,listBus} from '@/api/basicData'
export default {
  name: 'AMap',
  components:{
  },
  data () {
    return {
      linesearch:'',
      map:'',
      stationsArr:[],
      stationsObj:{
        lineName:'',
        updown:1,
        seq:0,
        stationArr:[],
        stationName:'',
        stationDis:0,
        notes:'高德地图数据'
      },
      stationLine:'',
      fhlineData:1,
      fhupdown:1,
      lineData:'1路',
      updown:1,
      isClick:true,
      isClick2:false,
      config:{
        data: [
          ['行1列1', '行1列2', '行1列3'],
          ['行2列1', '行2列2', '行2列3'],
          ['行3列1', '行3列2', '行3列3'],
          ['行4列1', '行4列2', '行4列3'],
          ['行5列1', '行5列2', '行5列3'],
          ['行6列1', '行6列2', '行6列3'],
          ['行7列1', '行7列2', '行7列3'],
          ['行8列1', '行8列2', '行8列3'],
          ['行9列1', '行9列2', '行9列3'],
          ['行10列1', '行10列2', '行10列3']
        ]
      },
      isIn:true,
      newLineArr:[]
    }
  },
  mounted(){
    this.init();
    this.getLine()
    this.lineSearch(this.lineData,this.updown)
  },
  methods:{
    init(){
      this.map=new AMap.Map('map',{
        resizeEnable: true, //是否监控地图容器尺寸变化
        zoom:11, //初始化地图层级
        city:'合肥',
        center: [117.282685,31.864455],//初始化地图中心点
        mapStyle: 'amap://styles/0f3f84a4fbb768fa56da330bf8310c83', //设置地图的显示样式
      })
      //window.open('https://uri.amap.com/line?name=1路&city=合肥市&src=mypage&callnative=0')
    },
    lineSearch(lineName,updown){
      //搜索“536”相关公交线路
      var that=this;
      this.linesearch=new AMap.LineSearch({
        city: '合肥',
        extensions: 'all'
      })
      this.linesearch.search(lineName, function(status, result) {
        that.map.clearMap()
        if (status === 'complete' && result.info === 'OK') {
          that.lineSearch_Callback(result,updown);
        } else {
          console.log(lineName+updown+"查询失败");
        }
      });
    },
    lineSearch_Callback2(data,lineName,updown){
      var indexArr=[];
      if(data.lineInfo.length>1){
        var lineArr = data.lineInfo[updown];
        var pathArr=lineArr.path;
        var stationPoints=lineArr.via_stops;
        for(let i=0;i<stationPoints.length;i++){
          for(let j=0;j<pathArr.length;j++){
            if(stationPoints[i].location.R==pathArr[j].R&&stationPoints[i].location.Q==pathArr[j].Q){
              pathArr[j].name=stationPoints[i].name;
              pathArr[j].sequence=stationPoints[i].sequence;
              indexArr.push(j)
              break;
            }
          }
        }
        let arr=this.createArr2(pathArr,indexArr,lineName,updown);
        return arr;
      }
      else if(data.lineInfo.length==1){
        console.log(lineName+updown+'没有上下行')
      }

    },
    lineSearch_Callback(data,updown){
      var indexArr=[];
      var lineArr = data.lineInfo[updown];
      var pathArr=lineArr.path;
      this.drawbusLine(pathArr)
      var stationPoints=lineArr.via_stops;
      this.drawStation(stationPoints)
      for(let i=0;i<stationPoints.length;i++){
        for(let j=0;j<pathArr.length;j++){
          if(stationPoints[i].location.R==pathArr[j].R&&stationPoints[i].location.Q==pathArr[j].Q){
            pathArr[j].name=stationPoints[i].name;
            pathArr[j].sequence=stationPoints[i].sequence;
            indexArr.push(j)
            break;
          }
        }
      }
      this.createArr(pathArr,indexArr);
    },
    //获取线路
    getfhStationData(line_id,direct_id){
      listBusStandAway({line_id:line_id,direct_id:direct_id}).then(res=>{
        var da=res;
        this.stationsArr=[]
        var that=this;
        da.forEach(item=>{
          that.stationsObj={};
          that.stationsObj.seq=item.station_seq;
          that.stationsObj.stationName=item.station+"—"+item.station_2;
          that.stationsObj.stationDis=item.distance_avg;
          that.stationsObj.stationArr=item.signal.split('|')
          let tmArr=[];
          for(let i=0;i<that.stationsObj.stationArr.length;i++){
            let x=that.stationsObj.stationArr[i].split(',')[0];
            let y=that.stationsObj.stationArr[i].split(',')[1];
            let pt= gcoord.transform([x, y], gcoord.WGS84, gcoord.GCJ02);
            tmArr.push(pt)
          }
          that.stationsObj.stationArr=tmArr;
          that.stationsArr.push(that.stationsObj)
        })
      })
    },
    test(){
      axios.get('http://192.168.1.224:8090/listBusScheduling?line_id=1&direct_id=1').then(res=>{
        debugger
      })
    },
    getLine(){
      listBus().then(res=>{
        let lineArr=res;
        this.newLineArr=[];
        var that=this;
        lineArr.forEach((currentValue, index, arr)=>{
          if(index%2==0){
            that.newLineArr.push(currentValue)
          }
        })
      })
    },
    createArr2(pathArr,indexArr,lineName,updown){
      //每个站点距离
      var pointsArr=[];
      this.stationsArr=[];
      for(let i=0;i<indexArr.length-1;i++){
        this.stationsObj={};
        pointsArr=pathArr.slice(indexArr[i],indexArr[i+1]+1)
        this.stationsObj.lineName=lineName;
        this.stationsObj.updown=updown;
        this.stationsObj.seq=i+1;
        this.stationsObj.stationArr=pointsArr;
        this.stationsObj.stationName=pointsArr[0].name+'—'+pointsArr[pointsArr.length-1].name
        this.stationsObj.stationDis=this.calDis(pointsArr);
        this.stationsObj.notes="高德轨迹数据";
        this.stationsArr.push(this.stationsObj)
      }
      return this.stationsArr;
    },
    createArr(pathArr,indexArr){
      //每个站点距离
      var pointsArr=[];
      this.stationsArr=[];
      for(let i=0;i<indexArr.length-1;i++){
        this.stationsObj={};
        pointsArr=pathArr.slice(indexArr[i],indexArr[i+1]+1)
        this.stationsObj.lineName=this.lineData;
        this.stationsObj.updown=this.updown;
        this.stationsObj.seq=i+1;
        this.stationsObj.stationArr=pointsArr;
        this.stationsObj.stationName=pointsArr[0].name+'—'+pointsArr[pointsArr.length-1].name
        this.stationsObj.stationDis=this.calDis(pointsArr);
        this.stationsObj.notes="高德轨迹数据";
        this.stationsArr.push(this.stationsObj)
      }
    },
    calDis(pointsArr){
      var sum=0;
      for(let i=0;i<pointsArr.length-1;i++){
        var dis=AMap.GeometryUtil.distance([pointsArr[i].R,pointsArr[i].Q], [pointsArr[i+1].R,pointsArr[i+1].Q]);
        sum+=dis;
      }
      return sum.toFixed(4)
    },
    /*绘制路线*/
    drawbusLine(BusArr,scope) {
     //绘制乘车的路线
      if(scope){
        if(this.stationLine){
          this.map.remove(this.stationLine)
        }
        this.stationLine = new AMap.Polyline({
          map: this.map,
          path: BusArr,
          showDir:true,
          strokeColor: "#ff6144",//线颜色
          strokeOpacity: 0.8,//线透明度
          isOutline:true,
          outlineColor:'white',
          strokeWeight: 6//线宽
        });
        this.map.setFitView(this.stationLine);
      }
      else{
        var busPolyline = new AMap.Polyline({
          map: this.map,
          path: BusArr,
          showDir:true,
          strokeColor: "#09f",//线颜色
          strokeOpacity: 0.8,//线透明度
          isOutline:true,
          outlineColor:'white',
          strokeWeight: 6//线宽
        });
        this.map.setFitView(busPolyline);
      }

  },
    drawStation(stationArr){
      var that=this;
      stationArr.forEach(item=>{
        var circleMarker = new AMap.CircleMarker({
          center:item.location,
          map: that.map,
          radius:5,//3D视图下，CircleMarker半径不要超过64px
          strokeColor:'white',
          strokeWeight:2,
          strokeOpacity:1,
          fillColor:'rgba(255,255,255,1)',
          fillOpacity:1,
          zIndex:200,
          bubble:true,
          cursor:'pointer',
          clickable: true,
          title:item.name
        })
        // 创建纯文本标记
        var text = new AMap.Text({
          text:item.name,
          map: that.map,
          anchor:'bottom-right', // 设置文本标记锚点
          draggable:true,
          cursor:'pointer',
          angle:0,
          zIndex:200,
          position:[item.location.R,item.location.Q]
        });
      })
    },
    getStationLine(val){
      this.drawbusLine(val.stationArr,true)
    },
    getfhStaion(line_id,direct_id){
      listBusStation({line_id:line_id,direct_id:direct_id}).then(res=>{
        var da=res;
        var that=this;
        da.forEach(item=>{
          let pt=gcoord.transform([item.longitude, item.latitude], gcoord.WGS84, gcoord.GCJ02);
          var circleMarker = new AMap.CircleMarker({
            center:pt,
            map: that.map,
            radius:5,//3D视图下，CircleMarker半径不要超过64px
            strokeColor:'white',
            strokeWeight:2,
            strokeOpacity:1,
            fillColor:'rgba(255,255,255,1)',
            fillOpacity:1,
            zIndex:200,
            bubble:true,
            cursor:'pointer',
            clickable: true,
            title:item.station_name
          })
          // 创建纯文本标记
          var text = new AMap.Text({
            text:item.station_name,
            map: that.map,
            anchor:'bottom-right', // 设置文本标记锚点
            draggable:true,
            cursor:'pointer',
            angle:0,
            zIndex:200,
            position:pt
          });
        })
      })
    },
    getfhBusLine(){
      this.map.clearMap();
      this.getfhStaion(this.fhlineData,this.fhupdown);
      this.getfhStationData(this.fhlineData,this.fhupdown)
    },
    getBusLine(val){
      debugger
      this.lineSearch(this.lineData,this.updown)
    },
    gdData(){
      this.isIn=true;
      this.isClick = !this.isClick;
      this.isClick2=!this.isClick;
      this.map.clearMap();
      this.lineSearch(this.lineData,this.updown)
    },
    fhData(){
      this.isIn=false;
      this.isClick2 = !this.isClick2;
      this.isClick = !this.isClick2;
      //清除高德线路
      this.map.clearMap();
      this.getfhStaion(this.fhlineData,this.fhupdown);
      this.getfhStationData(this.fhlineData,this.fhupdown);
    },
    desSort(){
      this.stationsArr.sort((a,b)=>{
        return b.stationDis-a.stationDis;
      })
    },
    ascSort(){
      this.stationsArr.sort((a,b)=>{
        return a.stationDis-b.stationDis;
      })
    },
    allInStore(){
      //获取所有线路
      var that=this;
      listBus().then(res=>{
        let lineArr=res;
        debugger
        for(let i=650;i<710;i++){
          let lineName=lineArr[i].line_name+'路';
          let updown=lineArr[i].direct_id==1?1:0;
          listStationForAdd({lineName:lineName,updown:updown,notes:'高德轨迹数据'}).then(res=>{
            if(res.length>0){
              this.$message({
                message: lineName+updown+"已录入，不可重复录入！",
                type: 'warning'
              })
            }
            else{
              //搜索“536”相关公交线路
              var that=this;
              this.linesearch=new AMap.LineSearch({
                city: '合肥',
                extensions: 'all'
              })
              this.linesearch.search(lineName, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {
                  let arr=that.lineSearch_Callback2(result,lineName,updown);
                  if(arr){
                    for(let i=0;i<arr.length;i++){
                      addStation({lineName:arr[i].lineName,updown:arr[i].updown,seq:arr[i].seq,
                        stationArr:'',stationName:arr[i].stationName,stationDis:arr[i].stationDis,
                        notes:arr[i].notes}).then(res=>{
                        console.log(lineName+updown+" 入库成功")
                      })
                    }
                  }
                } else {
                  console.log(lineName+updown+" 入库失败!")
                  //alert(result);
                }
              });
            }
          })
        }
/*        lineArr.forEach(item=>{
          let lineName=item.line_name+'路';
          let updown=item.direct_id==1?1:0
          listStationForAdd({lineName:lineName,updown:updown,notes:'高德轨迹数据'}).then(res=>{
            if(res.length>0){
              this.$message({
                message: lineName+updown+"已录入，不可重复录入！",
                type: 'warning'
              })
            }
            else{
              //搜索“536”相关公交线路
              var that=this;
              this.linesearch=new AMap.LineSearch({
                city: '合肥',
                extensions: 'all'
              })
              this.linesearch.search(lineName, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {
                  let arr=that.lineSearch_Callback2(result,lineName,updown);
                  if(arr){
                    for(let i=0;i<arr.length;i++){
                      addStation({lineName:arr[i].lineName,updown:arr[i].updown,seq:arr[i].seq,
                        stationArr:'',stationName:arr[i].stationName,stationDis:arr[i].stationDis,
                        notes:arr[i].notes}).then(res=>{
                          console.log(lineName+updown+" 入库成功")
                      })
                    }
                  }
                } else {
                  console.log(lineName+updown+" 入库失败!")
                  //alert(result);
                }
              });
            }
          })
        })*/
      })
    },
    inStore(){
      //先判断是否库里是否有值
      listStationForAdd({lineName:this.lineData,updown:this.updown,notes:'高德轨迹数据'}).then(res=>{
        if(res.length>0){
          this.$message({
            message: "已录入，不可重复录入！",
            type: 'warning'
          })
        }
        else{
          for(let i=0;i<this.stationsArr.length;i++){
            addStation({lineName:this.stationsArr[i].lineName,updown:this.stationsArr[i].updown,seq:this.stationsArr[i].seq,
              stationArr:this.stationsArr[i].stationArr.toString(),stationName:this.stationsArr[i].stationName,stationDis:this.stationsArr[i].stationDis,
              notes:this.stationsArr[i].notes}).then(res=>{
              if(res.code==200){
                console.log()
              }
            })
          }
          this.$message({
            message: "入库成功！",
            type: 'success'
          })
        }
      })


    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .map-container{
    height:100%;
    position: relative;
    .table-top-content{
      width: 500px;
      height: 50px;
      z-index: 10;
      position:absolute;
      top:8%;
      right:10%;
    }
    .tableContent{
      width: 500px;
      height: 500px;
      z-index: 10;
      position:absolute;
      top:13%;
      right:10%;
      .header{
        margin-left: 5px;
        margin-top:4.5px;
        width: 98%;
        height: 5%;
        text-align: center;
        color: #fff;
        font-size: 18px;
        background:rgba(47,126,209,1);
      }
      .station-content{
        width: 98%;
        height: 95%;
        overflow: auto;
        margin-left: 5px;
        .ul-content{
          height: 100%;
          padding-left: 0;
          text-align: left;
          color: #fff;
          font-size: 14px;
          :hover{
            box-shadow: 0px 3px 10px 0px rgb(40, 255, 49);
          }
          li {
            height: 30px;
          }
          .liBack {
            background:rgba(47,126,209,0.2);
          }
        }
      }
    }
    .table-content-left{
      width: 270px;
      height: 120px;
      z-index: 10;
      top:10%;
      left:10%;
      position:absolute;
      .click-btn{

      }
    }
  }
</style>
<style>
  .el-input__inner{
    background: rgba(39,72,158,0.62)!important;
    color: #44ECFE !important;
    border: 0px;
  }
  .el-button--primary{
    background: rgba(39,72,158,0.62)!important;
    color: #ffffff !important;
  }
  .click-btn{
    background: rgba(39,72,158,0.62)!important;
    color: #44ECFE !important;
  }
</style>
