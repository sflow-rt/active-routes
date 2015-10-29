// author: InMon Corp.
// version: 0.1
// date: 10/28/2015
// description: SDN Active Route Manager - hardware cache updates
// copyright: Copyright (c) 2015 InMon Corp. ALL RIGHTS RESERVED

var installed = {};
var recentlyRemoved = {};
var bgpPrevAdds= 0;
var bgpPrevRemoves = 0;
var cachePrevAdds = 0;
var cachePrevRemoves = 0;

setIntervalHandler(function() {
  let config = sharedGet('arm_config');
  if(!config || !config.reflectorIP) return;

  let now = Date.now();
  let top = bgpTopPrefixes(config.reflectorIP,config.targetPrefixes,config.targetMinValue,'egress',true,1,true);
  if(!top || !top.hasOwnProperty('topPrefixes')) return;

  let stats = {};
  let bgpadds = 0;
  let bgpremoves = 0;
  stats['bgp-nprefixes'] = top.nPrefixes;
  stats['bgp-adds'] = top.learnedPrefixesAdded - bgpPrevAdds;
  bgpPrevAdds = top.learnedPrefixesAdded;
  stats['bgp-removes'] = top.learnedPrefixesRemoved - bgpPrevRemoves;
  bgpPrevRemoves = top.learnedPrefixesRemoved;

  stats['active-prefixes'] = top.topPrefixes.length;
  stats['active-coverage'] = top.valuePercentCoverage;

  let covered = 0;

  if(config.targetIP) {
    let tgt = bgpTopPrefixes(config.targetIP,0);
    if(tgt && 'established' == tgt.state) {
      let hit = 0;
      let missRecent = 0;
      for(let i = 0; i < top.topPrefixes.length; i++) {
        let entry = top.topPrefixes[i];
        if(installed[entry.prefix]) hit += entry.value;
        else if(recentlyRemoved[entry.prefix]) missRecent += entry.value;
        if(entry.parentprefix) covered++;
        if(bgpAddRoute(config.targetIP,entry)) {
          installed[entry.prefix] = now; 
        }
      }
      recentlyRemoved = {};
      for(let prefix in installed) {
        let time = installed[prefix];
        if(time === now) continue;
        if(bgpRemoveRoute(config.targetIP,prefix)) {
          delete installed[prefix];
          recentlyRemoved[prefix] = now;
        } 
      }

      stats['cache-prefixes-added'] = tgt.pushedPrefixesAdded - cachePrevAdds;
      cachePrevAdds = tgt.pushedPrefixesAdded;
      stats['cache-prefixes-removed'] = tgt.pushedPrefixesRemoved - cachePrevRemoves;
      cachePrevRemoves = tgt.pushedPrefixesRemoved;
      stats['cache-prefixes'] = tgt.pushedPrefixesAdded - tgt.pushedPrefixesRemoved;
      stats['cache-hitrate'] = 100 * hit / Math.max(top.valueTotal,1);
      stats['cache-missrecent'] = 100 * missRecent / Math.max(top.valueTotal,1);  
    } else {
      stats['cache-prefixes-added'] = 0;
      stats['cache-prefixes-removed'] = 0;
      stats['cache-prefixes'] = 0;
      stats['cache-hitrate'] = 0;
      stats['cache-missrecent'] = 0;
    }
  } else {
    // simulate cache
    let hit = 0;
    let missRecent = 0;
    let added = 0;
    let removed = 0;
    let nprefixes = 0;
    for(let i = 0; i < top.topPrefixes.length; i++) {
      let entry = top.topPrefixes[i];
      if(installed[entry.prefix]) hit += entry.value;
      else if(recentlyRemoved[entry.prefix]) missRecent += entry.value;
      if(entry.parentprefix) covered++;
      if(!installed[entry.prefix]) added++;
      installed[entry.prefix] = now; 
    }
    recentlyRemoved = {};
    for(let prefix in installed) {
      let time = installed[prefix];
      if(time === now) {
        nprefixes++;
        continue;
      }
      removed++;
      delete installed[prefix];
      recentlyRemoved[prefix] = now;
    }

    stats['cache-prefixes-added'] = added;
    stats['cache-prefixes-removed'] = removed;
    stats['cache-prefixes'] = nprefixes;
    stats['cache-hitrate'] = 100 * hit / Math.max(top.valueTotal,1);
    stats['cache-missrate'] = 100 - stats['cache-hitrate'];
    stats['cache-missrecent'] = 100 * missRecent / Math.max(top.valueTotal,1);
  }
  stats['active-coveredprefixes'] = covered;

  sharedSet('arm_stats', stats);
}, 1);
