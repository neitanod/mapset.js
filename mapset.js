var MapSet = function(options){

  var defaults = {
      'lat': -37.329,
      'lng': -57.137,
      'zoom': 4
  }
  options = $.extend(defaults, options);

  var self = this;
  var google_map_instance = false;
  self.maps = [];
  self.current = false;
  top.maps = self.maps;
  self.immediate_container = $('<div id="reusable-map-immediate-container" style="min-width: 400px; min-height: 300px; width: 100%;"></div>');

  self.initialize_map = function(){
    if(!google_map_instance){
      var map_options = {
        center: new google.maps.LatLng(options.lat, options.lng),  // Argentina por default
        zoom: options.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      google_map_instance = new google.maps.Map(self.immediate_container[0], map_options);
      google.maps.event.addListener(google_map_instance, 'dragend',           (function(mapset){ return function(e){ return mapset.onEvent('dragend',e);           }})(self) );
      google.maps.event.addListener(google_map_instance, 'click',             (function(mapset){ return function(e){ return mapset.onEvent('click',e);             }})(self) );
      google.maps.event.addListener(google_map_instance, 'zoom_changed',      (function(mapset){ return function(e){ return mapset.onEvent('zoom_changed',e);      }})(self) );
      google.maps.event.addListener(google_map_instance, 'bounds_changed',    (function(mapset){ return function(e){ return mapset.onEvent('bounds_changed',e);    }})(self) );
      google.maps.event.addListener(google_map_instance, 'center_changed',    (function(mapset){ return function(e){ return mapset.onEvent('center_changed',e);    }})(self) );
      google.maps.event.addListener(google_map_instance, 'dblclick',          (function(mapset){ return function(e){ return mapset.onEvent('dblclick',e);          }})(self) );
      google.maps.event.addListener(google_map_instance, 'drag',              (function(mapset){ return function(e){ return mapset.onEvent('drag',e);              }})(self) );
      google.maps.event.addListener(google_map_instance, 'dragstart',         (function(mapset){ return function(e){ return mapset.onEvent('dragstart',e);         }})(self) );
      google.maps.event.addListener(google_map_instance, 'heading_changed',   (function(mapset){ return function(e){ return mapset.onEvent('heading_changed',e);   }})(self) );
      google.maps.event.addListener(google_map_instance, 'idle',              (function(mapset){ return function(e){ return mapset.onEvent('idle',e);              }})(self) );
      google.maps.event.addListener(google_map_instance, 'maptypeid_changed', (function(mapset){ return function(e){ return mapset.onEvent('maptypeid_changed',e); }})(self) );
      google.maps.event.addListener(google_map_instance, 'mousemove',         (function(mapset){ return function(e){ return mapset.onEvent('mousemove',e);         }})(self) );
      google.maps.event.addListener(google_map_instance, 'mouseout',          (function(mapset){ return function(e){ return mapset.onEvent('mouseout',e);          }})(self) );
      google.maps.event.addListener(google_map_instance, 'mouseover',         (function(mapset){ return function(e){ return mapset.onEvent('mouseover',e);         }})(self) );
      google.maps.event.addListener(google_map_instance, 'projection_changed',(function(mapset){ return function(e){ return mapset.onEvent('projection_changed',e);}})(self) );
      google.maps.event.addListener(google_map_instance, 'resize',            (function(mapset){ return function(e){ return mapset.onEvent('resize',e);            }})(self) );
      google.maps.event.addListener(google_map_instance, 'rightclick',        (function(mapset){ return function(e){ return mapset.onEvent('rightclick',e);        }})(self) );
      google.maps.event.addListener(google_map_instance, 'tilesloaded',       (function(mapset){ return function(e){ return mapset.onEvent('tilesloaded',e);       }})(self) );
      google.maps.event.addListener(google_map_instance, 'tilt_changed',      (function(mapset){ return function(e){ return mapset.onEvent('tilt_changed',e);      }})(self) );
    }
    return google_map_instance;
  }

  self.map = function(){
    return google_map_instance || self.initialize_map();
  }

  self.create = function($container){
    var id = Math.random()*10000000000;
    console.debug("MapSet.create id:", id);
    $container.attr('data-map-internal-id', id);
    var mapitem = self.maps[self.maps.push(new MapItem($.extend(options, {"set": self, "id": id, "container": $container, "map": self.map()})))-1];
    return mapitem;
  }

  this.put = function($container){
    console.debug("MapSet.put", $container);
    var id = $container.attr('data-map-internal-id');
    if(id){
      for(i in self.maps){
        if(self.maps[i].id == id){
          console.debug("Reusing map with id "+id);
          self.current && (self.previous = self.current);
          return self.current = self.maps[i];
        }
      }
    } else {
      self.current && (self.previous = self.current);
      return self.current = self.create($container);
    }
  }

  self.onEvent = function(event_type, event, data){
    // console.debug("Mapset.onEvent", event_type, event, data);
    self.current && self.current.onEvent(event_type, event, data);
  }
}





var MapItem = function(options){
  var defaults = {
      'lat': -37.329,
      'lng': -57.137,
      'zoom': 4
  }
  options = $.extend(defaults, options);
  var self = this;
  self.set = options.set?options.set:new Mapset();
  self.id = options.id?options.id:Math.random()*10000000000;
  self.container = options.container?options.container:$();
  self.event_listeners = {}
  self.data = {}

  self.initialize = function(options){
    self.center(options.lat, options.lng);
    self.zoom(options.zoom);
  }

  self.center = function(lat, lng){
    console.debug("MapItem.center",lat,lng);
    if( lat && lng ){
      var location = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
      self.set.map().setCenter(location);
      self.data.center = location;
      self.data.current_center = location;
    } else if( lat && lng == undefined ) {
      self.set.map().setCenter(lat);
      self.data.center = lat;
      self.data.current_center = lat;
    }
    return self;
  }

  self.zoom = function(zoom){
    console.debug("MapItem.zoom",zoom);
    zoom = parseInt(zoom, 10);
    if(zoom) {
      self.set.map().setZoom(zoom);
      self.data.zoom = zoom;
    }
    return self;
  }

  self.marker = function(lat, lng, options){
    console.debug("MapItem.marker", lat, lng);
    if( lat && lng ){
      var location = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    } else if( lat && lng == undefined ) {
      var location = lat;
    }

    options = $.extend({
        position: location,
        map: self.set.map()
      }, options || {});

    console.debug("OPTIONS:", options);

    var marker = new google.maps.Marker(options);
    self.data.markers || (  self.data.markers = []);
    self.data.markers.push(marker);
    var data = {"marker": marker};

    google.maps.event.addListener(marker, 'drag',        (function(mapitem, data){ return function(e){ return mapitem.set.onEvent('marker_drag',       e, data); }})(self, data)  );
    google.maps.event.addListener(marker, 'dragstart',   (function(mapitem, data){ return function(e){ return mapitem.set.onEvent('marker_dragstart',  e, data); }})(self, data)  );
    google.maps.event.addListener(marker, 'dragend',     (function(mapitem, data){ return function(e){ return mapitem.set.onEvent('marker_dragend',    e, data); }})(self, data)  );
    google.maps.event.addListener(marker, 'click',       (function(mapitem, data){ return function(e){ return mapitem.set.onEvent('marker_click',      e, data); }})(self, data)  );
    google.maps.event.addListener(marker, 'dblclick',    (function(mapitem, data){ return function(e){ return mapitem.set.onEvent('marker_dblclick',   e, data); }})(self, data)  );
    google.maps.event.addListener(marker, 'rightclick',  (function(mapitem, data){ return function(e){ return mapitem.set.onEvent('marker_rightclick', e, data); }})(self, data)  );

    return self;
  }

  self.fitAllMarkers = function(){
    if(self.data.markers && self.data.markers.length) {

      self.set.map().fitBounds(self.data.markers.reduce(function(bounds, marker) {
          return bounds.extend(marker.getPosition());
      }, new google.maps.LatLngBounds()));

      if(self.set.map().getZoom() > self.data.current_zoom){
        self.set.map().setZoom(self.data.current_zoom);
      } else {
        self.data.current_zoom = self.set.map().getZoom();
      }

    }
    return self;
  }

  self.suspendMarkers = function(){
    for(i in self.data.markers){
      self.data.markers[i].setMap(null);
    }
    return self;
  }

  self.removeMarkers = function(){
    for(i in self.data.markers){
      self.data.markers[i].setMap(null);
    }
    self.data.markers = [];
    return self;
  }

  self.restoreMarkers = function(){
    for(i in self.data.markers){
      self.data.markers[i].setMap(self.set.map());
    }
    return self;
  }

  self.show = function(){
    console.debug("MapItem.show");
    self.set.previous && self.set.previous.suspend && self.set.previous.suspend(); // suspend previous one
    self.do_show();
    return self;
  }

  self.do_show = function(){
    console.debug("MapItem.do_show");
    self
      .zoom(self.data.current_zoom)
      .center(self.data.current_center)
      .restoreMarkers()
      //.fitAllMarkers()
      .container.html("").append(self.set.immediate_container);
    return self;
  }

  self.suspend = function(){
    console.debug("MapItem.suspend");
    self.container.addClass('map-suspended').html("<div class=\"activate-map-msg\">Map suspended. Click here to reactivate.</div>");
    self.container.off('click').one('click',function(){ self.set.put(self.container).show(); });
    self.suspendMarkers();
    return self;
  }

  self.map = function(){
    return self.set.map();
  }

  self.onEvent = function(event_type, event, data){
    // console.debug("MapItem.onEvent", event_type);
    if(event_type == 'dragend') self.center(self.set.map().getCenter());
    if(event_type == 'zoom_changed') self.data.current_zoom = self.set.map().getZoom();
    if(self.event_listeners[event_type]) self.event_listeners[event_type](event, self, data);
  }

  self.on = function(event_type, callback){
    self.event_listeners[event_type] = callback;
    return self;
  }

  self.initialize(options);
}

var reusable_map = new MapSet();
