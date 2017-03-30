
let mod = {
  // data: {
  //   squads: [
  //     squadName: {
  //       creeps: [],
  //       reinforce: true,
  //       boostRoom: '',
  //       buildRoom: '',
  //       stagingFlag: Game.flags[''],
  //       melee: [],
  //       ranged: [],
  //       healer: [],
  //       dismantler: [],
  //     }
  //   ],
  // },
  setSquadTarget: function(squad, target) {
    console.log('squadTarget', squad, target);
    // create squad invasion flag at target (red/red or blue/red)
    // creeps that are boosted or renewed head to this flag and invade
  },
  clearSquad: function(squad) {
    console.log('clearing', squad);
    var flag = Game.flags[squad];
    var creeps = Memory.army[squad].creeps || null;
    if (creeps.length) {
      // assign recycling action to all in creeps if alive
      creeps.forEach((c) => {
        if (Game.creeps[c.creepName]) { Creep.action.recycling.assign(Game.creeps[c.creepName]);
        }
      });
    }
    if (Memory.army[squad]) { 
      // clear the memory
      delete Memory.army[squad];
    }
    // delete the flag
    if (flag) flag.remove();
    console.log(squad, 'deleted');
  },
  // Army.createSquad(`sq${Game.time}`, 1, 1, 1, 1, false, Game.rooms['W7N3'], Game.rooms['W7N3'], [TOUGH, MOVE],[TOUGH, MOVE],[TOUGH, MOVE],[TOUGH, MOVE] )
  // Army.createSquad(`sq${Game.time}`, 1, 1, 1, 1, false, Game.rooms['W7N3'], Game.rooms['W7N3'] )
  // Army.createSquad(`sq${Game.time}`, [{ type: 'melee', count: 1, boosts: [TOUGH]}, { type: 'healer', count: 1, boosts: [TOUGH]}, { type: 'dismanter', count: 1, boosts: [TOUGH]}, ], false, ['W7N3', 'W8N3'], 'W7N3' )
  // Army.createSquad(`sq${Game.time}`, [{ type: 'melee', count: 1, boosts: [TOUGH]}, { type: 'healer', count: 1, boosts: [TOUGH]}], false, ['W7N3', 'W8N3'], 'W7N3' )
  // Army.createSquad(`sq${Game.time}`, [{ type: 'melee', count: 1, boosts: [TOUGH, ATTACK]}, { type: 'ranger', count: 1, boosts: [TOUGH]}, { type: 'healer', count: 1, boosts: [TOUGH]}], false, ['W7N3', 'W8N3'], 'W7N3' )
  createSquad: function(
    squadName = 'squad1',
    creeps,
    reinforce = false,
    buildRooms,
    stagingRoom,
    queue = 'High'
  ) {
    // save army.squads into memory if first run
    if (Memory.army === undefined) {
      console.log('set army 1st time');
      Memory.army = {};
    };
    // staging / build vars
    var staging = Game.rooms[stagingRoom];
    var roomIndex = 0; // for multi builds
    // var buildRoom = buildRooms[roomIndex]; // default
    var rotatingBuild = false;
    if (buildRooms.length > 1) {
      rotatingBuild = true;
    }
    // ensure room has a squad flag
    let pos = new RoomPosition(28, 12, Game.rooms[stagingRoom].name);
    if (!Game.flags[squadName]) {
      Game.rooms[stagingRoom].createFlag(pos, squadName, FLAG_COLOR.army.squad.color, FLAG_COLOR.army.squad.secondaryColor);
    } else {logError('squad already exists, must be a reinforce or err')}
    var currentTypeName;
    var currentTypeCount = 0;
    var creepTypes = {};
    // for each type of creep
    for (var i = 0; i < creeps.length; i++) {
      console.log(JSON.stringify(creeps[i]));
      // console.log('squad builds out of:', buildRooms.length, buildRooms);
      // console.log('rI', buildRooms[roomIndex]);
      // for each individual creep of this creepType, push to buildQueue
      var count = creeps[i].count;
      var type = creeps[i].type;
      creepTypes[type] = {
        count,
        boosts: creeps[i].boosts,
      };
      for (var j = 0; j < count; j++) {
        var creepName = `${squadName}-${type}`;
        var currentBuildRoom = buildRooms[roomIndex];
        currentTypeCount++;
        currentTypeName = type;
        console.log('=>>', count, type);
        console.log(currentTypeName, currentTypeCount);
/*        // if spawning multiple, check if we have enough in queue already
        var queuedCreepsOfType = _.filter(Memory.rooms[currentBuildRoom].spawnQueueHigh, {name: creepName});
        if (queuedCreepsOfType.length) {
          if (queuedCreepsOfType >= (count - 1)) {
            console.log(creepName, `${queuedCreepsOfType} enough creeps of ${type} arleady in q ${count} ${Memory.rooms[currentBuildRoom].spawnQueueHigh.length}`);
            continue;
          }
        }*/
        console.log(`building ${creepName} out of ${Game.rooms[currentBuildRoom]}`);
        Game.rooms[currentBuildRoom].spawnQueueHigh.push({
          parts: this.setups[type].fixedBody,
          name:creepName,
          setup:type,
          squadName,
          destiny: {
            squad: squadName,
            flagName: squadName,
            targetName: squadName,
            task: 'guard',
            stagingRoom: stagingRoom,
            boosts: creeps[i].boosts
          }
        });
      }
      // now update roomIndex so next creep is rotated
      if (rotatingBuild) {
        if (roomIndex === (buildRooms.length - 1)) {
          roomIndex = 0;
        } else {
          roomIndex++;
        }
      }
    }
    // initialise squad in memory if undefined
    if (!Memory.army[squadName]) {
      Memory.army[squadName] = {
        buildRooms,
        stagingRoom,
        reinforce,
        creeps: [],
        creepTypes,
      };
    }
  },
  registerCreep: function(squadName, creepName, creepType, boosts) {
    console.log(`registerCreep ${creepName} ${squadName} ${creepType} ${boosts}`);
    // check squad exists
    if (Memory.army[squadName]) {
      console.log('squad exists');
      // iterate registered creeps
      if (_.some(Memory.army[squadName].creeps, { creepName: creepName })) {
        console.log('CREEP REGISTRED ALREADY');
      } else {
        console.log('not here, push');
        Memory.army[squadName].creeps.push({ creepName, creepType, boosts });
        console.log(creepName, 'army registered');
      }
      
/*      Memory.army[squadName].creeps.forEach((c) => {
        console.log('c', c);
        // if one matches creepName, it's already reg'd, so return
        if (c.creepName === creepName) {
          // console.log(c.creepName, '=', creepName, 'already registered - leaving alone');
          // return;
          // if not. push to the memory
        } else {
          // console.log('!', c.creepName, creepName);
          Memory.army[squadName].creeps.push({ creepName, creepType, boosts });
          console.log(creepName, 'army registered');
        }
      });*/
    } else {
      console.log('squad doesnt exist', creepName, squadName, creepType, boosts);
    }
  },
  // buildSquadCreep: function(squad, type, count, stagingRoom, boosts, queue) {
  //   // for (var i = 1; i <= count; i++) {
  //   //   
  //   // }
  //   // for (var i = 1; i <= meleeCount; i++) {
  //   //   var creepName;
  //   //   creepName = `MEL-${squadName}`;
  //   //   room.spawnQueueHigh.push({parts:[TOUGH, MOVE, MOVE,ATTACK],name:creepName,setup:'melee', destiny: {squad: squadName, flagName: squadName, targetName: squadName, task: 'guard', stagingRoom: stagingRoom, boosts: boostsMelee}});
  //   //   melee.creeps.push(`${creepName}-${i}`);
  //   // }
  // },
  // Army.reinforceSquad('sq543469')
  cleanup: function(squadName) {
    var squad = Memory.army[squadName];
    squad.creeps.forEach((c) => {
      if (!Game.creeps[c]) {
        // console.log(c, 'needs cleanup');
      }
    });
  },
  reinforceSquad: function(squadName) {
    // this.cleanup(squadName);
    // console.log('rS', squadName);
    var squad = Memory.army[squadName];
    if (!Memory.army[squadName].reinforce) {
      console.log(squadName, 'reinforce=false, returning');
      return;
    }
    // get all registered creeps in squad
    var creepsInSquad = _.filter(Memory.population, {destiny: {squad: squadName}});
    // get each type
    for(type in squad.creepTypes) {
      // deduct existing creeps from the target count
      var target = squad.creepTypes[type].count;
      var existing = _.filter(creepsInSquad, {creepType: type});
      // console.log('=> target:', type, target);
      // console.log('=> existing:', existing.length);
      var required = target - existing.length;
      // console.log('=== required:', required);
      // spawn in new creeps if required
      if (required > 0) {
        Army.createSquad(squadName, [{ type: type, count: required, boosts: squad.creepTypes[type].boosts}], squad.reinforce, squad.buildRooms, squad.stagingRoom );
        console.log(`reinforcing ${required} creep`);
      } else {
        // console.log(`no need to reinforce ${required} creeps`);
      }
    }
/*    squad.creeps.forEach((c) => {
      // console.log(c.creepName, c.creepType);
      if (!Game.creeps[c.creepName]) {
        console.log(c.creepName, 'is DEAD needs respawning');
        // console.log(`> REINFORCING: ${squadName} ${c.creepType} ${c.boosts} ${squad.reinforce} ${squad.buildRooms} ${squad.stagingRoom}`);
        Army.createSquad(squadName, [{ type: c.creepType, count: 1, boosts: c.boosts}], squad.reinforce, squad.buildRooms, squad.stagingRoom )
      } else {
        console.log(c.creepName, Game.creeps[c.creepName].pos.roomName, Game.creeps[c.creepName].ticksToLive, 'no need reinforce');
      }
    });*/
  },
  // clearSquad: function(squad) {
  //   if (Memory.army[squad]) {
  //     delete Memory.army[squad];
  //     console.log(squad, 'deleted');
  //   } else {
  //     console.log('clearSquad failed on', squad);
  //   }
  // },
  // clearSquads: function() {
  //   Memory.army = {};
  //   console.log('squads cleared');
  // },
  setups: {
    ranger: {
        fixedBody: [RANGED_ATTACK, MOVE],
        multiBody: [TOUGH, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE],
        name: "ranger", 
        behaviour: "ranger", 
        queue: 'High'
    },
    melee: {
        fixedBody: [ATTACK, MOVE],
        multiBody: [TOUGH, ATTACK, ATTACK, MOVE, MOVE],
        name: "melee", 
        behaviour: "ranger", 
        queue: 'High'
    },
    healer: {
        fixedBody: [HEAL, MOVE],
        multiBody: [TOUGH, HEAL, HEAL, HEAL, MOVE, MOVE],
        name: "healer", 
        behaviour: "healer", 
        queue: 'High'
    },
    dismantler: {
        fixedBody: [WORK, MOVE],
        multiBody: [TOUGH, WORK, WORK, MOVE, MOVE],
        name: "dismantler", 
        behaviour: "ranger", 
        queue: 'High'
    },
  },
};

mod.creep = {
  //
  ranger: {
      fixedBody: [
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
        HEAL
      ],
      multiBody: [TOUGH, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE],
      name: "ranger", 
      behaviour: "ranger", 
      queue: 'High'
  },
  melee: {
    fixedBody: [
      TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE, MOVE, MOVE,
      ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
      HEAL
    ],
      multiBody: [TOUGH, ATTACK, ATTACK, MOVE, MOVE],
      name: "melee", 
      behaviour: "ranger", 
      queue: 'High'
  },
  healer: {
    fixedBody: [
      TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE, MOVE, MOVE,
      HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
    ],
      multiBody: [TOUGH, HEAL, HEAL, HEAL, MOVE, MOVE],
      name: "healer", 
      behaviour: "healer", 
      queue: 'High'
  },
  dismantler: {
    fixedBody: [
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK
    ],
      multiBody: [TOUGH, WORK, WORK, MOVE, MOVE],
      name: "dismantler", 
      behaviour: "ranger", 
      queue: 'High'
  },
  //
    ranger: {
        fixedBody: [RANGED_ATTACK, MOVE],
        multiBody: [TOUGH, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE],
        name: "ranger", 
        behaviour: "ranger", 
        queue: 'High'
    },
    melee: {
        fixedBody: [ATTACK, MOVE],
        multiBody: [TOUGH, ATTACK, ATTACK, MOVE, MOVE],
        name: "melee", 
        behaviour: "ranger", 
        queue: 'High'
    },
    healer: {
        fixedBody: [HEAL, MOVE],
        multiBody: [TOUGH, HEAL, HEAL, HEAL, MOVE, MOVE],
        name: "healer", 
        behaviour: "healer", 
        queue: 'High'
    },
    dismantler: {
        fixedBody: [WORK, MOVE],
        multiBody: [TOUGH, WORK, WORK, MOVE, MOVE],
        name: "dismantler", 
        behaviour: "ranger", 
        queue: 'High'
    },
};

module.exports = mod;
