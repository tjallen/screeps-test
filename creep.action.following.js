let action = new Creep.Action('following');
module.exports = action;
action.isAddableAction = function(creep){
  return true;
};
action.isValidAction = function(creep){
  var ret;
  var hostileCrp = creep.room.find(FIND_HOSTILE_CREEPS);
  var hostileStr = creep.room.find(FIND_HOSTILE_STRUCTURES);
  if (hostileCrp.length || hostileStr.length) {
    ret = true;
  } else {
    ret = false;
  }
  // console.log('isV', ret);
  return ret;
};
action.isAddableTarget = function(target){ 
  // console.log('isAT', target.my);
  return target.my;
};
// action.reachedRange = 0;
action.newTarget = function(creep){
  var targets = creep.room.find(FIND_MY_CREEPS);
  var fighters = _.filter(targets, (c) => c.hasActiveBodyparts([WORK, ATTACK, RANGED_ATTACK]));
  var target;
  if (fighters.length) {
    target = (creep.pos.findClosestByPath(fighters));
    console.log(target);
  } else {
    target = creep.pos.findClosestByPath(targets);
    console.log(target);
  }
  // console.log(target);
  return target;
};
action.work = function(creep){
  console.log(creep, creep.target);
  if(creep.room.casualties.length > 0){
      Creep.action.healing.assign(creep);
  } // else if (creep.room) var flag = FlagDir.find(FLAG_COLOR.invade, creep.pos);
};
action.onAssignment = function(creep, target) {
    if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9929), SAY_PUBLIC);
};
