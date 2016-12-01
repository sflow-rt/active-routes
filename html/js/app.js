$(function() { 
  var restPath =  '../scripts/active.js/';
  var dataURL = restPath + 'trend/json';        

  var SEP = '_SEP_';

  var defaults = {
    tab:0,
    overall0:'show',
    overall1:'hide',
    overall2:'hide',
    cache0:'show',
    cache1:'hide',
    cache2:'hide',
    cache60:'show',
    cache61:'hide',
    cache62:'hide',
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

  $('#cache6-acc > div').each(function(idx) {
    $(this).accordion({
      heightStyle:'content',
      collapsible: true,
      active: getState('cache6'+idx, 'hide') == 'show' ? 0 : false,
      activate: function(event, ui) {
        var newIndex = $(this).accordion('option','active');
        setState('cache6'+idx, newIndex === 0 ? 'show' : 'hide', true);
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
    units: 'Bits per Second'},
  db);
  $('#topasns').chart({
    type: 'topn',
    metric: 'top-dst-as',
    stack:true,
    includeOther:false,
    legendHeadings: ['Dst. AS'],
    units: 'Bits per Second'},
  db);
  $('#toppeers').chart({
    type: 'topn',
    metric: 'top-dst-peer-as',
    stack:true,
    includeOther:false,
    legendHeadings: ['Dst. Peer AS'],
    units: 'Bits per Second'},
  db);
  $('#topsrcasns').chart({
    type: 'topn',
    metric: 'top-src-as',
    stack:true,
    includeOther:false,
    legendHeadings: ['Src. AS'],
    units: 'Bits per Second'},
  db);

  // IPv4 Prefixes
  $('#prefixes').chart({
    type: 'trend',
    metrics: ['bgp-nprefixes'],
    stack:false,
    units: 'Total Prefixes'},
  db);
  $('#prefixchanges').chart({
    type: 'trend',
    metrics: ['bgp-adds','bgp-removes'],
    stack:false,
    legend:['Adds','Removes'],
    units: 'Prefixes per Second'},
  db);
  $('#cachedprefixes').chart({
    type: 'trend',
    metrics: ['cache-prefixes'],
    stack:false,
    units: 'Total Prefixes'},
  db);
  $('#cachedprefixchanges').chart({
    type: 'trend',
    metrics: ['cache-prefixes-added','cache-prefixes-removed'],
    stack:false,
    legend:['Adds','Removes'],
    units: 'Prefixes per Second'},
  db);
  $('#cachedhitrate').chart({
    type: 'trend',
    metrics: ['cache-missadd','cache-missdelete'],
    legend: ['New','Deleted'],
    stack:true,
    units: '%Cache Misses'},
  db);
  $('#activeprefixes').chart({
    type: 'trend',
    metrics: ['active-activeprefixes','active-coveredprefixes'],
    legend: ['Active','Covered'],
    stack:true,
    units: 'Prefixes'},
  db);
  $('#activecoverage').chart({
    type: 'trend',
    metrics: ['active-coverage'],
    stack:false,
    units: '%Active Prefix Traffic'},
  db);

  // IPv6 Prefixes
  $('#prefixes6').chart({
    type: 'trend',
    metrics: ['bgp-nprefixes6'],
    stack:false,
    units: 'Total Prefixes'},
  db);
  $('#prefixchanges6').chart({
    type: 'trend',
    metrics: ['bgp-adds6','bgp-removes6'],
    stack:false,
    legend:['Adds','Removes'],
    units: 'Prefixes per Second'},
  db);
  $('#cachedprefixes6').chart({
    type: 'trend',
    metrics: ['cache-prefixes6'],
    stack:false,
    units: 'Total Prefixes'},
  db);
  $('#cachedprefixchanges6').chart({
    type: 'trend',
    metrics: ['cache-prefixes-added6','cache-prefixes-removed6'],
    stack:false,
    legend:['Adds','Removes'],
    units: 'Prefixes per Second'},
  db);
  $('#cachedhitrate6').chart({
    type: 'trend',
    metrics: ['cache-missadd6','cache-missdelete6'],
    legend: ['New','Deleted'],
    stack:true,
    units: '%Cache Misses'},
  db);
  $('#activeprefixes6').chart({
    type: 'trend',
    metrics: ['active-activeprefixes6','active-coveredprefixes6'],
    legend: ['Active','Covered'],
    stack:true,
    units: 'Prefixes'},
  db);
  $('#activecoverage6').chart({
    type: 'trend',
    metrics: ['active-coverage6'],
    stack:false,
    units: '%Active Prefix Traffic'},
  db);

  // Resources
  $('#cpu').chart({
    type: 'trend',
    legend: ['CPU Utilization','Load per Core','Memory Utilization','Disk Utilization','Disk Partition Utilization'],
    metrics:['cpu_util','load_per_cpu','mem_util','disk_util','part_max_util'],
    units: 'Percentage'},
  db);
  $('#fwd').chart({
    type: 'trend',
    legend: ['Host Table','MAC Table','IPv4 Table','IPv6 Table','IPv4/IPv6 Table','Long IPv6 Table','Total Routes','ECMP Nexthops Table'],
    metrics:['hw_host_util','hw_mac_util','hw_ipv4_util','hw_ipv6_util','hw_ipv4_ipv6_util','hw_ipv6_long_util','hw_total_routes_util','hw_ecmp_nexthops_util'],
    units: 'Percentage'},
  db);
  $('#acl').chart({
    type: 'trend',
    legend: ['ACL Ingress Table','ACL Ingress Meters Table','ACL Ingress Counters Table','ACL Egress Table','ACL Egress Meters Table','ACL Egress Counters Table'],
    metrics:['hw_acl_ingress_util','hw_acl_ingress_meters_util','hw_acl_ingress_counters_util','hw_acl_egress_util','hw_acl_egress_meters_util','hw_acl_egress_counters_util'],
    units: 'Percentage'},
  db);
  $('#routercpu').chart({
    type: 'trend',
    legend: ['CPU Utilization','Load per Core','Memory Utilization','Disk Utilization','Disk Partition Utilization'],
    metrics:['router_cpu_util','router_load_per_cpu','router_mem_util','router_disk_util','router_part_max_util'],
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
