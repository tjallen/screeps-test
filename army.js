
let mod = {
  /*
    Push ONE creep for a squad into the spawn queue
  */
  spawnSingleSquadCreep(squadName, type, boosts, buildRoom, stagingRoom) {
    var room = Game.rooms[buildRoom];
    var creepName = `${squadName}-${type}`;
    console.log(`[] => building ${creepName} out of ${buildRoom}`);
    var newSpawn = {
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
        boosts,
      }
    }
    room.spawnQueueHigh.push(newSpawn);
  },
  /*
    Top level function to create a squad
  */
  createSquad: function(squadName, creeps, reinforce, buildRooms, stagingRoom
  ) {
    // type count object to populate & submit to registerSquad()
    var creepTypes = {};
    // ensure room has a squad flag
    let pos = new RoomPosition(28, 12, Game.rooms[stagingRoom].name);
    if (!Game.flags[squadName]) {
      Game.rooms[stagingRoom].createFlag(pos, squadName, FLAG_COLOR.army.squad.color, FLAG_COLOR.army.squad.secondaryColor);
    }
    // loop each TYPE of creep
    for (var i = 0; i < creeps.length; i++) {
      console.log(JSON.stringify(creeps[i]));
      // just readability vars
      var count = creeps[i].count;
      var type = creeps[i].type;
      var boosts = creeps[i].boosts;
      creepTypes[type] = {
        count,
        boosts,
      };
      // spawn each INDIVIDUAL CREEP of that type
      this.spawnMultipleSquadCreeps(count, squadName, type, boosts, buildRooms, stagingRoom);
    }
    // finally update the Memory.army[squad]
    Army.registerSquad(squadName, buildRooms, stagingRoom, reinforce, creepTypes);
  },
  /*
    Spawn single creep n times, rotate between rooms if buildRooms.length
  */
  spawnMultipleSquadCreeps: function(count, squadName, type, boosts, buildRooms, stagingRoom) {
    console.log(`[] [] [] => mspawn: ${count} ${type} from ${buildRooms.length} rooms`);
    // variables for rotating build through multiple rooms
    var buildRoomIndex = 0;
    var rotatingBuild = buildRooms.length > 1 ? true : false;
    for (var i = 0; i < count; i++) {
      var buildRoom = buildRooms[buildRoomIndex]
      // actually spawn the creep
      this.spawnSingleSquadCreep(squadName, type, boosts, buildRoom, stagingRoom);
      // now update buildRoomIndex so next creep is rotated
      // increase index after each spawn or wrap back to 0 if at end of array
      if (rotatingBuild) {
        if (buildRoomIndex === (buildRooms.length - 1)) {
          buildRoomIndex = 0;
        } else {
          buildRoomIndex++;
        }
      }
    };
  },
  /*
    Register a squad in Memory.army
  */
  registerSquad: function(squadName, buildRooms, stagingRoom, reinforce, creepTypes) {
    console.log(`===> registerSquad ${squadName} ${buildRooms} ${stagingRoom} ${reinforce}`);
    // save army.squads into memory if first run
    if (Memory.army === undefined) {
      console.log('Memory.army was set for the first time');
      Memory.army = {};
    };
    // initialise squad in memory if undefined or malformed object
    if (!Memory.army[squadName] || Object.keys(Memory.army[squadName]).length === 0) {
      Memory.army[squadName] = {
        buildRooms,
        stagingRoom,
        reinforce,
        creeps: [],
        creepTypes,
      };
      console.log(`Memory.army[${squadName}] was set for the first time`);
    };
  },
  /*
    Register a creep in Memory.army[squadName]
  */
  registerCreep: function(squadName, creepName, creepType, boosts) {
    console.log(`===> registerCreep ${creepName} ${squadName} ${creepType} ${boosts}`);
    if (Memory.army[squadName]) {
      if (Memory.army[squadName].creeps) {
        // is it already registered
        if (_.some(Memory.army[squadName].creeps, { creepName: creepName })) {
          console.log(creepName, 'registerCreep: was previously registered');
        } else {
          // if not, push
          Memory.army[squadName].creeps.push({ creepName, creepType, boosts });
          console.log(creepName, 'registerCreep: creep successfully registered');
        }
      } else {
        logError(`registerCreep squad.creeps not found in ${squadName}`)
      }
    } else {
      logError(`registerCreep squad ${squadName} not found`)
    }
  },
  /*
    Deduce number of creeps needed to respawn squad and add to build queues
  */
  reinforceSquad: function(squadName) {
  // console.log('===================', Game.time, 'rS', squadName);
    var squad = Memory.army[squadName];
    if (!Memory.army[squadName].reinforce) {
    // console.log(squadName, 'reinforce=false, returning');
      return;
    }
    // get all registered creeps in squad
    var creepsInSquad = _.filter(Memory.population, {destiny: {squad: squadName}});
    // iterate by type
    for(type in squad.creepTypes) {
      // check number of existing creeps
      var target = squad.creepTypes[type].count;
      var existing = _.filter(creepsInSquad, {creepType: type}).length;
      // check number of creeps in spawn queues
      squad.buildRooms.forEach((room) => {
        var queuedCreepsOfType = _.filter(Memory.rooms[room].spawnQueueHigh, {setup:type, destiny: {squad: squadName}});
        // console.log('qC', queuedCreepsOfType.length);
        if (queuedCreepsOfType.length) {
          existing += queuedCreepsOfType.length;
        }
      });
      // deduct existing creeps from the target count to get the difference
      var required = (target - existing);
      // spawn in new creeps if required
      if (required > 0) {
        // console.log(`=====> REINFORCE: (${type}: ${target} - ${existing}) = ${required}`);
        this.spawnMultipleSquadCreeps(required, squadName, type, squad.creepTypes[type].boosts, squad.buildRooms, squad.stagingRoom);
      } else {
        // console.log(`=====> NOINF: (${type}: ${target} - ${existing}) = ${required}`);
      }
    }
  },
  /*
    Clear existing squad: Assign recycling action to squad creeps & clear Memory
  */
  clearSquad: function(squadName) {
    console.log('=> [-] clearing', squadName);
    var flag = Game.flags[squadName];
    var creeps = Memory.army[squadName].creeps || null;
    if (creeps.length) {
      creeps.forEach((c) => {
        if (Game.creeps[c.creepName]) { Creep.action.recycling.assign(Game.creeps[c.creepName]);
        }
      });
    }
    if (Memory.army[squadName]) { 
      delete Memory.army[squadName];
    }
    if (flag) flag.remove();
    console.log(`[X] => ${squadName} deleted`);
  },

  setups: {
    // ranger: {
    //     fixedBody: [RANGED_ATTACK, MOVE],
    //     multiBody: [TOUGH, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE],
    //     name: "ranger", 
    //     behaviour: "ranger", 
    //     queue: 'High'
    // },
    // melee: {
    //     fixedBody: [ATTACK, MOVE],
    //     multiBody: [TOUGH, ATTACK, ATTACK, MOVE, MOVE],
    //     name: "melee", 
    //     behaviour: "ranger", 
    //     queue: 'High'
    // },
    // healer: {
    //     fixedBody: [HEAL, MOVE],
    //     multiBody: [TOUGH, HEAL, HEAL, HEAL, MOVE, MOVE],
    //     name: "healer", 
    //     behaviour: "healer", 
    //     queue: 'High'
    // },
    // dismantler: {
    //     fixedBody: [WORK, MOVE],
    //     multiBody: [TOUGH, WORK, WORK, MOVE, MOVE],
    //     name: "dismantler", 
    //     behaviour: "ranger", 
    //     queue: 'High'
    // },
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
