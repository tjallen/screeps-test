let action = new Creep.Action('boosting');
module.exports = action;
action.targetRange = 3;
action.isValidAction = function(creep){
  if (creep.data.destiny.boosts && creep.ticksToLive >= RENEW_THRESHOLD) {
      return true;
    }
    return false;
  };
  // check squad is in room
action.isAddableAction = function(creep){
  if (creep.data.destiny.squad) {
    if (creep.squadRoleCall(creep) === true) {
      return true;
    }
  }
  return false;
};
action.isAddableTarget = function(target){ return true; };
action.newTarget = function(creep){
    return FlagDir.specialFlag();
};
action.step = function(creep){
  // what boosts are needed?
  // find which lab relevant boosts are in
  // sequentially moveTo nearest, lab boosts
  // when boost length = 0; remove from queue, go to guard
  // console.log('data', creep.data.destiny.boosts, creep.data.destiny.boosts.length);
  // check existing boosts
  var boosted;
  creep.body.forEach((p) => {
    if (p.boost !== undefined) {
      // console.log(creep, 'is boosted');
      boosted = true;
    }
  });
  // if no boosts & need a renew, go renew instead
  if (creep.ticksToLive < RENEW_THRESHOLD && !boosted) {
    Creep.action.staging.assign(creep);
    // console.log('go renew');
  }
  // otherwise boost
  if (creep.data.destiny.boosts.length === 0) {
    // console.log('boosts done m8');
    // Creep.action.guarding.assign(creep);
    delete creep.data.destiny.boosts;
  } else {
    let mineral;
    
    switch (creep.data.destiny.boosts[0]) {
      case 'tough': {
        mineral = 'XGHO2';
        break;
      }
      case 'heal': {
        mineral = 'XLHO2';
        break;
      }
      case 'move': {
        mineral = 'XZHO2';
        break;
      }
      case 'work': {
        mineral = 'XZH2O';
        break;
      }
      case 'attack': {
        mineral = 'XUH2O';
        break;
      }
      case 'ranged_attack': {
        mineral = 'XKHO2';
        break;
      }
    }
    // console.log(mineral);
    let labs = creep.room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => ( structure.structureType == STRUCTURE_LAB && structure.mineralType === mineral )
    });
    
    var closestFilledLab = creep.pos.findClosestByPath(labs);
    var rangeToLab = creep.pos.getRangeTo(closestFilledLab);
    creep.moveTo(closestFilledLab);
    // console.log(closestFilledLab, rangeToLab);
    
    if (rangeToLab <= 1) {
      Game.getObjectById(closestFilledLab.id).boostCreep(creep);
      // console.log('creep boosted wahey');
      // console.log('pop', Memory.population[creep.name].destiny.boosts);
      Memory.population[creep.name].destiny.boosts.splice(0, 1);
    }
  }
  // let labs = creep.room.find(FIND_MY_STRUCTURES, {
  //   filter: (structure) => ( structure.structureType == STRUCTURE_LAB && structure.mineralType === 'XGHO2' )
  // });
  // var lab = creep.pos.findClosestByPath(labs);
  // creep.moveTo(lab);
  // // console.log(lab.mineralType);
  
  


    if(CHATTY) creep.say(this.name, SAY_PUBLIC);

};
action.onAssignment = function(creep, target) {
    if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9835), SAY_PUBLIC);
};
