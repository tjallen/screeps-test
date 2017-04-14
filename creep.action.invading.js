let action = new Creep.Action('invading');
module.exports = action;
action.isValidAction = function(creep) {
  // squad creep validity
  if (creep.data.destiny.squad) {
    var squadName = creep.data.destiny.squad;
    var retreatFlags = FlagDir.filter(FLAG_COLOR.invade.retreat, creep.pos, false);
    if (retreatFlags.length) {
      var matchedRetreatFlag = _.find(retreatFlags, {name: `${squadName}_ret`}, 0);
      if (matchedRetreatFlag) return false;
    }
    var invasionFlags = FlagDir.filter(FLAG_COLOR.invade, creep.pos, false);
    if (invasionFlags.length) {
      var matchedInvasionFlag = _.find(invasionFlags, {name: `${squadName}_inv`}, 0);
      if (matchedInvasionFlag) {
        // console.log(creep, 'found flag', matchedInvasionFlag.name);
        return true;
      }
    }
  } else {
    
    // other creep validity
    var retreat = FlagDir.find(FLAG_COLOR.invade.retreat, creep.pos, false);
    if (retreat) return false;
    var invasionFlags = FlagDir.filter(FLAG_COLOR.invade, creep.pos, false);
    if (invasionFlags.length) {
      var nameLength = invasionFlags[0].name.length;
      if (invasionFlags[0].name.charAt(nameLength - 4) === '_') {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
};
action.isAddableAction = function(creep){
  if (creep.data.destiny.squad) {
    // check for formation
    if (creep.pos.roomName === creep.data.destiny.stagingRoom) {
      if (!creep.invasionFormationCheck(creep, 2)) {
        // logError(creep, 'squad not prepared for invasion');
        return false;
      }
    }
  }
  return true;
};
action.isAddableTarget = function(){ return true; };
action.getFlaggedStructure = function(flagColor, pos){
    let flagsEntries = FlagDir.filter(flagColor, pos, true);
    let target = [];
    let checkFlag = flagEntry => {
        var flag = Game.flags[flagEntry.name];
        if( flag && flag.pos.roomName == pos.roomName && flag.room !== undefined ){ // room is visible
            var targets = flag.room.lookForAt(LOOK_STRUCTURES, flag.pos.x, flag.pos.y);
            if( targets && targets.length > 0){
              console.log('ye');
                addTarget = structure => {
                    structure.destroyFlag = flag;
                    target.push(structure);
                };
                targets.forEach(addTarget);
            }
            else { // remove flag. try next flag
                flag.remove();
            }
        }
    };
    flagsEntries.forEach(checkFlag);
    if( target && target.length > 0 ) return pos.findClosestByRange(target);
    return null;
};
action.newTarget = function(creep){
    var destroy = this.getFlaggedStructure(FLAG_COLOR.destroy, creep.pos);
    if( destroy ) {
        if( destroy.destroyFlag ) Population.registerCreepFlag(creep, destroy.destroyFlag);
        return destroy;
    }
    // move to invasion room
    var flag = FlagDir.find(FLAG_COLOR.invade, creep.pos);
    if( flag && (!flag.room || flag.pos.roomName != creep.pos.roomName)){
        Population.registerCreepFlag(creep, flag);
        return flag; // other room
    }
    if( !flag ){
        // unregister
        creep.action = null;
        delete creep.data.actionName;
        delete creep.data.targetId;
        return;
    }

    if( !flag.room.controller || !flag.room.controller.my ) {
      
/*      // pure healer rules
    if (creep.hasActiveBodyparts([HEAL]) && !creep.hasActiveBodyparts([ATTACK, RANGED_ATTACK])) {
        console.log(creep, 'pure healer');
        // var creeps = creep.room.find(FIND_MY_CREEPS);
        var casualties = _.filter(creep.room.find(FIND_MY_CREEPS), (c) => c.hits < c.hitsMax).sort((a, b) => a.hits - b.hits);
        console.log(casualties);
        if (casualties.length === 0) {
          var dismantlers = _.filter(creep.room.find(FIND_MY_CREEPS), (c) => c.hasBodyparts[WORK]);
          if (dismantlers.length) {
            creep.target = (creep.pos.findClosestByPath(dismantlers));
          } else {
            var fighters = _.filter(creep.room.find(FIND_MY_CREEPS), (c) => c.hasBodyparts[ATTACK, RANGED_ATTACK]);
            creep.target = (creep.pos.findClosestByPath(fighters));
          }
        } else {
          creep.target = casualties[0];
        }
        
  
        // creep.pos.findClosestByPath(FIND_MY_CREEPS);
        // creep.target = 
        console.log('healer has run', creep, creep.target);
      }
        //attack healer
        var target = creep.pos.findClosestByRange(creep.room.hostiles, {
            function(hostile){ return _.some(hostile.body, {'type': HEAL}); }
        });
        if( target )
            return target;
        //attack attacker
        target = creep.pos.findClosestByRange(creep.room.hostiles, {
            function(hostile){ return _.some(hostile.body, function(part){return part.type == ATTACK || part.type == RANGED_ATTACK;}); }
        });
        if( target )
            return target;

        // attack tower
       target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        if( target )
            return target;
        // attack remaining creeps
        target = creep.pos.findClosestByRange(creep.room.hostiles);
        if( target )
            return target;
        // attack spawn
        target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_SPAWN;
            }
        });
        if( target )
            return target;
        // attack structures
        target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter : (structure) => {
                return ((structure.structureType !== STRUCTURE_CONTROLLER) && ( structure.structureType !== STRUCTURE_KEEPER_LAIR));
            }
        });
        if( target )
            return target;
        // attack construction sites
        target = creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES);
        if( target )
            return target;*/
            
            
      // healer rules
            
      if (creep.hasActiveBodyparts([HEAL]) && !creep.hasActiveBodyparts([ATTACK, RANGED_ATTACK])) {
          console.log(creep, 'pure healer', creep.hasBodyparts([HEAL]));
          var creeps = creep.room.find(FIND_MY_CREEPS);
          var casualties = _.filter(creeps, (c) => c.hits < c.hitsMax).sort((a, b) => a.hits - b.hits);
          if (casualties.length === 0) {
            var dismantlers = _.filter(creeps, (c) => c.hasBodyparts([WORK]));
            if (dismantlers.length) {
              creep.target = (creep.pos.findClosestByPath(dismantlers));
            } else {
              var fighters = _.filter(creeps, (c) => c.hasBodyparts([ATTACK, RANGED_ATTACK]));
              if (fighters.length) {
                creep.target = (creep.pos.findClosestByPath(fighters));
              } else {
                creep.target = creep.pos.findClosestByPath(creeps);
              }
              
            }
          } else {
            creep.target = casualties[0];
          }
        } else {
          // non healer rules
          var fightRange = 50;
          
          // TODO if enemy within 5 tiles, go kill, UNLESS no path
          var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
          if (hostiles.length) {
            var closestHostile = creep.pos.findClosestByPath(hostiles);
            var rangeToHostile = creep.pos.getRangeTo(closestHostile.pos.x, closestHostile.pos.y); // error can occur here
            if (rangeToHostile <= fightRange) {
              creep.target = closestHostile;
            }
          }

          // TODO if orange/orange flag, go destroy that
          // TODO if e > 5 tiles, move towards, UNLESS no path
        }
            

    }
    
    // console.log(`=> target calc ${creep}, ${creep.target}, ${debug}rng`);
    
    // no target found
    // flag.remove();
    // return null;
};
action.step = function(creep){
  // console.log('step', creep);
    if(CHATTY) creep.say(this.name);
    if( (creep.target instanceof Flag) && (creep.target.pos.roomName == creep.pos.roomName))
        this.assign(creep);
    this.run[creep.data.creepType](creep);
};
action.run = {
  healer: function(creep){
    
      if( !creep.flee ){
          if( creep.target instanceof Flag ){
              creep.travelTo( creep.target );
              return;
          } else if( creep.target instanceof ConstructionSite ){
              creep.travelTo( creep.target, {range:0});
              return;
          }
          creep.travelTo( creep.target );
      }
      if( creep.target.my ) 
          creep.healing = creep.heal(creep.target) == OK;
      if (Game.time % 5 === 0) console.log('===> RUN:', creep, creep.target);
  },
    melee: function(creep){
        if( !creep.flee ){
            if( creep.target instanceof Flag ){
                creep.travelTo( creep.target );
                return;
            } else if( creep.target instanceof ConstructionSite ){
                creep.travelTo( creep.target, {range:0});
                return;
            }
            creep.travelTo( creep.target );
        }
        if( !creep.target.my )
            creep.attacking = creep.attack(creep.target) == OK;
    },
    ranger: function(creep){
      if (Game.time % 5 === 0) console.log('===> RUN:', creep, creep.target);
        var range = creep.pos.getRangeTo(creep.target);
        if( !creep.flee ){
            if( creep.target instanceof Flag ){
                creep.travelTo( creep.target );
                return;
            } else if( creep.target instanceof ConstructionSite ){
                creep.travelTo( creep.target, {range:0});
                return;
            }
            if( range > 3 ){
                creep.travelTo( creep.target );
            }
            if( range < 3 ){
                creep.move(creep.target.pos.getDirectionTo(creep));
            }
        }
        // attack
        var targets = creep.pos.findInRange(creep.room.hostiles, 3);
        if(targets.length > 2) { // TODO: calc damage dealt
            if(CHATTY) creep.say('MassAttack');
            creep.attackingRanged = creep.rangedMassAttack() == OK;
            return;
        }
        if( range < 4 ) {
            creep.attackingRanged = creep.rangedAttack(creep.target) == OK;
            return;
        }
        if(targets.length > 0){
            creep.attackingRanged = creep.rangedAttack(targets[0]) == OK;
        }
    }
};
action.onAssignment = function(creep, target) {
    if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9876), SAY_PUBLIC);
};
action.defaultStrategy.moveOptions = function(options) {
    // allow routing in and through hostile rooms
    if (_.isUndefined(options.allowHostile)) options.allowHostile = true;
    return options;
};