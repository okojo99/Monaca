// (1) APIキーの設定
/** アプリケーションキーをかmBaaSからコピーして書き換えてください **/
var APPLICATION_KEY = "d418cb8340a449b7cc39974c4f94e51ad59ee3290c1f68d110c393b186507335";

/** クライアントキーをかmBaaSからコピーして書き換えてください **/
var CLIENT_KEY = "65f27d7cebb18d4fc81d82709da5d5dec9eabe07e3bae2100fbe2e2b7c12202b";

var ncmb;
var acce_array;
var acce_flag;
var gps_flag;
var current;

$(function(){
    //(2) mBaaSの初期化
    /*****↓ここに記入*****/
    ncmb = new NCMB(APPLICATION_KEY,CLIENT_KEY);
    /*****↑ここに記入*****/
    
    acce_array = new Array();
    acce_flag = new Boolean(false);
    gps_flag = new Boolean(false);
    current = null;

});

// 加速度センサーStartボタン押下時の処理
function acce_start(){
    acce_flag = true; 
    // (3) 加速度センサーから値（x, y, z 軸方向に動く値）を取得する
    /*****↓ここに記入*****/
    var watchId = navigator.accelerometer.watchAcceleration(onAcceSuccess, onAcceError, acceOptions);
    /*****↑ここに記入*****/
}

// 加速度センサーStopボタン押下時の処理
function acce_stop(){
    acce_flag = false;
    acce_save_ncmb(acce_array);
    document.acce_js.x.value=null;
    document.acce_js.y.value=null;
    document.acce_js.z.value=null;
    document.getElementById("color").src="js/img/white.png";
}

// ＧＰＳセンサーStartボタン押下時の処理
function gps_start(){
    gps_flag = true;
    // (4) GPSセンサーから値（緯度経度）を取得する
    /*****↓ここに記入*****/
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, geoOption);
    /*****↑ここに記入*****/
}

// ＧＰＳセンサーStopボタン押下時の処理
function gps_stop(){
    gps_flag = false;
    gps_save_ncmb(current.geopoint.latitude,current.geopoint.longitude);
    document.gps_js.lat.value=null;
    document.gps_js.lng.value=null;
    $(".map").empty();
}

// 加速度の値を保存する
function acce_save_ncmb(acce){
    // (5) データストアに保存用クラスを作成
    /*****↓ここに記入*****/
    var AcceData = ncmb.DataStore("AcceData");
    /*****↑ここに記入*****/
    
    // (6) クラスのインスタンスを生成
    /*****↓ここに記入*****/
    var acceData = new AcceData();
    /*****↑ここに記入*****/
    
    // (7) データの保存
    /*****↓ここに記入*****/
    acceData.set("accelerometer", acce).save();
    /*****↑ここに記入*****/
}

// GPSの値を保存する
function gps_save_ncmb(lat, lng){
    // (8) データストアに保存用クラスを作成
    /*****↓ここに記入*****/
    var GpsData = ncmb.DataStore("GpsData");
    /*****↑ここに記入*****/
    
    // (9) クラスのインスタンスを生成
    /*****↓ここに記入*****/
    var gpsData = new GpsData();
    /*****↑ここに記入*****/
    
    // (10) 位置情報オブジェクトを作成
    /*****↓ここに記入*****/
    var geoPoint = new ncmb.GeoPoint(); // (0,0)で生成
    geoPoint.latitude = lat;
    geoPoint.longitude = lng;
    /*****↑ここに記入*****/
    
    // (11) データの保存
    /*****↓ここに記入*****/
    gpsData.set("geoPoint", geoPoint).save();
    /*****↑ここに記入*****/
}

// 加速度センサーから値の取得に成功した場合のコールバック
function onAcceSuccess(acceleration) {
    if(acce_flag){
        
        //直前の重力加速度のデータ
        var o_x = 0;
        var o_y = 0;
        var o_z = 0;
        
        //各軸の加速度データ
        document.acce_js.x.value=acceleration.x;
        document.acce_js.y.value=acceleration.y;
        document.acce_js.z.value=acceleration.z;
        
        //重力加速度を計算
        //基本的に重力加速度は端末の角度に対し「下」に働く
        o_x = acceleration.x * 0.1 + o_x * (1.0 - 0.1);
    	o_y = acceleration.y * 0.1 + o_y * (1.0 - 0.1);
    	o_z = acceleration.z * 0.1 + o_z * (1.0 - 0.1);
    	
    	//重力加速度を抜いたそれぞれの軸の値
    	var last_x = acceleration.x - o_x;
    	var last_y = acceleration.y - o_y;
    	var last_z = acceleration.z - o_z;

        // センサーの値の変化を色で表示する
        if(Math.abs(last_x)>20 || Math.abs(last_y)>20 || Math.abs(last_z)>20){
            document.getElementById("color").src="js/img/red.png";//赤
        }else if(Math.abs(last_x)>13 || Math.abs(last_y)>13 || Math.abs(last_z)>13){
            document.getElementById("color").src="js/img/yellow.png";//黄
        }else{
            document.getElementById("color").src="js/img/blue.png";//青
        }

        var acce = [acceleration.x,acceleration.y,acceleration.z];
        acce_array.push(acce);
    }
};

// 加速度センサーから値の取得に失敗した場合のコールバック
function onAcceError() {
    console.log('onAcceError!');
};

// 加速度センサーから値をする時に設定するオプション
var acceOptions = {
    // 取得する間隔を0.5秒に設定
    frequency: 500
}; 

//ＧＰＳセンサーから位置情報の取得に成功した場合のコールバック
var onGeoSuccess = function(position){
    if(gps_flag){
        current = new CurrentPoint();
        //検索範囲の半径を保持する
        current.distance = CurrentPoint.distance;
        //位置情報(座標)を保存する
        current.geopoint = position.coords;
        $(".map").empty();
        writemap(current.geopoint.latitude,current.geopoint.longitude);
        document.gps_js.lat.value=current.geopoint.latitude;
        document.gps_js.lng.value=current.geopoint.longitude;
    }
};

// ＧＰセンサーから位置情報の取得に失敗した場合のコールバック
var onGeoError = function(error){
    console.log("現在位置を取得できませんでした");
};

// ＧＰＳセンサーから位置情報をする時に設定するオプション
var geoOption = {
    // 取得する間隔を１秒に設定
    frequency: 1000,
    // 6秒以内に取得できない場合はonGeoErrorコールバックに渡すよう設定
    timeout: 6000
};

// 位置情報を保持するクラスを作成
function CurrentPoint(){
    // 端末の位置情報を保持する
    geopoint=null;
    // 位置情報検索に利用するための検索距離を指定する
    distance=0;
}

// 位置情報を地図(OpenStreetMap)に表示する
function writemap(lat,lon) {
    // 現在地の地図を表示
    map = new OpenLayers.Map("canvas");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);
    console.log(lat+":"+lon);
    var lonLat = new OpenLayers.LonLat(lon, lat)
                               .transform(
                                   new OpenLayers.Projection("EPSG:4326"), 
                                   new OpenLayers.Projection("EPSG:900913")
                                );
    map.setCenter(lonLat, 15);

    // 現在地にマーカーを立てる
    var markers = new OpenLayers.Layer.Markers("Markers");
    map.addLayer(markers);

    var marker = new OpenLayers.Marker(
        new OpenLayers.LonLat(lon, lat)
                      .transform(
                          new OpenLayers.Projection("EPSG:4326"), 
                          new OpenLayers.Projection("EPSG:900913")
        )
    );
    markers.addMarker(marker);
}