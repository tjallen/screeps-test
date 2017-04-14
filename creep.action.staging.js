let action = new Creep.Action('staging');
module.exports = action;
action.isValidAction = function(creep) {
  // console.log('stg', 'isV', creep.ticksToLive < RENEW_THRESHOLD);
  if (creep.ticksToLive < RENEW_TARGET) {
    if (creep.pos.roomName === creep.data.destiny.stagingRoom) {
      return true;
    }
  } 
};
action.isAddableAction = function(creep){ 
  // console.log('stg', 'isA', creep.pos.roomName === creep.data.destiny.stagingRoom);
  // console.log(creep.pos.roomName, creep.data.destiny.stagingRoom);
    if (creep.pos.roomName === creep.data.destiny.stagingRoom && creep.ticksToLive < RENEW_THRESHOLD) {
      return true;
    }
  };
action.isAddableTarget = function(target){ return true; };
action.newTarget = function(creep){
    var flag;
    if( creep.data.destiny ) flag = Game.flags[creep.data.destiny.flagName];
    if ( !flag ) {
        flag = FlagDir.find(FLAG_COLOR.defense, creep.pos, false, FlagDir.rangeMod, {
            rangeModPerCrowd: 400
            //rangeModByType: creep.data.creepType
        });
    }

    if( creep.action && creep.action.name == 'staging' && creep.flag )
        return creep.flag;
    if( flag ) Population.registerCreepFlag(creep, flag);
    return flag;
};
action.step = function(creep){
    let boosted = false;
    creep.body.forEach((p) => {
      if (p.boost !== undefined) {
        // console.log(creep, 'is boosted');
        boosted = true;
      }
    });
    if (creep.ticksToLive < RENEW_THRESHOLD && !boosted) {
      creep.data.renewing = true;
    } else {
      if (creep.data.destiny.boosts) {
        // Creep.action.boosting.assign(creep);
      } else {
        // Creep.action.guarding.assign(creep);
      }
    }
    
    if (creep.data.renewing) {
      if (creep.ticksToLive < RENEW_TARGET) {
        var spawns = creep.room.find(FIND_MY_SPAWNS).filter((s) => !s.spawning);
        var closeSpawn = creep.pos.findClosestByPath(spawns);
        if (creep.pos.getRangeTo(closeSpawn) > 1) {
          creep.moveTo(closeSpawn)
        } else {
          var bodySize = creep.body.length;
          var remaining = creep.ticksToLive;
          var totalLifeRequired = 1500 - remaining;
          var renewAmount = Math.floor(600 / bodySize);
          if (closeSpawn.renewCreep(creep) !== 0) {
            if (Game.time % 10 === 0) {
              if (closeSpawn.renewCreep(creep) === -8) {
                logError(`${creep} totalLifeRequired ${totalLifeRequired} lower than renewAmount ${renewAmount}, waiting...`);
              } else {
                logError('spawn renew error', closeSpawn.renewCreep(creep));
              }
            }
          } else {
            console.log(`renewing ${creep} at ${renewAmount} per tick`);
            closeSpawn.renewCreep(creep);
          }
        }
      } else {
        creep.data.renewing = false;
        delete creep.data.renewing;
      }
    }
    
    // TODO if room.boostQueue = creepName, go to flag that matches creep name
    // TODO if boosted, action.assign back to guarding army flag
};
action.onAssignment = function(creep, target) {
    if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9835), SAY_PUBLIC);
};


/*// check if creep.data.stagingRoom = curr room
// if not, return / guard
// if TTL < 80%? move to spawn & renew
// if room.boostQueue = creepName, go get boosts which match parts

let action = new Creep.Action('staging');
module.exports = action;
action.isValidAction = function(creep) {
  // check if creep.data.stagingRoom = curr room
  // if (!creep.data.destiny.squad) {
  //   return false;
  // }
  // var squad = creep.data.destiny.squad;
  // var stagingRoom = Memory.army[squad].stagingRoom;
  // console.log(squad, stagingRoom, creep.room.name);
  // if (creep.room.name === stagingRoom) {
  //    return true;
  // }
  return true;
};
action.isAddableAction = function(){ return true; };
action.isAddableTarget = function(){ return true; };
action.newTarget = function(creep){
    var flag;
    if( creep.data.destiny ) flag = Game.flags[creep.data.destiny.flagName];
    if ( !flag ) {
        flag = FlagDir.find(FLAG_COLOR.defense, creep.pos, false, FlagDir.rangeMod, {
            rangeModPerCrowd: 400
            //rangeModByType: creep.data.creepType
        });
    }

    // if( creep.action && creep.action.name == 'staging' && creep.flag )
    //     return creep.flag;
    // if( flag ) Population.registerCreepFlag(creep, flag);
    // return flag;
};
action.work = function(creep){
  console.log(creep, creep.target);
    // if( creep.data.flagName )
    //     return OK;
    // else return ERR_INVALID_ARGS;
    // TODO if TTL < 80%? && !boosted, move to nearest spawn for renew
    console.log(creep.ticksToLive);
    let boosted = false;
    creep.body.forEach((p) => {
      if (p.boost !== undefined) {
        console.log(creep, 'is boosted');
        boosted = true;
      }
    });
    if (creep.ticksToLive < 1400 && !boosted) {
      // find nearest spawn
      // move to spawn
      var spawns = creep.room.find(FIND_MY_SPAWNS);
      var closeSpawn = creep.pos.findClosestByPath(spawns);
      // creep.data.destiny.targetName = closeSpawn;
      creep.data.targetId = closeSpawn.id;
      if (creep.pos.getRangeTo(closeSpawn) > 1) {
        creep.moveTo(closeSpawn)
        return;
      } else {
        console.log(creep, 'ready to renew', closeSpawn);
        closeSpawn.renew(creep);
      }
    } else {
      console.log('lab time');
      var labs = creep.room.find(FIND_MY_STRUCTURES);
      // console.log(room.labs);
    }
    // TODO if room.boostQueue = creepName, go to flag that matches creep name
    // TODO if boosted, action.assign back to guarding army flag
};
action.onAssignment = function(creep, target) {
    if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9929), SAY_PUBLIC);
};
*/