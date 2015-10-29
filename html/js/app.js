$(function() { 
  var restPath =  '../scripts/active.js/';
  var dataURL = restPath + 'trend/json';        

  var backgroundColor = '#ffffff';
  var SEP = '_SEP_';
  var colors = [
    '#3366cc','#dc3912','#ff9900','#109618','#990099','#0099c6','#dd4477',
    '#66aa00','#b82e2e','#316395','#994499','#22aa99','#aaaa11','#6633cc',
    '#e67300','#8b0707','#651067','#329262','#5574a6','#3b3eac','#b77322',
    '#16d620','#b91383','#f4359e','#9c5935','#a9c413','#2a778d','#668d1c',
    '#bea413','#0c5922','#743411'
  ];

  var defaults = {
    tab:0,
    overall0:'show',
    overall1:'hide',
    overall2:'hide',
    cache0:'show',
    cache1:'hide',
    res0:'show',
    res1:'hide',
    hlp0:'hide',
    hlp1:'hide'
  };

  var state = {};
  $.extend(state,defaults);
        
  function createQuery(params) {
    var query, key, value;
    for(key in params) {
      value = params[key];
      if(value == defaults[key]) continue;
      if(query) query += '&';
      else query = '';
      query += encodeURIComponent(key)+'='+encodeURIComponent(value);
    }
    return query;
  }

  function getState(key, defVal) {
    return window.sessionStorage.getItem(key) || state[key] || defVal;
  }

  function setState(key, val, showQuery) {
    state[key] = val;
    window.sessionStorage.setItem(key, val);
    if(showQuery) {
      var query = createQuery(state);
      window.history.replaceState({},'',query ? '?' + query : './');
    }
  }

  function setQueryParams(query) {
    var vars, params, i, pair;
    vars = query.split('&');
    params = {};
    for(i = 0; i < vars.length; i++) {
      pair = vars[i].split('=');
      if(pair.length == 2) setState(decodeURIComponent(pair[0]), decodeURIComponent(pair[1]),false);
    }
  }

  var search = window.location.search;
  if(search) setQueryParams(search.substring(1));
   
  $('#clone_button').button({icons:{primary:'ui-icon-newwin'},text:false}).click(function() {
    window.open(window.location);
  });

  $('#overall-acc > div').each(function(idx) {
    $(this).accordion({
      heightStyle:'content',
      collapsible: true,
      active: getState('overall'+idx, 'hide') == 'show' ? 0 : false,
      activate: function(event, ui) {
        var newIndex = $(this).accordion('option','active');
        setState('overall'+idx, newIndex === 0 ? 'show' : 'hide', true);
        $.event.trigger({type:'updateChart'});
      }
    });
  });

  $('#cache-acc > div').each(function(idx) {
    $(this).accordion({
      heightStyle:'content',
      collapsible: true,
      active: getState('cache'+idx, 'hide') == 'show' ? 0 : false,
      activate: function(event, ui) {
        var newIndex = $(this).accordion('option','active');
        setState('cache'+idx, newIndex === 0 ? 'show' : 'hide', true);
        $.event.trigger({type:'updateChart'});
      }
    });
  });
  
  $('#resources-acc > div').each(function(idx) {
    $(this).accordion({
      heightStyle:'content',
      collapsible: true,
      active: getState('res'+idx, 'hide') == 'show' ? 0 : false,
      activate: function(event, ui) {
        var newIndex = $(this).accordion('option','active');
        setState('res'+idx, newIndex === 0 ? 'show' : 'hide', true);
        $.event.trigger({type:'updateChart'});
      }
    });
  });

  $('#help-acc > div').each(function(idx) {
    $(this).accordion({
      heightStyle:'content',
      collapsible: true,
      active: getState('hlp'+idx, 'hide') === 'show' ? 0 : false,
      activate: function(event, ui) {
        var newIndex = $(this).accordion('option','active');
        setState('hlp'+idx, newIndex === 0 ? 'show' : 'hide', true);
      }
    });
  });


  $('#tabs').tabs({
    active: getState('tab', 0),
    activate: function(event, ui) {
      var newIndex = ui.newTab.index();
      setState('tab', newIndex, true);
      $.event.trigger({type:'updateChart'});
    },
    create: function(event,ui) {
      $.event.trigger({type:'updateChart'});
    }
  }); 

  // define charts
  var db = {};
  $('#toppaths').chart({
    type: 'topn',
    metric: 'top-dst-aspath',
    stack:true,
    includeOther:false,
    legendHeadings: ['Dst. AS Path'],
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Bits per Second'},
  db);
  $('#topasns').chart({
    type: 'topn',
    metric: 'top-dst-as',
    stack:true,
    includeOther:false,
    legendHeadings: ['Dst. AS'],
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Bits per Second'},
  db);
  $('#toppeers').chart({
    type: 'topn',
    metric: 'top-dst-peer-as',
    stack:true,
    includeOther:false,
    legendHeadings: ['Dst. Peer AS'],
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Bits per Second'},
  db);
  $('#topsrcasns').chart({
    type: 'topn',
    metric: 'top-src-as',
    stack:true,
    includeOther:false,
    legendHeadings: ['Src. AS'],
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Bits per Second'},
  db);
  $('#prefixes').chart({
    type: 'trend',
    metrics: ['bgp-nprefixes'],
    stack:false,
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Total Prefixes'},
  db);
  $('#prefixchanges').chart({
    type: 'trend',
    metrics: ['bgp-adds','bgp-removes'],
    stack:false,
    legend:['Adds','Removes'],
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Prefixes per Second'},
  db);
  $('#cachedprefixes').chart({
    type: 'trend',
    metrics: ['cache-prefixes'],
    stack:false,
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Total Prefixes'},
  db);
  $('#cachedprefixchanges').chart({
    type: 'trend',
    metrics: ['cache-prefixes-added','cache-prefixes-removed'],
    stack:false,
    legend:['Adds','Removes'],
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Prefixes per Second'},
  db);
  $('#cachedhitrate').chart({
    type: 'trend',
    metrics: ['cache-missadd','cache-missdelete'],
    legend: ['New','Deleted'],
    stack:true,
    colors: colors,
    backgroundColor: backgroundColor,
    units: '%Cache Misses'},
  db);
  $('#activeprefixes').chart({
    type: 'trend',
    metrics: ['active-activeprefixes','active-coveredprefixes'],
    legend: ['Active','Covered'],
    stack:true,
    colors: colors,
    backgroundColor: backgroundColor,
    units: 'Prefixes'},
  db);
  $('#activecoverage').chart({
    type: 'trend',
    metrics: ['active-coverage'],
    stack:false,
    colors: colors,
    backgroundColor: backgroundColor,
    units: '%Active Prefix Traffic'},
  db);
  $('#cpu').chart({
    type: 'trend',
    legend: ['CPU Utilization','Load per Core','Memory Utilization','Disk Utilization','Disk Partition Utilization'],
    metrics:['cpu_util','load_per_cpu','mem_util','disk_util','part_max_util'],
    colors:colors,
    backgroundColor: backgroundColor,
    units: 'Percentage'},
  db);
  $('#fwd').chart({
    type: 'trend',
    legend: ['Host Table','MAC Table','IPv4 Table','IPv6 Table','IPv4/IPv6 Table','Long IPv6 Table','Total Routes','ECMP Nexthops Table'],
    metrics:['hw_host_util','hw_mac_util','hw_ipv4_util','hw_ipv6_util','hw_ipv4_ipv6_util','hw_ipv6_long_util','hw_total_routes_util','hw_ecmp_nexthops_util'],
    colors:colors,
    backgroundColor: backgroundColor,
    units: 'Percentage'},
  db);
  $('#acl').chart({
    type: 'trend',
    legend: ['ACL Ingress Table','ACL Ingress Meters Table','ACL Ingress Counters Table','ACL Egress Table','ACL Egress Meters Table','ACL Egress Counters Table'],
    metrics:['hw_acl_ingress_util','hw_acl_ingress_meters_util','hw_acl_ingress_counters_util','hw_acl_egress_util','hw_acl_egress_meters_util','hw_acl_egress_counters_util'],
    colors:colors,
    backgroundColor: backgroundColor,
    units: 'Percentage'},
  db);
  $('#routercpu').chart({
    type: 'trend',
    legend: ['CPU Utilization','Load per Core','Memory Utilization','Disk Utilization','Disk Partition Utilization'],
    metrics:['router_cpu_util','router_load_per_cpu','router_mem_util','router_disk_util','router_part_max_util'],
    colors:colors,
    backgroundColor: backgroundColor,
    units: 'Percentage'},
  db);

  function updateData(data) {
    if(!data 
      || !data.trend 
      || !data.trend.times 
      || data.trend.times.length == 0) return;

    if(db.trend) {
      // merge in new data
      var maxPoints = db.trend.maxPoints;
      var remove = db.trend.times.length > maxPoints ? db.trend.times.length - maxPoints : 0;
      db.trend.times = db.trend.times.concat(data.trend.times);
      if(remove) db.trend.times = db.trend.times.slice(remove);
      for(var name in db.trend.trends) {
        db.trend.trends[name] = db.trend.trends[name].concat(data.trend.trends[name]);
        if(remove) db.trend.trends[name] = db.trend.trends[name].slice(remove);
      }
    } else db.trend = data.trend;

    db.trend.start = new Date(db.trend.times[0]);
    db.trend.end = new Date(db.trend.times[db.trend.times.length - 1]);

    $.event.trigger({type:'updateChart'});
  }

  function pollTrends() {
    $.ajax({
      url: dataURL,
      data: db.trend && db.trend.end ? {after:db.trend.end.getTime()} : null,
      success: function(data) {
        updateData(data);
        setTimeout(pollTrends, 1000);
      },
      error: function(result,status,errorThrown) {
        setTimeout(pollTrends,5000);
      },
      timeout: 60000
    });
  };

  $(window).resize(function() {
    $.event.trigger({type:'updateChart'});
  });

   $(document).ready(function() {
    pollTrends();
  });
});
